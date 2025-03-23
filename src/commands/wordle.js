const { Wordle } = require("discord-gamecord");
const { SlashCommandBuilder, MessageFlags } = require("discord.js");
const economySchema = require('../schemas/economy');

var timeout = [];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('wordle')
        .setDescription("omg guys its that hit game wordle"),
    helpSection: "fun",
    helpDescription: "that really popular new york times game",
    execute: async (interaction) => {

        if (timeout.includes(interaction.user.id)) return await interaction.reply({ content: "Calm down my G. Come back in 5.", flags: MessageFlags.Ephemeral });

        const Game = new Wordle({
            message: interaction,
            isSlashGame: false,
            embed: {
                title: "Wordle",
                color: "#FF0000"
            },
            customWord: null,
            timeoutTime: 60000,
            winMessage: `Congrats ur smort. World is **{word}**`,
            loseMessage: `Not smart L L L L L. World is **{word}**`,
            playerOnlyMessage: "Only my g {player} may button"
        });

        Game.startGame();
        Game.on('gameOver', async result => {
            if (result.winner) {
                console.log(`🎉 ${interaction.user.username} won the game! The word was: ${result.word}. **£25** quid deposited into your account.`);
                const data = await economySchema.findOne({ Guild: interaction.guild.id, User: interaction.user.id });

                if (data) {
                    data.Money += 25
                    await data.save();
                }
            } else {
                console.log(`😢 ${interaction.user.username} lost the game. The word was: ${result.word}`);
            }
        })

        timeout.push(interaction.user.id);
        setTimeout(() => {
            timeout.shift();
        }, 3000000)

    },
    init: async (client) => {

    }

}