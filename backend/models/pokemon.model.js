import getPool from '../config/db.js';

let legacyPokemonTableExists;

export class PokemonModel {
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

  static async findAllByUserId(userId, limit, offset) {
    const pool = getPool();
    const hasLegacyTable = await PokemonModel.hasLegacyPokemonTable(pool);

    const sourceQuery = hasLegacyTable
      ? `SELECT id, user_id, name, api_id, type, image
         FROM user_pokemons
         WHERE user_id = ?
         UNION ALL
         SELECT id, user_id, name, pokemon_id AS api_id, type, image
         FROM pokemons
         WHERE user_id = ?`
      : `SELECT id, user_id, name, api_id, type, image
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

  static async create({ userId, name, apiId, type, image }) {
    const pool = getPool();
    const sql =
      'INSERT INTO user_pokemons (user_id, name, api_id, type, image) VALUES (?, ?, ?, ?, ?)';
    const [result] = await pool.query(sql, [userId, name, apiId, type, image]);
    return { id: result.insertId, userId, name, apiId, type, image };
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
    const { pokemon_id, apiId, api_id, name, type, image } = pokemonData;
    const normalizedApiId = apiId ?? api_id ?? pokemon_id;

    const [result] = await executor.execute(
      'INSERT INTO user_pokemons (user_id, name, api_id, type, image) VALUES (?, ?, ?, ?, ?)',
      [userId, name, normalizedApiId, type, image]
    );

    return {
      id: result.insertId,
      userId,
      apiId: normalizedApiId,
      name,
      type,
      image,
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

      const pokemon = await PokemonModel.addPokemonToUser(userId, pokemonData, connection);

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
}
