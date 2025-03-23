const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('trello')
        .setDescription('take a look at our development roadmap.'),
    helpSection: "moderation",
    helpDescription: "shows you the dev trello",
    execute: async (interaction) => {

        const embed = new EmbedBuilder()
            .setColor("Red")
            .setTitle("🚧 Development Trello 🚧")
            .setDescription("Use the link above to see our Development Trello.")
            .setFooter({ text: "Axol Systems"})
            .setTimestamp();

        await interaction.reply({ embeds: [embed], content: "https://trello.com/b/y6OmUw5I/axolos"});
    },
    init: async (client) => {

    }
}