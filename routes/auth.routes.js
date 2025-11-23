import express from 'express'
import { loginHandler, registerHandler } from '../controllers/auth.controller'
import { verifyToken } from '../app.js'

const router = express.Router()

router.post('/login', loginHandler) // Route for user login
router.post('/register', registerHandler) // Route for user registration

router.get('/home', verifyToken, (req, res) => {
    res.send(`Welcome to the page, ${req.user.email}!`)
})
export default router