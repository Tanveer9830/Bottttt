import { Client, Events, GatewayIntentBits } from 'discord.js';
import { loadConfig } from './config.js';
import { createLogger } from './logger.js';
import { JsonStore } from './services/store.js';
import { createInteractionHandler } from './handlers/interactions.js';
import { createMessageHandler, createMemberJoinHandler, createAuditLogHandler } from './handlers/security-events.js';

const config = loadConfig();
const logger = createLogger(config.logLevel);
const store = await new JsonStore(config.dataFile).init();
const client = new Client({ intents: [
  GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages,
  GatewayIntentBits.MessageContent, GatewayIntentBits.GuildModeration,
] });
const context = { client, store, logger };
client.on(Events.InteractionCreate, createInteractionHandler(context));
client.on(Events.MessageCreate, createMessageHandler(context));
client.on(Events.GuildMemberAdd, createMemberJoinHandler(context));
client.on(Events.GuildAuditLogEntryCreate, createAuditLogHandler(context));
client.once(Events.ClientReady, (ready) => logger.info({ user: ready.user.tag, guilds: ready.guilds.cache.size }, 'Bot ready'));
client.on(Events.Error, (error) => logger.error({ err: error }, 'Discord client error'));
process.on('unhandledRejection', (error) => logger.error({ err: error }, 'Unhandled rejection'));
await client.login(config.token);
