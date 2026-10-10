import { ChannelType, PermissionFlagsBits } from 'discord.js';
import { option } from './options.js';
import { requirePermission } from './helpers.js';
import { defaultsFor, getSettings, listMutation, mutateSetting } from '../services/settings.js';
import { reply, truncate } from '../services/respond.js';
import { recordAudit } from '../services/audit.js';

const integer = (name, description, key, min, max) => ({ name, description, options: [option.integer('value', description, true, { min_value: min, max_value: max })], run: (c) => mutateSetting(c, 'security', key, c.interaction.options.getInteger('value'), `${description} updated.`) });
const toggle = (name, description, key, value) => ({ name, description, run: (c) => mutateSetting(c, 'security', key, value, `${description}.`) });

async function lockdown(c, locked) {
  const { interaction, store } = c;
  await interaction.deferReply({ ephemeral: true });
  const everyone = interaction.guild.roles.everyone;
  const channels = interaction.guild.channels.cache.filter((ch) => ch.type === ChannelType.GuildText || ch.type === ChannelType.GuildAnnouncement);
  let changed = 0;
  for (const channel of channels.values()) {
    try {
      if (locked) {
        const overwrite = channel.permissionOverwrites.cache.get(everyone.id);
        await store.updateGuild(interaction.guildId, (g) => {
          g.lockdownSnapshot ??= {};
          g.lockdownSnapshot[channel.id] = overwrite?.allow.has(PermissionFlagsBits.SendMessages) ? 'allow' : overwrite?.deny.has(PermissionFlagsBits.SendMessages) ? 'deny' : 'inherit';
        });
        await channel.permissionOverwrites.edit(everyone, { SendMessages: false }, { reason: `Emergency lockdown by ${interaction.user.tag}` });
      } else {
        const prior = store.guild(interaction.guildId).lockdownSnapshot?.[channel.id] || 'inherit';
        await channel.permissionOverwrites.edit(everyone, { SendMessages: prior === 'inherit' ? null : prior === 'allow' }, { reason: `Lockdown recovery by ${interaction.user.tag}` });
      }
      changed++;
    } catch (error) { c.logger.warn({ err: error, channelId: channel.id }, 'Lockdown channel update failed'); }
  }
  await store.updateGuild(interaction.guildId, (g) => { g.security = { ...defaultsFor('security'), ...g.security, lockedDown: locked }; if (!locked) delete g.lockdownSnapshot; });
  await recordAudit(store, interaction.guildId, { actorId: interaction.user.id, action: locked ? 'security.lockdown' : 'security.unlock', detail: `${changed} channels` });
  return reply(interaction, `${locked ? 'Locked' : 'Restored'} ${changed}/${channels.size} text channels.`);
}

