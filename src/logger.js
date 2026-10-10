import pino from 'pino';

export function createLogger(level = 'info') {
  return pino({
    level,
    redact: {
      paths: ['token', '*.token', 'authorization', '*.authorization', 'req.headers.authorization'],
      censor: '[REDACTED]',
    },
  });
}
