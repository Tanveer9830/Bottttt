import { REST, Routes } from 'discord.js';
import { loadConfig } from '../src/config.js';
import { allPayloads, commands } from '../src/commands/index.js';
import { validateCommands } from '../src/commands/validate.js';

const config = loadConfig();
const errors = validateCommands(commands);
if (errors.length) throw new Error(`Command validation failed:\n${errors.join('\n')}`);
const route = config.guildId
  ? Routes.applicationGuildCommands(config.clientId, config.guildId)
  : Routes.applicationCommands(config.clientId);
const scope = config.guildId ? `development guild ${config.guildId}` : 'global';
const rest = new REST({ version: '10' }).setToken(config.token);
const payloads = allPayloads();
console.log(`Registering ${payloads.length} top-level commands in ${scope}...`);
const result = await rest.put(route, { body: payloads });
console.log(`Discord confirmed ${result.length} registered commands in ${scope}.`);
