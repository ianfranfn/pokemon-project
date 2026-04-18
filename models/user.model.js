import getPool from '../config/db.js';

export class UserModel {
  static async findByEmail(email) {
    const pool = getPool();
    const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  }

  static async findByNickname(nickname) {
    const pool = getPool();
    const [rows] = await pool.execute('SELECT * FROM users WHERE nickname = ?', [nickname]);
    return rows[0];
  }

  static async findByIdentifier(identifier) {
    const pool = getPool();
    const sql = 'SELECT * FROM users WHERE email = ? OR nickname = ?';
    const [rows] = await pool.query(sql, [identifier, identifier]);
    return rows[0];
  }

  static async create({ email, passwordHash, nickname }) {
    const pool = getPool();
    const [result] = await pool.execute(
      'INSERT INTO users (email, password_hash, nickname) VALUES (?, ?, ?)',
      [email, passwordHash, nickname]
    );
    return { id: result.insertId, email, nickname };
  }

  static async updateDailyReward(id, newCoins, dateString) {
    const pool = getPool();
    await pool.execute(
      'UPDATE users SET coins = ?, last_login_date = ? WHERE id = ?',
      [newCoins, dateString, id]
    );
  }
}
