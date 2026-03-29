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

  static async create({ email, passwordHash, nickname }) {
    const pool = getPool();
    const [result] = await pool.execute(
      'INSERT INTO users (email, password_hash, nickname) VALUES (?, ?, ?)',
      [email, passwordHash, nickname]
    );
    return { id: result.insertId, email, nickname };
  }
}
