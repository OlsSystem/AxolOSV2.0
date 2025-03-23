const economySchema = require('../schemas/economy');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('spinny-wheel')
        .setDescription('wheel of spin')
        .addIntegerOption(options => options.setName('bet-amount').setDescription('how much u bettin').setRequired(true).setMinValue(10))
        .addStringOption(options => options.setName('colour').setDescription('Pick a colour any colour.').addChoices(
            { name: "Red", value: "Red"},
            { name: "Black", value: "Black"}
        ).setRequired(true))
        .addIntegerOption(options => options.setName('number').setDescription('Pick a number bewteen 0 and 36').setMinValue(0).setMaxValue(36).setRequired(true)),
    helpSection: "economy",
    helpDescription: "like the wheel of fortune but you lose everytime cus its rigged.",
    execute: async (interaction) => {

        let totalWon = 0
        let valuesTable = {0: 'green', 1: 'Red', 2: 'Black', 3: 'Red', 4: 'Black', 5: 'Red', 6: 'Black', 7: 'Red', 8: 'Black', 9: 'Red', 10: 'Black', 11: 'Black', 12: 'Red', 13: 'Black', 14: 'Red', 15: 'Black', 16: 'Red', 17: 'Black', 18: 'Red', 19: 'Red', 20: 'Black', 21: 'Red', 22: 'Black', 23: 'Red', 24: 'Black', 25: 'Red', 26: 'Black', 27: 'Red', 28: 'Black', 29: 'Black', 30: 'Red', 31: 'Black', 32: 'Red', 33: 'Black', 34: 'Red', 35: 'Black', 36: 'Red'}
        let data = await economySchema.findOne({ Guild: interaction.guild.id, User: interaction.user.id });
        let pickedColour = await interaction.options.getString('colour');
        const pickedNumber = await interaction.options.getInteger('number');
        const bettingAmount = await interaction.options.getInteger('bet-amount');

        if (!data) {
            await interaction.reply({ content: "Bro has no account." })
        } else {
            data.Money -= bettingAmount
            const randomNumber = getRandomInt(0, 36);

            if (pickedColour == valuesTable[randomNumber]) {
                totalWon = bettingAmount * 1.5
            }

            if (pickedNumber == randomNumber) {
                totalWon = totalWon + (bettingAmount * 2)
            }


            data.Money += totalWon

            await Promise.all([data.save()]);

            let colourDisplay = 'Red'

            if (pickedColour == "Black") {
                pickedColour = 'DarkButNotBlack'
                colourDisplay = "Black"
            }

            const embed = new EmbedBuilder()
                .setDescription(`The Colour was **${colourDisplay}** and the number was **${randomNumber}**. You have won yourself a cheeky **£${totalWon}**`)
                .setColor(pickedColour)
                .setFooter({ text: "Axol Banking Innit." })

            await interaction.reply({ embeds: [embed] })
            return;
        }


    },
    init: async (client) => {

    }
}