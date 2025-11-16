import { config } from "../config"
import jwt from 'jsonwebtoken'
import bcrypt from "bcryptjs"
import { findByEmail } from "../models/user.model"


export const loginHandler = async (req, res) => { // Handler for login route
    const { email, password } = req.body // validating inputs
    if (!email || !password) {
        return res.status(400).json({ error: 'email and password are required' })
    }

    try {
        const user = await findByEmail(email)

        if (!user) { // User not found
            console.log('Failed login: User not found');
            return res.status(401).json({ error: 'Invalid email or password' })
        }

        const isMatch = await bcrypt.compare(password, user.password_hash) // if the user exists, compare the password

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
