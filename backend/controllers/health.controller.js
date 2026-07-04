import getPool from '../config/db.js';
import logger from '../utils/logger.js';

export const healthHandler = (_req, res) => {
  return res.status(200).json({
    status: 'ok',
    service: 'pokemon-backend',
    timestamp: new Date().toISOString(),
  });
};

export const readinessHandler = async (_req, res) => {
  try {
    const pool = getPool();
    await pool.query('SELECT 1');

    return res.status(200).json({
      status: 'ready',
      dependencies: {
        database: 'ok',
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Readiness check failed:', error);

    return res.status(503).json({
      status: 'not_ready',
      dependencies: {
        database: 'unavailable',
      },
      timestamp: new Date().toISOString(),
    });
  }
};
