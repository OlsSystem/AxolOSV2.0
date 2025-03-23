const economySchema = require('../schemas/economy');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const cooldownSchema = require('../schemas/cooldown');

var timeout = [];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('work')
        .setDescription('work make money'),
    helpSection: "economy",
    helpDescription: "irl",
    execute: async (interaction) => {

        const commandName = 'work'

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


        const money = interaction.options.getInteger('money');

        let data = await economySchema.findOne({ Guild: interaction.guild.id, User: interaction.user.id });
        const choice = ["You worked as a Youtuber and made", "As a window cleaner you made", "You worked as a night guard at the Pizza Place and made", "You worked as a police man and made", "You did some science in a lab and made", "You made some kid a random subway sandwich and made", "You worked at maccies for a day and made", "You worked at a shopping center and made", "You got fired from your job. You made", "Big up you started at taco bell. You made ", "Its a me pizza express! You made some tasty pizzas you made "]
        const job = Math.floor(Math.random() * choice.length);


        if (!data) return await interaction.reply({ content: "No account." });


        data.Money -= money;
        cooldown.End = Date.now() + 300000;
        await Promise.all([cooldown.save(), data.save()]);

        let amount = Math.floor(Math.random() * 5 * 27);
        if (choice[job] == "You got fired from your job. You made") {
            amount = "0";
        }

        if (amount == "0") {
            const embed = new EmbedBuilder()
                .setDescription(`${choice[job]} **£${amount}**.`)
                .setFooter({ text: "Axol Bankin." })
                .setColor("Red")

            await interaction.reply({ embeds: [embed] });
        } else {


            data.Money += amount;
            await data.save();

            const embed = new EmbedBuilder()
                .setDescription(`${choice[job]} **£${amount}**.`)
                .setFooter({ text: "Axol Bankin." })
                .setColor("Red")

            await interaction.reply({ embeds: [embed] });
            console.log(`[DEBUG] ${interaction.user.id} has earned £${amount}. New balance: £${data.Money}.`);
        }

    },
    init: async (client) => {

    }
}