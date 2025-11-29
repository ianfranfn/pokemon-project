import { getJwtSecret } from '../config/config.helper'
import jwt from 'jsonwebtoken'

export const verifyToken = (req, res, next) => { // Middleware to verify JWT tokens
    console.log("verifying token...")

    const authHeader = req.headers.authorization // looking for the Authorization header

    if (!authHeader) {
        console.log('No token provided')
        return res.status(401).json({ error: 'Authorization header missing' })
    }

    const token = authHeader.split(' ')[1] 

    if (!token) { // No token provided
        console.log("No token provided")
        return res.status(401).json({ error: 'No token provided' })
    }
    
    try {
        console.log('verifying token:')
        const payload = jwt.verify(token, getJwtSecret()) // Verifying the token using the secret
        req.user = payload // Storing the payload in the request object for later use
        next() // Proceed to the next middleware or route handler
        
    } catch (error) {
        console.error("Error verifying token:", error.message)
        return res.status(403).json({ error: "Invalid or expired token" })
    }
}