import mysql from 'mysql2/promise';
import { config } from './index.js';

let pool;

const getPool = () => {
  if (pool) {
    return pool;
  }
  console.log('DEBUG DB CONFIG:', config.db);
  console.log('MySQL Connections pool created');
  pool = mysql.createPool({
    host: config.db.host,
    user: config.db.user,
    password: config.db.password,
    database: config.db.name,
    port: config.db.port,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  return pool;
};

export default getPool;