export const securityActions = [
  toggle('enable', 'Enable raid security', 'enabled', true),
  toggle('disable', 'Disable raid security', 'enabled', false),
  { name: 'status', description: 'Show effective security configuration', run: (c) => reply(c.interaction, `\`\`\`json\n${JSON.stringify(getSettings(c.store, c.interaction.guildId, 'security'), null, 2)}\n\`\`\``) },
  integer('raid-threshold', 'Set joins needed to trigger raid mode', 'raidThreshold', 3, 100),
  integer('raid-window', 'Set raid detection window in seconds', 'raidWindow', 5, 300),
  integer('account-age', 'Set minimum account age in hours', 'minimumAccountAgeHours', 0, 8760),
  { name: 'lockdown', description: 'Deny everyone from sending in text channels', run: (c) => lockdown(c, true) },
  { name: 'unlock', description: 'Restore pre-lockdown send permissions', run: (c) => lockdown(c, false) },
  toggle('phishing-enable', 'Enable phishing URL detection', 'phishingProtection', true),
  toggle('phishing-disable', 'Disable phishing URL detection', 'phishingProtection', false),
  toggle('webhook-enable', 'Enable webhook abuse monitoring', 'webhookMonitor', true),
  toggle('webhook-disable', 'Disable webhook abuse monitoring', 'webhookMonitor', false),
  { name: 'allow-user-add', description: 'Add a user to security exemptions', options: [option.user()], run: (c) => listMutation(c, 'security', 'allowUserIds', 'add', c.interaction.options.getUser('user').id, 'Allowed users') },
  { name: 'allow-user-remove', description: 'Remove a user security exemption', options: [option.user()], run: (c) => listMutation(c, 'security', 'allowUserIds', 'remove', c.interaction.options.getUser('user').id, 'Allowed users') },
  { name: 'allow-role-add', description: 'Add a role to security exemptions', options: [option.role()], run: (c) => listMutation(c, 'security', 'allowRoleIds', 'add', c.interaction.options.getRole('role').id, 'Allowed roles') },
  { name: 'allow-role-remove', description: 'Remove a role security exemption', options: [option.role()], run: (c) => listMutation(c, 'security', 'allowRoleIds', 'remove', c.interaction.options.getRole('role').id, 'Allowed roles') },
  { name: 'allow-list', description: 'List security exemptions', run: (c) => { const s = getSettings(c.store, c.interaction.guildId, 'security'); return reply(c.interaction, `Users: ${s.allowUserIds.map((id) => `<@${id}>`).join(', ') || 'none'}\nRoles: ${s.allowRoleIds.map((id) => `<@&${id}>`).join(', ') || 'none'}`); } },
  { name: 'allow-clear', description: 'Clear all security exemptions', run: async (c) => { await c.store.updateGuild(c.interaction.guildId, (g) => { g.security = { ...defaultsFor('security'), ...g.security, allowUserIds: [], allowRoleIds: [] }; }); return reply(c.interaction, 'Security exemptions cleared.'); } },
  { name: 'alert-channel', description: 'Set the security alert channel', options: [option.channel()], run: (c) => mutateSetting(c, 'security', 'alertChannelId', c.interaction.options.getChannel('channel').id, 'Security alert channel updated.') },
  { name: 'quarantine-role', description: 'Set role assigned to suspicious new accounts', options: [option.role()], run: (c) => mutateSetting(c, 'security', 'quarantineRoleId', c.interaction.options.getRole('role').id, 'Quarantine role updated.') },
  { name: 'audit-tail', description: 'Show recent bot security audit records', options: [option.integer('count', 'Records to show', false, { min_value: 1, max_value: 20 })], run: (c) => { const rows = (c.store.guild(c.interaction.guildId).audit || []).slice(0, c.interaction.options.getInteger('count') || 10); return reply(c.interaction, truncate(rows.map((x) => `${x.at} ${x.action} by <@${x.actorId}> ${x.detail || ''}`).join('\n') || 'No audit records.')); } },
  { name: 'incident-list', description: 'List open security incidents', run: (c) => { const rows = (c.store.guild(c.interaction.guildId).incidents || []).filter((x) => x.status === 'open').slice(0, 20); return reply(c.interaction, truncate(rows.map((x) => `${x.id}: ${x.type} — ${x.detail}`).join('\n') || 'No open incidents.')); } },
  { name: 'incident-resolve', description: 'Resolve a security incident', options: [option.text('id', 'Incident ID')], run: async (c) => { const id = c.interaction.options.getString('id'); let found = false; await c.store.updateGuild(c.interaction.guildId, (g) => { const row = (g.incidents || []).find((x) => x.id === id); if (row) { row.status = 'resolved'; row.resolvedBy = c.interaction.user.id; row.resolvedAt = new Date().toISOString(); found = true; } }); return reply(c.interaction, found ? `Incident ${id} resolved.` : 'Incident not found.'); } },
  { name: 'alert-test', description: 'Send a test security alert', run: async (c) => { const id = getSettings(c.store, c.interaction.guildId, 'security').alertChannelId; const channel = id && c.interaction.guild.channels.cache.get(id); if (!channel?.isTextBased()) return reply(c.interaction, 'Configure a valid alert channel first.'); await channel.send({ content: `Security alert test requested by <@${c.interaction.user.id}>.` }); return reply(c.interaction, 'Test alert sent.'); } },
  { name: 'reset', description: 'Reset security configuration to safe defaults', run: async (c) => { await c.store.updateGuild(c.interaction.guildId, (g) => { g.security = defaultsFor('security'); }); await recordAudit(c.store, c.interaction.guildId, { actorId: c.interaction.user.id, action: 'security.reset' }); return reply(c.interaction, 'Security configuration reset.'); } },
];

export const securityCommand = {
  name: 'security', description: 'Configure anti-raid, alerts, exemptions, and lockdown',
  defaultMemberPermissions: PermissionFlagsBits.Administrator,
  category: 'administration', admin: true, actions: securityActions,
  authorize: (i) => requirePermission(i, PermissionFlagsBits.Administrator),
};
