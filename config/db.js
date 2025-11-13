import mysql from 'mysql2/promise'
import { config } from './index.js'

const pool = mysql.createPool({
    host: config.db.host,
    user: config.db.user,
    password: config.db.password,
    database: config.db.database,
    port: config.db.port,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
})

console.log("MySQL Connections pool created")

export default pool
