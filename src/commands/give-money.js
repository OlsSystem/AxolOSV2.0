const economySchema = require('../schemas/economy');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('give-money')
        .setDescription('give money to a kid.')
        .addIntegerOption(option => option.setName('money').setDescription('how much').setRequired(true))
        .addUserOption(option => option.setName('target').setDescription('who?').setRequired(true)),
    helpSection: "economy",
    helpDescription: "Charity basically. Massive tax writeoffs.",
    execute: async (interaction) => {



        const target = interaction.options.getUser('target');
        const money = interaction.options.getInteger('money');

        let data = await economySchema.findOne({ Guild: interaction.guild.id, User: target.id });


        if (!data) {
            await interaction.reply({ content: "User has No account.", ephemeral: true });
        } else {
            let data = await economySchema.findOne({ Guild: interaction.guild.id, User: interaction.user.id });
            if (data.Money <= "0") return await interaction.reply({ content: "You are a brokey mate.", ephemeral: true });
            if (data.Money < money) return await interaction.reply({ content: "You don\'t have that money in ur account", ephemeral: true});
            if (money < "0") return await interaction.reply({ content: "No bad bad.", ephemeral: true});
            data.Money -= money;
            await data.save();

            data = await economySchema.findOne({ Guild: interaction.guild.id, User: target.id });
            data.Money += money;
            await data.save();

            const embed = new EmbedBuilder()
                .setDescription(`You have given **£${money}** to ${target}.`)
                .setColor('Red')
                .setFooter({ text: "Axol Banking Innit." })

            await interaction.reply({ embeds: [embed] })
            console.log(`[DEBUG] ${interaction.user.id} has given ${target.username} £${money}. New balance: £${data.Money}.`);
        }
    },
    init: async (client) => {

    }
}