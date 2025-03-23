const economySchema = require('../schemas/economy');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bal')
        .setDescription('show how much money u have'),
        helpSection: "economy",
        helpDescription: "How much money do you have?",
    execute: async (interaction) => {

        const embed = new EmbedBuilder()
            .setDescription('Congrats you have a credit card with Axol Moneh.')
            .setColor('Red')
            .setFooter({ text: "Axol Banking Innit." })

        const data = await economySchema.findOne({ Guild: interaction.guild.id, User: interaction.user.id });

        if (!data) {
            await interaction.reply({ content: "Bro has no account.", flags: MessageFlags.Ephemeral })
        } else {
            const embed = new EmbedBuilder()
                .setDescription(`You have **£${data.Money}** in your account.`)
                .setColor('Red')
                .setFooter({ text: "Axol Banking Innit." })

            await interaction.reply({ embeds: [embed] })
            return;
        }


    },
    init: async (client) => {

    }
}