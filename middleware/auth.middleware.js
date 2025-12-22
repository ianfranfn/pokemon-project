import { getJwtSecret } from '../config/config.helper.js'
import jwt from 'jsonwebtoken'

export const verifyToken = (req, res, next) => { // Middleware to verify JWT tokens
    logger.info("verifying token...")

    const authHeader = req.headers.authorization // looking for the Authorization header

    if (!authHeader) {
        logger.info('No token provided')
        return res.status(401).json({ error: 'Authorization header missing' })
    }

    const token = authHeader.split(' ')[1] 

    if (!token) { // No token provided
        logger.info("No token provided")
        return res.status(401).json({ error: 'No token provided' })
    }
    
    try {
        logger.info('verifying token:')
        const payload = jwt.verify(token, getJwtSecret()) // Verifying the token using the secret
        req.user = payload // Storing the payload in the request object for later use
        next() // Proceed to the next middleware or route handler
        
    } catch (error) {
        logger.error("Error verifying token:", error.message)
        return res.status(403).json({ error: "Invalid or expired token" })
    }
}