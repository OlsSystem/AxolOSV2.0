const economySchema = require('../schemas/economy');
const cooldownSchema = require('../schemas/cooldown');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, MessageFlags } = require('discord.js');

function getRandomNumber(x, y) {
    const range = y - x + 1;
    const randomNumber = Math.floor(Math.random() * range);
    return randomNumber + x;
}

var timeout = [];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('beg')
        .setDescription('beg for money'),
    helpSection: "economy",
    helpDescription: "Kid wanting a new game simulator.",
    execute: async (interaction) => {

        const commandName = 'beg'

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


        let data = await economySchema.findOne({ Guild: interaction.guild.id, User: interaction.user.id, GuildName: interaction.guild.name });

        if (!data) return await interaction.reply({ content: "No account found.", flags: MessageFlags.Ephemeral });

        const chance = getRandomNumber(0, 100);

        if (chance < 70) {
            const embed = new EmbedBuilder()
                .setDescription(`You attenpted to beg for money and got sod all.`)
                .setColor('Red')
                .setFooter({ text: "Axol Bankin." })

            await interaction.reply({ embeds: [embed] });
            cooldown.End = Date.now() + 60000;
            await cooldown.save();
            return;
        }

        const amount = getRandomNumber(1, 20)


        data.Money += amount;
        cooldown.End = Date.now() + 60000;
        await Promise.all([ cooldown.save(), data.save()]);

        const embed = new EmbedBuilder()
            .setDescription(`The stranger felt bad for you and gave you **£${amount}**.`)
            .setColor('Red')
            .setFooter({ text: "Axol Bankin." })
        console.log(`[DEBUG] ${interaction.user.id} has earned £${amount}. New balance: £${data.Money}.`);

        await interaction.reply({ embeds: [embed] });



    },
    init: async (client) => {

    }
}