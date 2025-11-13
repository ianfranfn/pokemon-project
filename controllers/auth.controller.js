import { config } from "../config"
import jwt from 'jsonwebtoken'
import bcrypt from "bcryptjs"
import pool from '../config/db.js'


export const loginHandler = async (req, res) => { // Handler for login route
    const { email, password } = req.body // validating inputs
    if (!email || !password) {
        return res.status(400).json({ error: 'email and password are required' })
    }

    try {
        const sql = "SELECT * FROM users WHERE email = ?" // Query to find user by email
        const [rows] = await pool.query(sql, [email]) // Pool.query give [rows, fields]. I'll only use rows

        if (rows.length === 0) {
            console.log('Failed login: No user found');
            return res.status(401).json({ error: 'Invalid email or password' })
        }

        const user = rows[0]
        const isMatch = await bcrypt.compare(password, user.password_hash)

        if (!isMatch) {
            console.log('Failed login: Password does not match');
            return res.status(401).json({ error: 'Invalid email or password' })
        }

        const payload = { email: user.email, id: user.id } // Information saved in the token if login is successful
        const accessToken = jwt.sign(
            payload,
            config.jwtSecret,
            { expiresIn: '1h' }
        )

        res.json({ accessToken: accessToken })

    } catch (error) {
        console.log('Login error', error);
        return res.status(500).json({ error: 'Internal server error' })
    }
}
