import getPool from '../config/db.js';

let legacyPokemonTableExists;
let userPokemonColumns;
let purchaseHistoryTableExists;

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

    return {
      rows,
      totalItems: totalResult[0].total,
    };
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
}
