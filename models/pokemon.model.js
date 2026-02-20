import getPool from '../config/db.js'

export class PokemonModel {
    static async findAllByUserId(userId, limit, offset) {
        const pool = getPool()

        // ensure that limit and offset are numbers using Number()
        const sqlData = 'SELECT * FROM user_pokemons WHERE user_id = ? LIMIT ? OFFSET ?'
        const [rows] = await pool.query(sqlData, [userId, Number(limit), Number(offset)])

        // Query to count the TOTAL for that user (no limit)
        const sqlCount = 'SELECT COUNT(*) as total FROM user_pokemons WHERE user_id = ?'
        const [totalResult] = await pool.query(sqlCount, [userId])

        return {
          rows,
          totalItems: totalResult[0].total  
        } 
    }

    static async create ({ userId, name, apiId, type, image }) {
        const pool = getPool()
        const sql = 'INSERT INTO user_pokemons (user_id, name, api_id, type, image) VALUES (?, ?, ?, ?, ?)'
        const [result] = await pool.query(sql, [userId, name, apiId, type, image])
        return { id: result.insertId, userId, name, apiId, type, image }
    }

    static async update(id, { name }) {
        const pool = getPool()
        const sql = 'UPDATE user_pokemons SET name = ? WHERE id = ?'
        const [result] = await pool.query(sql, [name, id])
        return result.affectedRows > 0
    }

    static async delete(id) {
        const pool = getPool()
        const sql = 'DELETE FROM user_pokemons WHERE id = ?'
        const [result] = await pool.query(sql, [id])
        return result.affectedRows > 0
    }
}

