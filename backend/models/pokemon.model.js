import getPool from '../config/db.js';

let legacyPokemonTableExists;
let userPokemonColumns;
let purchaseHistoryTableExists;
let shopItemsTableExists;

const mapPurchaseHistoryRow = (row) => ({
  id: row.id,
  pokemonId: row.pokemon_id,
  apiId: row.api_id,
  name: row.name,
  price: row.price,
  rarity: row.rarity,
  source: row.source,
  purchasedAt: row.purchased_at,
});

const STARTER_API_IDS = new Set([1, 4]);

export class PokemonModel {
  static async getUserPokemonColumns(executor = getPool()) {
    if (userPokemonColumns) {
      return userPokemonColumns;
    }

    const [rows] = await executor.query(
      `SELECT column_name
       FROM information_schema.columns
       WHERE table_schema = DATABASE()
         AND table_name = 'user_pokemons'`
    );

    userPokemonColumns = new Set(rows.map((row) => row.column_name));
    return userPokemonColumns;
  }

  static async hasLegacyPokemonTable(executor = getPool()) {
    if (legacyPokemonTableExists !== undefined) {
      return legacyPokemonTableExists;
    }

    const [rows] = await executor.query(
      `SELECT COUNT(*) AS tableCount
       FROM information_schema.tables
       WHERE table_schema = DATABASE()
         AND table_name = 'pokemons'`
    );

    legacyPokemonTableExists = rows[0].tableCount > 0;
    return legacyPokemonTableExists;
  }

  static async hasPurchaseHistoryTable(executor = getPool()) {
    if (purchaseHistoryTableExists !== undefined) {
      return purchaseHistoryTableExists;
    }

    const [rows] = await executor.query(
      `SELECT COUNT(*) AS tableCount
       FROM information_schema.tables
       WHERE table_schema = DATABASE()
         AND table_name = 'purchase_history'`
    );

    purchaseHistoryTableExists = rows[0].tableCount > 0;
    return purchaseHistoryTableExists;
  }

  static async hasShopItemsTable(executor = getPool()) {
    if (shopItemsTableExists !== undefined) {
      return shopItemsTableExists;
    }

    const [rows] = await executor.query(
      `SELECT COUNT(*) AS tableCount
       FROM information_schema.tables
       WHERE table_schema = DATABASE()
         AND table_name = 'shop_items'`
    );

    shopItemsTableExists = rows[0].tableCount > 0;
    return shopItemsTableExists;
  }

  static async findAllByUserId(userId, limit, offset) {
    const pool = getPool();
    const hasLegacyTable = await PokemonModel.hasLegacyPokemonTable(pool);
    const columns = await PokemonModel.getUserPokemonColumns(pool);
    const sourceColumn = columns.has('source') ? 'source' : "'starter'";
    const purchasePriceColumn = columns.has('purchase_price') ? 'purchase_price' : '0';

    const sourceQuery = hasLegacyTable
      ? `SELECT id, user_id, name, api_id, type, image, created_at, ${sourceColumn} AS source, ${purchasePriceColumn} AS purchase_price
         FROM user_pokemons
         WHERE user_id = ?
         UNION ALL
         SELECT id, user_id, name, pokemon_id AS api_id, type, image, NULL AS created_at, 'legacy' AS source, 0 AS purchase_price
         FROM pokemons
         WHERE user_id = ?`
      : `SELECT id, user_id, name, api_id, type, image, created_at, ${sourceColumn} AS source, ${purchasePriceColumn} AS purchase_price
         FROM user_pokemons
         WHERE user_id = ?`;

    const sourceParams = hasLegacyTable ? [userId, userId] : [userId];

    const [rows] = await pool.query(
      `SELECT * FROM (${sourceQuery}) AS owned_pokemons
       ORDER BY id DESC
       LIMIT ? OFFSET ?`,
      [...sourceParams, Number(limit), Number(offset)]
    );

    const [totalResult] = await pool.query(
      `SELECT COUNT(*) AS total FROM (${sourceQuery}) AS owned_pokemons`,
      sourceParams
    );

    const enrichedRows = await PokemonModel.enrichOwnedPokemonMetadata(userId, rows, pool);

    return {
      rows: enrichedRows,
      totalItems: totalResult[0].total,
    };
  }

