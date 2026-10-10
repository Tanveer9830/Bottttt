import { AuditLogEvent, PermissionFlagsBits } from 'discord.js';
import { getSettings } from '../services/settings.js';
import { recordIncident } from '../services/audit.js';

const messageWindows = new Map();
const joinWindows = new Map();
const URL = /https?:\/\/[^\s<]+/gi;
const INVITE = /(?:discord\.gg|discord(?:app)?\.com\/invite)\/[\w-]+/i;
const SUSPICIOUS = /(?:d[i1]sc[o0]rd|steam|nitro|airdrop|wallet).{0,35}(?:gift|free|verify|claim|login)/i;

function exempt(member, config) {
  return config.allowUserIds?.includes(member.id) || member.roles.cache.some((role) => config.allowRoleIds?.includes(role.id));
}
async function alert(guild, config, content, logger) {
  const channel = guild.channels.cache.get(config.alertChannelId);
  if (!channel?.isTextBased()) return;
  await channel.send({ content, allowedMentions: { parse: [] } }).catch((error) => logger.warn({ err: error }, 'Security alert failed'));
}
async function violation(message, context, type, detail, logChannelId, alertRoleId = null) {
  await message.delete().catch(() => {});
  if (message.member?.moderatable) await message.member.timeout(5 * 60_000, `Automated ${type} protection`).catch(() => {});
  await recordIncident(context.store, message.guildId, { type, detail, userId: message.author.id, channelId: message.channelId });
  const channel = message.guild.channels.cache.get(logChannelId);
  const rolePrefix = alertRoleId ? `<@&${alertRoleId}> ` : '';
  if (channel?.isTextBased()) await channel.send({
    content: `${rolePrefix}AutoMod **${type}**: <@${message.author.id}> in <#${message.channelId}> — ${detail}`,
    allowedMentions: { roles: alertRoleId ? [alertRoleId] : [], users: [] },
  }).catch(() => {});
}

export function createMessageHandler(context) {
  return async (message) => {
    if (!message.inGuild() || message.author.bot || !message.member) return;
    const guildState = context.store.guild(message.guildId);
    const automod = getSettings(context.store, message.guildId, 'automod');
    const security = getSettings(context.store, message.guildId, 'security');
    const privileged = message.member.permissions.has(PermissionFlagsBits.ManageMessages);
    const autoExempt = privileged || message.member.roles.cache.some((r) => automod.exemptRoleIds.includes(r.id));
    const securityExempt = exempt(message.member, security);
    const normalized = message.content.toLowerCase().replace(/\s+/g, ' ').trim();

    if (security.phishingProtection && !securityExempt && URL.test(message.content) && SUSPICIOUS.test(message.content)) {
      URL.lastIndex = 0;
      return violation(message, context, 'suspected-phishing', 'Suspicious promotional/login URL pattern', security.alertChannelId);
    }
    URL.lastIndex = 0;
    if (!automod.enabled || autoExempt) return;
    const accountHours = (Date.now() - message.author.createdTimestamp) / 3_600_000;
    if (accountHours < automod.minimumAccountAgeHours) {
      return violation(message, context, 'new-account', `Account is younger than ${automod.minimumAccountAgeHours} hours`, automod.logChannelId, automod.alertRoleId);
    }

    const key = `${message.guildId}:${message.author.id}`;
    const now = Date.now();
    const rows = (messageWindows.get(key) || []).filter((x) => now - x.at < automod.spamWindow * 1000);
    rows.push({ at: now, content: normalized });
    messageWindows.set(key, rows);
    if (rows.length > automod.spamLimit) return violation(message, context, 'spam', `${rows.length} messages in ${automod.spamWindow}s`, automod.logChannelId, automod.alertRoleId);
    if (normalized && rows.filter((x) => x.content === normalized).length >= automod.duplicateLimit) return violation(message, context, 'duplicate-spam', 'Repeated identical messages', automod.logChannelId, automod.alertRoleId);
    if (automod.blockInvites && INVITE.test(message.content)) return violation(message, context, 'invite', 'Discord invite blocked', automod.logChannelId, automod.alertRoleId);
    if (automod.blockLinks && URL.test(message.content)) { URL.lastIndex = 0; return violation(message, context, 'link', 'Links are blocked', automod.logChannelId, automod.alertRoleId); }
    URL.lastIndex = 0;
    if (automod.badwords.some((phrase) => normalized.includes(phrase))) return violation(message, context, 'blocked-phrase', 'Message matched the blocked phrase list', automod.logChannelId, automod.alertRoleId);
    if (message.mentions.users.size + message.mentions.roles.size > automod.mentionLimit) return violation(message, context, 'mass-mention', 'Too many mentions', automod.logChannelId, automod.alertRoleId);
    const letters = message.content.match(/[a-z]/gi) || [];
    const capitals = message.content.match(/[A-Z]/g) || [];
    if (letters.length >= 10 && capitals.length / letters.length * 100 >= automod.capsThreshold) return violation(message, context, 'excessive-caps', 'Uppercase threshold exceeded', automod.logChannelId, automod.alertRoleId);
    const emojis = message.content.match(/<a?:\w+:\d+>/g)?.length || 0;
    if (emojis > automod.emojiLimit) return violation(message, context, 'emoji-spam', 'Custom emoji threshold exceeded', automod.logChannelId, automod.alertRoleId);
    if (message.attachments.size > automod.attachmentLimit) return violation(message, context, 'attachment-spam', 'Attachment threshold exceeded', automod.logChannelId, automod.alertRoleId);
    void guildState;
  };
}

export function createMemberJoinHandler(context) {
  return async (member) => {
    const config = getSettings(context.store, member.guild.id, 'security');
    if (!config.enabled || exempt(member, config)) return;
    const now = Date.now();
    const joins = (joinWindows.get(member.guild.id) || []).filter((time) => now - time < config.raidWindow * 1000);
    joins.push(now); joinWindows.set(member.guild.id, joins);
    const accountHours = (now - member.user.createdTimestamp) / 3_600_000;
    if (accountHours < config.minimumAccountAgeHours && config.quarantineRoleId) {
      await member.roles.add(config.quarantineRoleId, 'Account younger than security threshold').catch((error) => context.logger.warn({ err: error }, 'Quarantine failed'));
    }
    if (joins.length >= config.raidThreshold) {
      await recordIncident(context.store, member.guild.id, { type: 'join-raid', detail: `${joins.length} joins in ${config.raidWindow}s` });
      await alert(member.guild, config, `Possible join raid: ${joins.length} joins in ${config.raidWindow} seconds. Use \`/security lockdown\` if needed.`, context.logger);
      joinWindows.set(member.guild.id, []);
    }
  };
}

export function createAuditLogHandler(context) {
  const webhookEvents = new Set([AuditLogEvent.WebhookCreate, AuditLogEvent.WebhookUpdate, AuditLogEvent.WebhookDelete]);
  return async (entry, guild) => {
    if (!webhookEvents.has(entry.action)) return;
    const config = getSettings(context.store, guild.id, 'security');
    if (!config.webhookMonitor || config.allowUserIds.includes(entry.executorId)) return;
    await recordIncident(context.store, guild.id, { type: 'webhook-change', detail: `Audit action ${entry.action} by ${entry.executorId || 'unknown'}`, userId: entry.executorId });
    await alert(guild, config, `Webhook change detected. Actor: ${entry.executorId ? `<@${entry.executorId}>` : 'unknown'}. Audit action: ${entry.action}.`, context.logger);
  };
}
