const { SlashCommandBuilder } = require('@discordjs/builders');
const { Client, GatewayIntentBits, PermissionsBitField} = require(`discord.js`);
const { User } = require('discord.js');
const { EmbedBuilder } = require('discord.js');

require('dotenv').config();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('says the ping of the bot'),
    helpSection: "moderation",
    permissions: [PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ViewChannel],
    helpDescription: "Tells you how amazing my tinternet is.",
    execute: async (interaction) => {
        const startTime = Date.now();
        await interaction.deferReply({ withResponse: true });
        const timeDiff = Date.now() - startTime;
        const embed = new EmbedBuilder()
            .setDescription(`🏓 The ping is ${timeDiff}ms`)
            .setColor('Red')
            .setFooter({ text: 'AxolOS | The Party has Just Begun.' })
        await interaction.followUp({ embeds: [embed] });
    },
    init: async (client) => {

    }
}