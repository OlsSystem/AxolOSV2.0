const economySchema = require('../schemas/economy');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('create-bal')
        .setDescription('makes u a credit card innit'),
    helpSection: "economy",
    helpDescription: "Sets you up with a credit card.",
    execute: async (interaction) => {

        const embed = new EmbedBuilder()
            .setDescription('Congrats you have a credit card with Axol Moneh.')
            .setColor('Red')
            .setFooter({ text: "Axol Banking Innit." })

        const data = await economySchema.findOne({ Guild: interaction.guild.id, User: interaction.user.id });

        if (!data) {
            await economySchema.create({
                Guild: interaction.guild.id,
                User: interaction.user.id,
                Money: "25",
                GuildName: interaction.guild.name,
            });
        } else {
            await interaction.reply({
                content: "only one u greedy bugger.",
                flags: MessageFlags.Ephemeral
            });
            return;
        }

        await interaction.reply({ embeds: [embed] });
        console.log(`[DEBUG] ${interaction.user.id} has created an account in the ${interaction.guild.name} server.`)
    },
    init: async (client) => {

    }
}