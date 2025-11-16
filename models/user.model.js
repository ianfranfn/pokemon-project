import pool from '../config/db.js';

export const findByEmail = async (email) => {
    const sql = "SELECT * FROM users WHERE email = ?";
    const [rows] = await pool.query(sql, [email]);
    
    if (rows.length === 0) {
        return null
    }
    return rows[0];
}