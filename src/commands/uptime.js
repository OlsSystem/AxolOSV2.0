const { SlashCommandBuilder, messageLink } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');



require('dotenv').config();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('uptime')
        .setDescription('how long has the bot been alive for?'),
    helpSection: "moderation",
    helpDescription: "shows up time funky whaaaaat",
    execute: async (interaction) => {
        let days = Math.floor(interaction.client.uptime / 86400000)
        let hours = Math.floor(interaction.client.uptime / 3600000) % 24
        let minutes = Math.floor(interaction.client.uptime / 60000) % 60
        let seconds = Math.floor(interaction.client.uptime / 1000) % 60

        const embed = new EmbedBuilder()
            .setColor("Blue")
            .setDescription(`:white_check_mark: The bot hasn't killed its self in \`${days}\` days, \`${hours}\` hours, \`${minutes}\` minutes, \`${seconds}\` seconds.`)

        await interaction.reply({ embeds: [embed] })
    },
    init: async (client) => {

    }
}