  static async enrichOwnedPokemonMetadata(userId, rows, executor = getPool()) {
    if (rows.length === 0) {
      return rows;
    }

    const apiIds = Array.from(new Set(rows.map((row) => Number(row.api_id)).filter(Boolean)));
    const historyByApiId = new Map();
    const shopItemByApiId = new Map();

    if (apiIds.length === 0) {
      return rows;
    }

    if (await PokemonModel.hasPurchaseHistoryTable(executor)) {
      const placeholders = apiIds.map(() => '?').join(', ');
      const [historyRows] = await executor.query(
        `SELECT ph.api_id, ph.price, ph.source
         FROM purchase_history ph
         INNER JOIN (
           SELECT api_id, MAX(id) AS id
           FROM purchase_history
           WHERE user_id = ?
             AND api_id IN (${placeholders})
           GROUP BY api_id
         ) latest_purchase ON latest_purchase.id = ph.id`,
        [userId, ...apiIds]
      );

      for (const historyRow of historyRows) {
        historyByApiId.set(Number(historyRow.api_id), {
          price: Number(historyRow.price),
          source: historyRow.source || 'shop',
        });
      }
    }

    if (await PokemonModel.hasShopItemsTable(executor)) {
      const placeholders = apiIds.map(() => '?').join(', ');
      const [shopRows] = await executor.query(
        `SELECT api_id, price
         FROM shop_items
         WHERE api_id IN (${placeholders})`,
        apiIds
      );

      for (const shopRow of shopRows) {
        shopItemByApiId.set(Number(shopRow.api_id), {
          price: Number(shopRow.price),
        });
      }
    }

    return rows.map((row) => {
      const apiId = Number(row.api_id);
      const currentPrice = Number(row.purchase_price || 0);
      const history = historyByApiId.get(apiId);
      const shopItem = shopItemByApiId.get(apiId);
      const canInferFromShopItem = shopItem && !STARTER_API_IDS.has(apiId);
      const inferredPrice =
        currentPrice || history?.price || (canInferFromShopItem ? shopItem.price : 0);
      const source =
        row.source === 'shop' ||
        history ||
        currentPrice > 0 ||
        canInferFromShopItem
          ? 'shop'
          : row.source || 'starter';

      return {
        ...row,
        source,
        purchase_price: inferredPrice,
      };
    });
  }

  static async findOwnedApiIdsByUserId(userId) {
    const pool = getPool();
    const hasLegacyTable = await PokemonModel.hasLegacyPokemonTable(pool);

    const sourceQuery = hasLegacyTable
      ? `SELECT api_id
         FROM user_pokemons
         WHERE user_id = ?
         UNION
         SELECT pokemon_id AS api_id
         FROM pokemons
         WHERE user_id = ?`
      : `SELECT api_id
         FROM user_pokemons
         WHERE user_id = ?`;

    const sourceParams = hasLegacyTable ? [userId, userId] : [userId];
    const [rows] = await pool.query(sourceQuery, sourceParams);

    return rows.map((row) => Number(row.api_id));
  }

  static async create({ userId, name, apiId, type, image, source = 'manual', purchasePrice = 0 }) {
    const pool = getPool();
    const columns = await PokemonModel.getUserPokemonColumns(pool);
    const insertColumns = ['user_id', 'name', 'api_id', 'type', 'image'];
    const values = [userId, name, apiId, type, image];

    if (columns.has('source')) {
      insertColumns.push('source');
      values.push(source);
    }

    if (columns.has('purchase_price')) {
      insertColumns.push('purchase_price');
      values.push(purchasePrice);
    }

    const placeholders = insertColumns.map(() => '?').join(', ');
    const sql = `INSERT INTO user_pokemons (${insertColumns.join(', ')}) VALUES (${placeholders})`;
    const [result] = await pool.query(sql, values);
    return { id: result.insertId, userId, name, apiId, type, image, source, purchasePrice };
  }

  static async update(id, userId, { name }) {
    const pool = getPool();
    const sql = 'UPDATE user_pokemons SET name = ? WHERE id = ? AND user_id = ?';
    const [result] = await pool.query(sql, [name, id, userId]);
    return result.affectedRows > 0;
  }

  static async delete(id, userId) {
    const pool = getPool();
    const sql = 'DELETE FROM user_pokemons WHERE id = ? AND user_id = ?';
    const [result] = await pool.query(sql, [id, userId]);
    return result.affectedRows > 0;
  }

