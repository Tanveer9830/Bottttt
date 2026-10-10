import { commandMap } from '../commands/index.js';
import { reply } from '../services/respond.js';

export function createInteractionHandler(context) {
  return async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    const command = commandMap.get(interaction.commandName);
    if (!command) return reply(interaction, 'This command is not available.');
    const actionName = interaction.options.getSubcommand();
    const action = command.actions.find((candidate) => candidate.name === actionName);
    if (!action) return reply(interaction, 'This action is not implemented.');
    try {
      if (!(await command.authorize(interaction))) return;
      if (action.permission && !interaction.memberPermissions.has(action.permission)) {
        return reply(interaction, 'You do not have the permission required for this action.');
      }
      await action.run({ ...context, interaction });
    } catch (error) {
      context.logger.error({ err: error, command: interaction.commandName, action: actionName, guildId: interaction.guildId, userId: interaction.user.id }, 'Command failed');
      await reply(interaction, 'The action failed. Check my role permissions and try again.');
    }
  };
}
