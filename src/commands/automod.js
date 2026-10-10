import { PermissionFlagsBits } from 'discord.js';
import { option } from './options.js';
import { requirePermission } from './helpers.js';
import { defaultsFor, getSettings, listMutation, mutateSetting } from '../services/settings.js';
import { reply } from '../services/respond.js';
import { recordAudit } from '../services/audit.js';

const integer = (name, description, key, min, max) => ({ name, description, options: [option.integer('value', description, true, { min_value: min, max_value: max })], run: (c) => mutateSetting(c, 'automod', key, c.interaction.options.getInteger('value'), `${description} updated.`) });
const toggle = (name, description, key, value) => ({ name, description, run: (c) => mutateSetting(c, 'automod', key, value, `${description}.`) });

export const automodActions = [
  toggle('enable', 'Enable message AutoMod', 'enabled', true),
  toggle('disable', 'Disable message AutoMod', 'enabled', false),
  { name: 'status', description: 'Show the effective AutoMod configuration', run: async (c) => reply(c.interaction, `\`\`\`json\n${JSON.stringify(getSettings(c.store, c.interaction.guildId, 'automod'), null, 2)}\n\`\`\``) },
  integer('spam-limit', 'Set messages allowed per spam window', 'spamLimit', 2, 30),
  integer('spam-window', 'Set spam window in seconds', 'spamWindow', 2, 60),
  integer('duplicate-limit', 'Set repeated-message limit', 'duplicateLimit', 2, 15),
  integer('caps-threshold', 'Set uppercase percentage threshold', 'capsThreshold', 50, 100),
  toggle('links-allow', 'Allow links', 'blockLinks', false),
  toggle('links-block', 'Block links', 'blockLinks', true),
  toggle('invites-allow', 'Allow Discord invites', 'blockInvites', false),
  toggle('invites-block', 'Block Discord invites', 'blockInvites', true),
  { name: 'badword-add', description: 'Add a blocked word or phrase', options: [option.text('phrase', 'Blocked word or phrase', true, { min_length: 2, max_length: 80 })], run: (c) => listMutation(c, 'automod', 'badwords', 'add', c.interaction.options.getString('phrase').toLowerCase(), 'Blocked phrases') },
  { name: 'badword-remove', description: 'Remove a blocked word or phrase', options: [option.text('phrase', 'Blocked word or phrase', true, { min_length: 2, max_length: 80 })], run: (c) => listMutation(c, 'automod', 'badwords', 'remove', c.interaction.options.getString('phrase').toLowerCase(), 'Blocked phrases') },
  { name: 'badword-list', description: 'List blocked words and phrases', run: async (c) => reply(c.interaction, `Blocked phrases: ${getSettings(c.store, c.interaction.guildId, 'automod').badwords.join(', ') || 'none'}`) },
  { name: 'badword-clear', description: 'Clear all blocked words and phrases', run: (c) => listMutation(c, 'automod', 'badwords', 'clear', null, 'Blocked phrases') },
  integer('mention-limit', 'Set maximum mentions per message', 'mentionLimit', 1, 50),
  integer('emoji-limit', 'Set maximum custom emoji per message', 'emojiLimit', 1, 50),
  integer('attachment-limit', 'Set maximum attachments per message', 'attachmentLimit', 0, 10),
  integer('account-age', 'Set minimum account age in hours', 'minimumAccountAgeHours', 0, 8760),
  { name: 'log-channel', description: 'Set the AutoMod log channel', options: [option.channel()], run: (c) => mutateSetting(c, 'automod', 'logChannelId', c.interaction.options.getChannel('channel').id, 'AutoMod log channel updated.') },
  { name: 'alert-role', description: 'Set the role pinged for AutoMod alerts', options: [option.role()], run: (c) => mutateSetting(c, 'automod', 'alertRoleId', c.interaction.options.getRole('role').id, 'AutoMod alert role updated.') },
  { name: 'exempt-role-add', description: 'Exempt a role from content filters', options: [option.role()], run: (c) => listMutation(c, 'automod', 'exemptRoleIds', 'add', c.interaction.options.getRole('role').id, 'Exempt roles') },
  { name: 'exempt-role-remove', description: 'Remove an AutoMod role exemption', options: [option.role()], run: (c) => listMutation(c, 'automod', 'exemptRoleIds', 'remove', c.interaction.options.getRole('role').id, 'Exempt roles') },
  { name: 'exempt-role-list', description: 'List roles exempt from content filters', run: async (c) => { const ids = getSettings(c.store, c.interaction.guildId, 'automod').exemptRoleIds; return reply(c.interaction, `Exempt roles: ${ids.map((id) => `<@&${id}>`).join(', ') || 'none'}`); } },
  { name: 'reset', description: 'Reset AutoMod to safe defaults', run: async (c) => { await c.store.updateGuild(c.interaction.guildId, (g) => { g.automod = defaultsFor('automod'); }); await recordAudit(c.store, c.interaction.guildId, { actorId: c.interaction.user.id, action: 'automod.reset' }); return reply(c.interaction, 'AutoMod reset to safe defaults.'); } },
];

export const automodCommand = {
  name: 'automod', description: 'Configure and inspect automated message moderation',
  defaultMemberPermissions: PermissionFlagsBits.ManageGuild,
  category: 'administration', admin: true, actions: automodActions,
  authorize: (i) => requirePermission(i, PermissionFlagsBits.ManageGuild),
};
