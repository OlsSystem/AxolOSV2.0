const { Hangman } = require("discord-gamecord");
const { SlashCommandBuilder } = require("discord.js");
const economySchema = require("../schemas/economy")

var timeout = [];


module.exports = {
    data: new SlashCommandBuilder()
        .setName('hangperson')
        .setDescription("hangman would get me cancelled so its this now"),
    helpSection: "fun",
    helpDescription: "Off brand hangman since you know I would get cancelled.",
    execute: async (interaction) => {

        if (timeout.includes(interaction.user.id)) return await interaction.reply({ content: "Calm down my G. Come back in 5.", ephemeral: true });

        const Game = new Hangman({
            message: interaction,
            embed: {
                title: "HangPerson",
                color: "#FF0000"
            },
            hangman: { hat: "🎩", head: "😰", shirt: "👕", pants: "🩳", boots: "👢"},
            timeoutTime: 60000,
            timeWords: "all",
            winMessage: "Congrats Jego has survived another day. The word is **{word}**",
            loseMessage: "You killed Jego L Bozo. Word was **{word}**",
            playerOnlyMessage: "Only my g {player} can use",
        })

        Game.startGame();
        Game.on('gameOver', async (result) => {
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
        });


        timeout.push(interaction.user.id);
        setTimeout(() => {
            timeout.shift();
        }, 300000)

    },
    init: async (client) => {

    }
}