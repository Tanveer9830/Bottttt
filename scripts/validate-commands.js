import { commands, allPayloads } from '../src/commands/index.js';
import { validateCommands } from '../src/commands/validate.js';

const errors = validateCommands(commands);
JSON.stringify(allPayloads());
if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  const actions = commands.reduce((total, command) => total + command.actions.length, 0);
  console.log(`Validated ${commands.length} top-level commands and ${actions} implemented actions.`);
}
