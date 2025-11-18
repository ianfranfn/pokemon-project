import getPool from '../config/db.js';

export class UserModel {

  static async findByEmail(email) {
    const pool = getPool()
    const sql = "SELECT * FROM users WHERE email = ?"
    const [rows] = await pool.query(sql, [email])

    if (rows.length === 0) {
      return null
    }
    return rows[0]
  }

  static async findById(id) {
    const pool = getPool()
    const sql = "SELECT * FROM users WHERE id = ?";
    const [rows] = await pool.query(sql, [id])

    if (rows.length === 0) {
      return null
    }
    return rows[0]
  }

  static async create({ email, passwordHash }) { 
    const pool = getPool()
    const sql = "INSERT INTO users (email, password_hash) VALUES (?, ?)"
    const [result] = await pool.query(sql, [email, passwordHash])

    return { id: result.insertId, email };
  }
}