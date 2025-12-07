import getPool from '../config/db.js'

export class PokemonModel {
    static async findAllByUserId(userId) {
        const pool = getPool()
        const sql = 'SELECT * FROM user_pokemons WHERE user_id = ?'
        const [rows] = await pool.query(sql, [userId])
        return rows
    }

    static async create ({ userId, name, apiId, type, image }) {
        const pool = getPool()
        const sql = 'INSERT INTO user_pokemons (user_id, name, api_id, type, image) VALUES (?, ?, ?, ?, ?)'
        const [result] = await pool.query(sql, [userId, name, apiId, type, image])
        return { id: result.insertId, userId, name, apiId, type, image }
    }

    static async update(id, { name }) {
        const pool = getPool()
        const sql = 'UPDATE user_pokemons SET name = ? WHERE id = ? AND user_id = ?'
        const [result] = await pool.query(sql, [name, id, userId])
        return result.affectedRows > 0
    }

    static async delete(id) {
        const pool = getPool()
        const sql = 'DELETE FROM user_pokemons WHERE id = ? AND user_id = ?'
        const [result] = await pool.query(sql, [id, userId])
        return result.affectedRows > 0
    }
}

