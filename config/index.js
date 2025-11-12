import 'dotenv/config'

export const config = {
    jwtSecret: process.env.JWT_SECRET || 'secretkey',
    port: process.env.PORT || 3000
}