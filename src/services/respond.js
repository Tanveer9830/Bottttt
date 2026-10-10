export async function reply(interaction, content, ephemeral = true) {
  const payload = typeof content === 'string' ? { content, ephemeral } : { ...content, ephemeral };
  if (interaction.deferred || interaction.replied) return interaction.followUp(payload);
  return interaction.reply(payload);
}

export function truncate(value, max = 1900) {
  const text = String(value);
  return text.length <= max ? text : `${text.slice(0, max - 1)}…`;
}
