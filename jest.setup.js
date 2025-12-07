import logger from './utils/logger.js'

logger.level = process.env.NODE_ENV === 'test' ? 'crit' : 'debug'