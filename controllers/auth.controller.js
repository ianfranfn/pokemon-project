import { config } from "../config"
import jwt from 'jsonwebtoken'

const testUsers = [
    { id: '123', email: 'user@test.com', password: 'password123' }
]

function findUserByCredentials(email, password) {
    return testUsers.find(user => user.email === email && user.password === password) // With DB, this will use bcrypt and mysql
}

export const loginHandler = (req, res) => { // Handler for login route
    const { email, password } = req.body // validating inputs
    if (!email || !password) {
        return res.status(400).json({ error: 'email and password are required' })
    }

    const user = findUserByCredentials(email, password)

    if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' })
    }

    const payload = { email: user.email, id: user.id } // Information saved in the token if login is successful
    const accessToken = jwt.sign(payload, config.jwtSecret, { expiresIn: '1h' })
    res.json({ accessToken })
}