import path from 'node:path';

export function loadConfig(env = process.env) {
  const required = ['DISCORD_TOKEN', 'DISCORD_CLIENT_ID'];
  const missing = required.filter((key) => !env[key]);
  if (missing.length) throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  return Object.freeze({
    token: env.DISCORD_TOKEN,
    clientId: env.DISCORD_CLIENT_ID,
    guildId: env.DISCORD_GUILD_ID || null,
    dataFile: path.resolve(env.DATA_FILE || './data/store.json'),
    logLevel: env.LOG_LEVEL || 'info',
  });
}
