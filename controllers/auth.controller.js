import { getJwtSecret } from "../config/config.helper.js"
import jwt from 'jsonwebtoken'
import bcrypt from "bcryptjs"
import { UserModel } from "../models/user.model.js"

export const registerHandler = async (req, res) => {
    const { email, password } = req.body // validating inputs
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required for registration' })
    }

    try {
        const existingUser = await UserModel.findByEmail(email)
        if (existingUser) {
            return res.status(409).json({ error: 'User already exists' })
        }
        const salt = await bcrypt.genSalt(10) // Generating a salt for hashing
        const passwordHash = await bcrypt.hash(password,salt)
        const newUser = await UserModel.create ({email, passwordHash})
        console.log(`New user registered: ${newUser.email}`);

        return res.status(201).json ({ message: 'User registered successfully', userId: newUser.id })
    }
    catch (error) { 
        console.log('Registration error:', error);
        return res.status(500).json({ error: 'Internal server error' })
    }


}


export const loginHandler = async (req, res) => { // Handler for login route
    const { email, password } = req.body // validating inputs
    if (!email || !password) {
        return res.status(400).json({ error: 'email and password are required' })
    }

    try {
        const user = await UserModel.findByEmail(email)
        if (!user) {
            console.log('Failed login: No user found');
            return res.status(401).json({ error: 'Invalid email or password' })
        }

        const isMatch = await bcrypt.compare(password, user.password_hash)

        if (!isMatch) {
            console.log('Failed login: Password does not match');
            return res.status(401).json({ error: 'Invalid email or password' })
        }

        const payload = { email: user.email, id: user.id } // Information saved in the token if login is successful
        const accessToken = jwt.sign(
            payload,
            getJwtSecret(),
            { expiresIn: '1h' }
        )

        res.json({ accessToken: accessToken })

    } catch (error) {
        console.log('Login error', error);
        return res.status(500).json({ error: 'Internal server error' })
    }
}
