import express from 'express'
import { loginHandler } from '../controllers/auth.controller'
import { verifyToken } from '../middleware/auth.middleware.js'

const router = express.Router()

router.post('/login', loginHandler) // Route for user login

router.get('/home', verifyToken, (req, res) => {
    res.send(`Welcome to the page, ${req.user.email}!`)
})


export default router