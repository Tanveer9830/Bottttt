import { reply } from './respond.js';
import { recordAudit } from './audit.js';

export function defaultsFor(section) {
  if (section === 'automod') return {
    enabled: false, spamLimit: 6, spamWindow: 8, duplicateLimit: 4, capsThreshold: 80,
    blockLinks: false, blockInvites: true, badwords: [], mentionLimit: 5, emojiLimit: 12,
    attachmentLimit: 5, minimumAccountAgeHours: 24, logChannelId: null, alertRoleId: null, exemptRoleIds: [],
  };
  return {
    enabled: false, raidThreshold: 8, raidWindow: 15, minimumAccountAgeHours: 24,
    phishingProtection: true, webhookMonitor: true, allowUserIds: [], allowRoleIds: [],
    alertChannelId: null, quarantineRoleId: null, lockedDown: false,
  };
}

export async function mutateSetting(context, section, key, value, message) {
  const { interaction, store } = context;
  await store.updateGuild(interaction.guildId, (guild) => {
    guild[section] = { ...defaultsFor(section), ...guild[section], [key]: value };
  });
  await recordAudit(store, interaction.guildId, { actorId: interaction.user.id, action: `${section}.${key}`, detail: String(value) });
  return reply(interaction, message);
}

export async function listMutation(context, section, key, operation, value, label) {
  const { interaction, store } = context;
  let items;
  await store.updateGuild(interaction.guildId, (guild) => {
    const config = guild[section] = { ...defaultsFor(section), ...guild[section] };
    const set = new Set(config[key] || []);
    if (operation === 'add') set.add(value);
    if (operation === 'remove') set.delete(value);
    if (operation === 'clear') set.clear();
    config[key] = items = [...set];
  });
  await recordAudit(store, interaction.guildId, { actorId: interaction.user.id, action: `${section}.${key}.${operation}`, detail: value || '' });
  const render = (item) => key.toLowerCase().includes('userid') ? `<@${item}>`
    : key.toLowerCase().includes('roleid') ? `<@&${item}>` : `\`${String(item).replaceAll('`', '')}\``;
  return reply(interaction, `${label}: ${items.length ? items.map(render).join(', ') : 'none'}`);
}

export function getSettings(store, guildId, section) {
  return { ...defaultsFor(section), ...store.guild(guildId)[section] };
}
