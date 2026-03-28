import getPool from '../config/db.js';

export class EmailLogModel {
  static async create(userEmail) {
    const pool = getPool();
    const sql = 'INSERT INTO email_logs (user_email, status) VALUES (?, "pending")';
    const [result] = await pool.query(sql, [userEmail]);
    return result.insertId;
  }

  static async updateStatus(id, status, startedAt, completedAt) {
    const pool = getPool();
    const sql = 'UPDATE email_logs SET status = ?, started_at = ?, completed_at = ? WHERE id = ?';
    await pool.query(sql, [status, startedAt, completedAt, id]);
  }
}
