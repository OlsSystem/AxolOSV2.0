const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dndroll')
        .setDescription('Roll a dice with a specified range')
        .addIntegerOption(option => option.setName('min').setDescription('Minimum value').setRequired(true))
        .addIntegerOption(option => option.setName('max').setDescription('Maximum value').setRequired(true)),
    helpSection: "dnd",
    helpDescription: "Its like a dice but bias.",
    execute: async (interaction) => {
        const min = interaction.options.getInteger('min');
        const max = interaction.options.getInteger('max');
        const roll = Math.floor(Math.random() * (max - min + 1)) + min;
        await interaction.reply(`Adventurer! You have rolled a ${roll}!`);
    },
    init: async (client) => {

    }
}