  static async addPokemonToUser(userId, pokemonData, executor = getPool()) {
    const {
      pokemon_id,
      apiId,
      api_id,
      name,
      type,
      image,
      source = 'starter',
      purchasePrice = 0,
    } = pokemonData;
    const normalizedApiId = apiId ?? api_id ?? pokemon_id;
    const columns = await PokemonModel.getUserPokemonColumns(executor);
    const insertColumns = ['user_id', 'name', 'api_id', 'type', 'image'];
    const values = [userId, name, normalizedApiId, type, image];

    if (columns.has('source')) {
      insertColumns.push('source');
      values.push(source);
    }

    if (columns.has('purchase_price')) {
      insertColumns.push('purchase_price');
      values.push(purchasePrice);
    }

    const placeholders = insertColumns.map(() => '?').join(', ');
    const [result] = await executor.execute(
      `INSERT INTO user_pokemons (${insertColumns.join(', ')}) VALUES (${placeholders})`,
      values
    );

    return {
      id: result.insertId,
      userId,
      apiId: normalizedApiId,
      name,
      type,
      image,
      source,
      purchasePrice,
    };
  }

  static async purchaseForUser(userId, pokemonData, price) {
    const pool = getPool();
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const [users] = await connection.execute(
        'SELECT id, nickname, coins, last_login_date FROM users WHERE id = ? FOR UPDATE',
        [userId]
      );
      const user = users[0];

      if (!user) {
        const error = new Error('User not found');
        error.statusCode = 404;
        throw error;
      }

      if (user.coins < price) {
        const error = new Error('Insufficient coins for this purchase');
        error.statusCode = 400;
        error.code = 'INSUFFICIENT_COINS';
        error.currentCoins = user.coins;
        error.requiredCoins = price;
        error.nextRewardAt = PokemonModel.getNextDailyRewardAt(user.last_login_date);
        throw error;
      }

      const newBalance = user.coins - price;
      await connection.execute('UPDATE users SET coins = ? WHERE id = ?', [newBalance, userId]);

      const pokemon = await PokemonModel.addPokemonToUser(
        userId,
        { ...pokemonData, source: 'shop', purchasePrice: price },
        connection
      );

      await PokemonModel.createPurchaseHistory(
        userId,
        { ...pokemon, rarity: pokemonData.rarity },
        price,
        connection
      );

      await connection.commit();

      return {
        newBalance,
        pokemon,
        user: {
          id: user.id,
          nickname: user.nickname,
        },
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async purchaseShopItemForUser(userId, pokemonData) {
    const pool = getPool();
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const [users] = await connection.execute(
        'SELECT id, nickname, coins, last_login_date FROM users WHERE id = ? FOR UPDATE',
        [userId]
      );
      const user = users[0];

      if (!user) {
        const error = new Error('User not found');
        error.statusCode = 404;
        throw error;
      }

      const [ownedRows] = await connection.execute(
        'SELECT id FROM user_pokemons WHERE user_id = ? AND api_id = ? LIMIT 1 FOR UPDATE',
        [userId, pokemonData.apiId]
      );

      if (ownedRows.length > 0) {
        const error = new Error('You already own this Pokemon.');
        error.statusCode = 409;
        error.code = 'ALREADY_OWNED';
        throw error;
      }

      const [shopRows] = await connection.execute(
        `SELECT api_id, price, rarity, stock, is_active
         FROM shop_items
         WHERE api_id = ?
         FOR UPDATE`,
        [pokemonData.apiId]
      );
      const shopItem = shopRows[0];

      if (!shopItem || !shopItem.is_active) {
        const error = new Error('This Pokemon is not available in the shop.');
        error.statusCode = 409;
        error.code = 'SHOP_ITEM_UNAVAILABLE';
        throw error;
      }

      if (shopItem.stock <= 0) {
        const error = new Error('This Pokemon is out of stock.');
        error.statusCode = 409;
        error.code = 'OUT_OF_STOCK';
        throw error;
      }

      if (user.coins < shopItem.price) {
        const error = new Error('Insufficient coins for this purchase');
        error.statusCode = 400;
        error.code = 'INSUFFICIENT_COINS';
        error.currentCoins = user.coins;
        error.requiredCoins = shopItem.price;
        error.nextRewardAt = PokemonModel.getNextDailyRewardAt(user.last_login_date);
        throw error;
      }

      const newBalance = user.coins - shopItem.price;
      const newStock = shopItem.stock - 1;

      await connection.execute('UPDATE users SET coins = ? WHERE id = ?', [newBalance, userId]);
      await connection.execute('UPDATE shop_items SET stock = ? WHERE api_id = ?', [
        newStock,
        pokemonData.apiId,
      ]);

      const pokemon = await PokemonModel.addPokemonToUser(
        userId,
        {
          ...pokemonData,
          rarity: shopItem.rarity,
          source: 'shop',
          purchasePrice: shopItem.price,
        },
        connection
      );

      await PokemonModel.createPurchaseHistory(
        userId,
        { ...pokemon, rarity: shopItem.rarity },
        shopItem.price,
        connection
      );

      await connection.commit();

      return {
        newBalance,
        pokemon,
        shopItem: {
          apiId: shopItem.api_id,
          price: shopItem.price,
          rarity: shopItem.rarity,
          stock: newStock,
        },
        user: {
          id: user.id,
          nickname: user.nickname,
        },
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static getNextDailyRewardAt(lastLoginDate) {
    const now = new Date();
    const todayString = now.toISOString().split('T')[0];

    if (!lastLoginDate) {
      return now.toISOString();
    }

    const lastLoginString = new Date(lastLoginDate).toISOString().split('T')[0];

    if (lastLoginString !== todayString) {
      return now.toISOString();
    }

    const nextRewardDate = new Date(now);
    nextRewardDate.setUTCHours(24, 0, 0, 0);
    return nextRewardDate.toISOString();
  }

  static async createPurchaseHistory(userId, pokemon, price, executor = getPool()) {
    const hasHistoryTable = await PokemonModel.hasPurchaseHistoryTable(executor);

    if (!hasHistoryTable) {
      return null;
    }

    const [result] = await executor.execute(
      `INSERT INTO purchase_history (user_id, pokemon_id, api_id, name, price, rarity, source)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        pokemon.id,
        pokemon.apiId,
        pokemon.name,
        price,
        pokemon.rarity || 'common',
        pokemon.source || 'shop',
      ]
    );

    return result.insertId;
  }

  static async findPurchaseHistoryByUserId(userId, limit = 20) {
    const pool = getPool();
    const hasHistoryTable = await PokemonModel.hasPurchaseHistoryTable(pool);

    if (!hasHistoryTable) {
      return [];
    }

    const [rows] = await pool.query(
      `SELECT id, pokemon_id, api_id, name, price, rarity, source, purchased_at
       FROM purchase_history
       WHERE user_id = ?
       ORDER BY purchased_at DESC, id DESC
       LIMIT ?`,
      [userId, Number(limit)]
    );

    return rows.map(mapPurchaseHistoryRow);
  }

  static async countPurchaseHistoryByApiIds(apiIds) {
    const pool = getPool();
    const hasHistoryTable = await PokemonModel.hasPurchaseHistoryTable(pool);

    if (!hasHistoryTable || apiIds.length === 0) {
      return new Map();
    }

    const placeholders = apiIds.map(() => '?').join(', ');
    const [rows] = await pool.query(
      `SELECT api_id, COUNT(*) AS purchase_count
       FROM purchase_history
       WHERE api_id IN (${placeholders})
       GROUP BY api_id`,
      apiIds
    );

    return new Map(rows.map((row) => [Number(row.api_id), Number(row.purchase_count)]));
  }

  static async findOrCreateShopItems(defaultItems) {
    const pool = getPool();
    const hasShopTable = await PokemonModel.hasShopItemsTable(pool);

    if (!hasShopTable || defaultItems.length === 0) {
      return new Map(defaultItems.map((item) => [Number(item.apiId), item]));
    }

    const values = defaultItems.flatMap((item) => [
      item.apiId,
      item.name,
      item.price,
      item.rarity,
      item.stock,
      true,
    ]);
    const placeholders = defaultItems.map(() => '(?, ?, ?, ?, ?, ?)').join(', ');

    await pool.query(
      `INSERT INTO shop_items (api_id, name, price, rarity, stock, is_active)
       VALUES ${placeholders}
       ON DUPLICATE KEY UPDATE name = VALUES(name)`,
      values
    );

    const apiIds = defaultItems.map((item) => item.apiId);
    const selectPlaceholders = apiIds.map(() => '?').join(', ');
    const [rows] = await pool.query(
      `SELECT api_id, name, price, rarity, stock, is_active
       FROM shop_items
       WHERE api_id IN (${selectPlaceholders})`,
      apiIds
    );

    return new Map(
      rows.map((row) => [
        Number(row.api_id),
        {
          apiId: Number(row.api_id),
          name: row.name,
          price: Number(row.price),
          rarity: row.rarity,
          stock: Number(row.stock),
          isActive: Boolean(row.is_active),
        },
      ])
    );
  }
}
