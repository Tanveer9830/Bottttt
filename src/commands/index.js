import { ApplicationCommandOptionType } from 'discord.js';
import { automodCommand } from './automod.js';
import { moderationCommand } from './moderation.js';
import { securityCommand } from './security.js';

export const commands = [automodCommand, moderationCommand, securityCommand];
export const commandMap = new Map(commands.map((command) => [command.name, command]));

export function commandPayload(command) {
  return {
    name: command.name,
    description: command.description,
    dm_permission: false,
    default_member_permissions: command.defaultMemberPermissions.toString(),
    options: command.actions.map((action) => ({
      type: ApplicationCommandOptionType.Subcommand,
      name: action.name,
      description: action.description,
      options: action.options || [],
    })),
  };
}

export function allPayloads() { return commands.map(commandPayload); }
