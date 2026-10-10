const MAX_ENTRIES = 500;

export async function recordAudit(store, guildId, entry) {
  return store.updateGuild(guildId, (guild) => {
    guild.audit ??= [];
    guild.audit.unshift({ id: crypto.randomUUID(), at: new Date().toISOString(), ...entry });
    guild.audit = guild.audit.slice(0, MAX_ENTRIES);
    return guild.audit[0];
  });
}

export async function recordIncident(store, guildId, entry) {
  return store.updateGuild(guildId, (guild) => {
    guild.incidents ??= [];
    guild.incidents.unshift({ id: crypto.randomUUID(), status: 'open', at: new Date().toISOString(), ...entry });
    guild.incidents = guild.incidents.slice(0, MAX_ENTRIES);
    return guild.incidents[0];
  });
}
