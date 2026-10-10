const NAME = /^[a-z0-9_-]{1,32}$/;

export function validateCommands(commands) {
  const errors = [];
  const topNames = new Set();
  for (const command of commands) {
    if (!NAME.test(command.name)) errors.push(`Invalid command name: ${command.name}`);
    if (topNames.has(command.name)) errors.push(`Duplicate command: ${command.name}`);
    topNames.add(command.name);
    if (!command.description || command.description.length > 100) errors.push(`Invalid description: /${command.name}`);
    if (!command.actions?.length || command.actions.length > 25) errors.push(`/${command.name} must have 1-25 actions`);
    const names = new Set();
    for (const action of command.actions || []) {
      const path = `/${command.name} ${action.name}`;
      if (!NAME.test(action.name)) errors.push(`Invalid action name: ${path}`);
      if (names.has(action.name)) errors.push(`Duplicate action: ${path}`);
      names.add(action.name);
      if (!action.description || action.description.length > 100) errors.push(`Invalid description: ${path}`);
      if (typeof action.run !== 'function') errors.push(`Missing implementation: ${path}`);
      if ((action.options?.length || 0) > 25) errors.push(`Too many options: ${path}`);
      const optionNames = new Set();
      let optionalSeen = false;
      for (const opt of action.options || []) {
        if (!NAME.test(opt.name)) errors.push(`Invalid option name: ${path} ${opt.name}`);
        if (optionNames.has(opt.name)) errors.push(`Duplicate option: ${path} ${opt.name}`);
        optionNames.add(opt.name);
        if (!opt.required) optionalSeen = true;
        if (opt.required && optionalSeen) errors.push(`Required option follows optional option: ${path} ${opt.name}`);
      }
    }
  }
  return errors;
}
