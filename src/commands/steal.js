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
        .setName('steal')
        .setDescription('attempt to steal from someone')
        .addUserOption(option => option.setName('target').setDescription('who?').setRequired(true)),
    helpSection: "economy",
    helpDescription: "🥷💰  🏃‍♂️🏃‍♂️",
    execute: async (interaction) => {

        const commandName = 'steal'

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

        const chance = getRandomNumber(0, 100);
        const target = interaction.options.getUser('target')

        if (chance < 70) {
            const embed = new EmbedBuilder()
                .setDescription(`You attenpted to steal from **${target.username}** and got sod all.`)
                .setColor('Red')
                .setFooter({ text: "Axol Bankin." })

            await interaction.reply({ embeds: [embed] });
            cooldown.End = Date.now() + 300000;
            await cooldown.save();
            return;
        }

        const amount = getRandomNumber(1, 50)
        let playerdata = await economySchema.findOne({ Guild: interaction.guild.id, User: interaction.user.id });
        let stealdata = await economySchema.findOne({ Guild: interaction.guild.id, User: target.id })

        if (!playerdata) return await interaction.reply({ content: "No account found.", flags: MessageFlags.Ephemeral });
        if (!stealdata) return await interaction.reply({ content: "The person you wish to nick from isn\'t registered.", flags: MessageFlags.Ephemeral});
        if (stealdata.Money == 0) return await interaction.reply({ content: "They are broke lol.", flags: MessageFlags.Ephemeral });
        if (stealdata.Money < amount) return await interaction.reply({ content: "Computer says no.", flags: MessageFlags.Ephemeral });

        playerdata.Money += amount;
        stealdata.Money -= amount;
        cooldown.End = Date.now() + 300000;
        await Promise.all([ cooldown.save(), playerdata.save(), stealdata.save()]);

        const embed = new EmbedBuilder()
            .setDescription(`You have stolen **£${amount}** from **${target.username}!**`)
            .setColor('Red')
            .setFooter({ text: "Axol Bankin." })
        console.log(`[DEBUG] ${interaction.user.id} has stolen £${amount} from ${target}. New balance of Player: £${playerdata.Money}. New balance for target: £${stealdata.Money}.`);

        await interaction.reply({ embeds: [embed] });



    },
    init: async (client) => {
        
    }
}