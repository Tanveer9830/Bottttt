import { ApplicationCommandOptionType } from 'discord.js';

export const option = {
  user: (required = true) => ({ type: ApplicationCommandOptionType.User, name: 'user', description: 'Target user', required }),
  member: (required = true) => ({ type: ApplicationCommandOptionType.User, name: 'user', description: 'Target member', required }),
  role: (name = 'role', required = true) => ({ type: ApplicationCommandOptionType.Role, name, description: 'Target role', required }),
  channel: (name = 'channel', required = true) => ({ type: ApplicationCommandOptionType.Channel, name, description: 'Target channel', required }),
  text: (name, description, required = true, extra = {}) => ({ type: ApplicationCommandOptionType.String, name, description, required, ...extra }),
  integer: (name, description, required = true, extra = {}) => ({ type: ApplicationCommandOptionType.Integer, name, description, required, ...extra }),
  boolean: (name, description, required = true) => ({ type: ApplicationCommandOptionType.Boolean, name, description, required }),
};
