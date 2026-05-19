import winston from "winston";

const transports = [];

// In production or Vercel environments, we only use console logging.
// Writing to local files is not allowed/possible on read-only serverless filesystems.
if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
  transports.push(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.json()
      ),
    })
  );
} else {
  transports.push(
    new winston.transports.File({ filename: './src/logger/logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: './src/logger/logs/combined.log', level: 'info' }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    })
  );
}

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.json()
  ),
  transports,
});

export default logger;