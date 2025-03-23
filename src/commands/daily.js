const economySchema = require('../schemas/economy');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const cooldownSchema = require('../schemas/cooldown');

var timeout = [];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('daily')
        .setDescription('gives money every day'),
    helpSection: "economy",
    helpDescription: "Get your daily allowance from Uncle Ols.",
    execute: async (interaction) => {

        const commandName = 'daily'

        let cooldown = await cooldownSchema.findOne({ Guild: interaction.guild.id, Command: commandName, User: interaction.user.id });

        if (cooldown && Date.now() < cooldown.End) {
            const { default: prettyMs } = await import('pretty-ms');

            const embed = new EmbedBuilder()
                .setDescription(`On cooldown for **${prettyMs(cooldown.End - Date.now())}**`)
                .setColor('Red')
                .setFooter({ text: "Axol Systems."})

            await interaction.reply({ embeds: [embed] });
            return;
        }

        if (cooldown && Date.now() > cooldown.End) {
            await cooldownSchema.deleteOne({ Guild: interaction.guild.id, Command: commandName, User: interaction.user.id });
            await cooldownSchema.bulkSave()
        }

        if (!cooldown) {
            cooldown = new cooldownSchema({ Guild: interaction.guild.id, Command: commandName, User: interaction.user.id});
        }


        let data = await economySchema.findOne({ Guild: interaction.guild.id, User: interaction.user.id });

        if (!data) return await interaction.reply({ content: "No account set up to transfer money.", ephemeral: true});

        cooldown.End = Date.now() + 8.64e+7;
        data.Money += 30;
        await Promise.all([cooldown.save(), data.save()]);


        const embed = new EmbedBuilder()
            .setDescription(`You have earned your daily amount of **£30.**`)
            .setFooter({ text: "Axol Bankin." })
            .setColor("Red")

        await interaction.reply({ embeds: [embed] });
        console.log(`[DEBUG] ${interaction.user.id} has earned £30. New balance: £${data.Money}.`);






    },
    init: async (interaction) => {

    }
}