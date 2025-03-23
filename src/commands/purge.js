const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, PermissionsBitField, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('purge')
        .setDescription('delets a lot of messages in one go')
        .addIntegerOption(option => option.setName('amount').setDescription('what we need to clear before the fbi see it?').setMinValue(1).setMaxValue(100).setRequired(true)),
    permissions: [PermissionsBitField.Flags.ManageMessages],
    helpSection: "moderation",
    modPermissions: true,
    helpDescription: "Clears messages to clear up any ~~evidence~~ or arguments.",
    execute: async (interaction) => {
        let number = interaction.options.getInteger('amount');

        const embed = new EmbedBuilder()
            .setColor("Blue")
            .setDescription(`:white_check_mark: Deleted ${number} of messages`)

        await interaction.channel.bulkDelete(number)

        await interaction.reply({ embeds: [embed] });

    },
    init: async (client) => {

    }
}