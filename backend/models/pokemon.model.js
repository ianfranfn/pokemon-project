import getPool from '../config/db.js';

export class PokemonModel {
  static async findAllByUserId(userId, limit, offset) {
    const pool = getPool();

    // ensure that limit and offset are numbers using Number()
    const sqlData = 'SELECT * FROM user_pokemons WHERE user_id = ? LIMIT ? OFFSET ?';
    const [rows] = await pool.query(sqlData, [userId, Number(limit), Number(offset)]);

    // Query to count the TOTAL for that user (no limit)
    const sqlCount = 'SELECT COUNT(*) as total FROM user_pokemons WHERE user_id = ?';
    const [totalResult] = await pool.query(sqlCount, [userId]);

    return {
      rows,
      totalItems: totalResult[0].total,
    };
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
        'SELECT id, nickname, coins FROM users WHERE id = ? FOR UPDATE',
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
}
