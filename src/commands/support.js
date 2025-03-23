const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("support")
        .setDescription("gives support server link"),
    helpSection: "moderation",
    helpDescription: "gives link for support hub",
    execute: async (interaction) => {
        await interaction.reply({ content: "A link to the Support Server can be found here\nhttps://discord.gg/VyqpyRZqBE"})
    },
    init: async (client) => {

    }
}