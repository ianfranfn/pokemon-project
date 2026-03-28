import winston from 'winston';

const level = process.env.NODE_ENV === 'production' ? 'info' : 'debug'; // Set log level based on enviroment

const logger = winston.createLogger({
  level: level, // Log level
  format: winston.format.json(), // Log in JSON format
  transports: [
    new winston.transports.Console({
      // Log to console, useful for development
      format: winston.format.combine(
        // Combine multiple formats
        winston.format.timestamp({
          // Add timestamp to logs
          format: 'YYYY-MM-DD HH:mm:ss',
        }),
        winston.format.colorize(), // Colorize the output for console
        winston.format.printf((info) => `${info.timestamp} [${info.level}]: ${info.message}`) // Custom log format, timestamp, level and message
      ),
    }),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
  ],
});

export default logger;
