const economySchema = require('../schemas/economy');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, MessageFlags } = require('discord.js');
const cooldownSchema = require('../schemas/cooldown');

var timeout = [];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('slots')
        .setDescription('bet ur money')
        .addIntegerOption(option => option.setName('money').setDescription('how much u betting?').setRequired(true)),
    helpSection: "economy",
    helpDescription: "its gambling but with virtual pounds",
    execute: async (interaction) => {

        const money = interaction.options.getInteger('money');

        const commandName = 'slots'

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

        if (!cooldown) {
            cooldown = new cooldownSchema({ Guild: interaction.guild.id, Command: commandName, User: interaction.user.id});
        }


        let data = await economySchema.findOne({ Guild: interaction.guild.id, User: interaction.user.id });

        if (!data) return await interaction.reply({ content: "No account.", flags: MessageFlags.Ephemeral });
        if (data.Money == 0) return await interaction.reply({ content: "Your broke. L L L L L L" })
        if (money == 0) return await interaction.reply({ content: "Bet some money god dam it.", flags: MessageFlags.Ephemeral });
        if (money < 0) return await interaction.reply({ content: "No bad bad.", flags: MessageFlags.Ephemeral });
        if (data.Money < money) return await interaction.reply({ content: "You don\'t have that money in ur account", flags: MessageFlags.Ephemeral });
        if (money < 10) return await interaction.reply({ content: "Must gamble atleast a tenna.", flags: MessageFlags.Ephemeral });


        const didWin = Math.random() > 0.45;

        if (!didWin) {
            data.Money -= money;
            cooldown.End = Date.now() + 60000;
            await Promise.all([cooldown.save(), data.save()]);

            const embed = new EmbedBuilder()
                .setDescription(`Slot machine says no.`)
                .setFooter({ text: "Axol Bankin." })
                .setColor("Red")

            await interaction.reply({ embeds: [embed] });
            return;
        }

        const amountWon = Number((money * (Math.random() * 0.65)).toFixed(0));

        data.Money += amountWon;
        data.Money -= money;
        cooldown.End = Date.now() + 60000;
        await Promise.all([cooldown.save(), data.save()]);

        const embed = new EmbedBuilder()
            .setDescription(`Congrats you won ${amountWon} quid. check ur bal to see how much moneh u got.`)
            .setFooter({ text: "Axol Bankin." })
            .setColor("Red")

        await interaction.reply({ embeds: [embed] });
        console.log(`[DEBUG] ${interaction.user.id} has earned £${amountWon}. New balance: £${data.Money}.`);

    },
    init: async (client) => {

    }
}