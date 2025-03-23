const { SlashCommandBuilder, MessageFlags } = require('discord.js')
const chalk = require("chalk");
const {skipCommand} = require("../lib/globalVariables");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reload')
        .setDescription('Reloads the entire bot.'),

    execute: async (interaction) => {
        if (interaction.user.id !== '534761994629152780') return await interaction.reply({ content: "Devs only.", flags: MessageFlags.Ephemeral });
        const commandsToRemove = Array.from(interaction.client.commands.keys());

        for (const commandName of commandsToRemove) {
            delete require.cache[require.resolve(`./${commandName}.js`)];
            interaction.client.commands.delete(commandName);

            try {
                const newCommand = require(`./${commandName}.js`);
                if (skipCommand.includes(newCommand.data.name)) {
                    console.log(chalk.gray(` ${String(new Date).split(" ", 5).join(" ")} `) + chalk.white('[') + chalk.red('INFO') + chalk.white('] ') + chalk.green('COMMAND: ') + chalk.white(command.data.name) + chalk.white(' SKIPPED!'));
                } else {
                    interaction.client.commands.set(newCommand.data.name, newCommand);
                    console.log(chalk.gray(` ${String(new Date).split(" ", 5).join(" ")} `) + chalk.white('[') + chalk.green('INFO') + chalk.white('] ') + chalk.green('COMMAND: ') + chalk.white(commandName) + chalk.white(' Loaded!'))
                }
            } catch (error) {
                console.log(chalk.gray(` ${String(new Date).split(" ", 5).join(" ")} `) + chalk.white('[') + chalk.red('INFO') + chalk.white('] ') + chalk.red('COMMAND: ') + chalk.white(commandName) + chalk.white(' Unable to load!'));
                console.log(error)
                await interaction.reply({ content: `Error reloading command ${commandName}`, flags: MessageFlags.Ephemeral});
                return;
            }
        }

        await interaction.reply({ content: 'Reload Successful', flags: MessageFlags.Ephemeral })

    },
    init: async (client) => {

    }
}