import { PermissionFlagsBits } from 'discord.js';
import { reply } from '../services/respond.js';

export async function requireGuild(interaction) {
  if (interaction.inGuild()) return true;
  await reply(interaction, 'This action is only available in a server.');
  return false;
}

export async function requirePermission(interaction, permission = PermissionFlagsBits.ManageGuild) {
  if (!(await requireGuild(interaction))) return false;
  if (interaction.memberPermissions?.has(permission)) return true;
  await reply(interaction, 'You do not have permission to use this action.');
  return false;
}

export function hierarchyError(actor, target, botMember) {
  if (target.id === target.guild.ownerId) return 'The server owner cannot be moderated.';
  if (actor.id !== target.guild.ownerId && actor.roles.highest.comparePositionTo(target.roles.highest) <= 0) return 'Your highest role must be above the target member.';
  if (botMember.roles.highest.comparePositionTo(target.roles.highest) <= 0) return 'My highest role must be above the target member.';
  return null;
}

export const reason = (interaction) => interaction.options.getString('reason') || `Action by ${interaction.user.tag}`;
