import { writeFile } from 'node:fs/promises';
import { commands } from '../src/commands/index.js';
import { validateCommands } from '../src/commands/validate.js';

const errors = validateCommands(commands);
if (errors.length) throw new Error(errors.join('\n'));
const rows = commands.flatMap((command) => command.actions.map((action) => ({ command: command.name, action })));
const admin = rows.filter(({ command }) => commands.find((x) => x.name === command).admin).length;
const markdown = `# Command inventory\n\nGenerated from the executable command registry. Do not edit by hand.\n\n- Top-level chat-input commands: **${commands.length}**\n- Subcommand groups: **0**\n- Slash subcommands: **${rows.length}**\n- Distinct implemented actions: **${rows.length}**\n- Administrative actions: **${admin}**\n- Normal-user actions: **${rows.length - admin}**\n- Locally registration-validated actions: **${rows.length}**\n- Live Discord registration: **unverified** (requires credentials)\n\n${commands.map((command) => `## /${command.name}\n\n${command.description}\n\n${command.actions.map((action) => `- \`/${command.name} ${action.name}\` — ${action.description}`).join('\n')}`).join('\n\n')}\n`;
await writeFile(new URL('../docs/COMMANDS.md', import.meta.url), markdown);
console.log(`Wrote inventory for ${rows.length} actions.`);
