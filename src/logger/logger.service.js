import { createLogger, transports, format } from 'winston';

const logTransports = [new transports.Console()];

if (process.env.NODE_ENV !== 'production') {
  const fs = await import('fs');
  const LOG_DIR = './src/logger/logs';

  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }

  const { default: DailyRotateFile } = await import('winston-daily-rotate-file');
  logTransports.push(
    new transports.File({ filename: `${LOG_DIR}/error.log`, level: 'error' }),
    new transports.File({ filename: `${LOG_DIR}/combined.log` }),
  );
}

const logger = createLogger({
  transports: logTransports,
  format: format.combine(format.timestamp(), format.json()),
});

export default logger;