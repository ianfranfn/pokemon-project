import mysql from 'mysql2/promise';
import { config } from './index.js';
import logger from '../utils/logger.js';

let pool;

const getPool = () => {
  if (pool) {
    return pool;
  }

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

  logger.info(`MySQL connection pool created for host ${config.db.host}`);

  return pool;
};

export default getPool;
