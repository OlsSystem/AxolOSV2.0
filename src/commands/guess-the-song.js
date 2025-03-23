const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, MessageFlags,
    EmbedBuilder
} = require("discord.js");
const { Client } = require("genius-lyrics");
const cooldownSchema = require('../schemas/cooldown');
const economySchema = require('../schemas/economy');
const gameSchema = require('../schemas/songGuessing');
const geniusClient = new Client(process.env.GENIUSKEY);
const randomTermsList = ["rock", "monkey", "punk", "english", "alternative", "indie", "pop", "rnb", "hip hop", "electronic", "country", "metal", "heavy metal", "emo"];
const badWords = require('../lib/badwords');
const langdetect = require('langdetect');


function censorText(text) {
    const words = text.split(' ');

    const censoredWords = words.map(word => {
        const cleanedWord = word.replace(/[^a-zA-Z]/g, '').toLowerCase();
        if (badWords?.object?.[cleanedWord]) {
            return word[0] + 'x'.repeat(word.length - 1);
        }
        return word;
    });

    return censoredWords.join(' ');
}

function isEnglishLyrics(lyrics) {
    const result = langdetect.detect(lyrics);
    return result[0].prob > 0.8;
}

function extractSongName(title) {
    return title.replace(/\s*\(.*?\)\s*/g, '').trim();
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("guess-the-song")
        .setDescription("Big fat song guessing game."),
    helpSection: "fun",
    helpDescription: "Music from the world's hit music station. Guess the lyrics!",

    execute: async (interaction) => {

        const commandName = 'guess-the-song';

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


        if (interaction.isChatInputCommand()) {

            const game = await gameSchema.findOne({ Guild: interaction.guild.id, User: interaction.user.id });

            if (game) {
                return await interaction.reply({ content: "You have an on going game already in this server.", flags: MessageFlags.Ephemeral });
            }

            await interaction.deferReply();

            const randomTerm = randomTermsList[Math.floor(Math.random() * randomTermsList.length)];
            const searches = await geniusClient.songs.search(randomTerm);
            const randomSong = searches[Math.floor(Math.random() * searches.length)];
            let lyricsUnfilted = await randomSong.lyrics();
            let lyricsFilted = censorText(lyricsUnfilted);

            while (!isEnglishLyrics(lyricsFilted)) {
                const randomTermTwo = randomTermsList[Math.floor(Math.random() * randomTermsList.length)];
                const searchTwo = await geniusClient.songs.search(randomTermTwo);
                const randomSong = searches[Math.floor(Math.random() * searches.length)];
                lyricsUnfilted = await randomSong.lyrics();
                lyricsFilted = censorText(lyricsUnfilted);
            }

            const splitLyrics = lyricsFilted.split("\n").filter(line => line.trim().length > 0);
            if (splitLyrics.length < 6) return interaction.editReply("Not enough lyrics found, try again!");


            const userId = interaction.user.id;
            const gameData = await gameSchema.create({
                Guild: interaction.guild.id,
                User: interaction.user.id,
                SongName: extractSongName(randomSong.title),
                SongArtist: randomSong.artist.name,
                Balance: 100,
                GuessesLeft: 5,
                NextLineIndex: 6,
                FullLyrics: splitLyrics,
                RevealedLines: splitLyrics.slice(0, 6),
            })


            const buttons = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId("guess-the-song_guess").setLabel("🎤 Guess").setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId("guess-the-song_giveup").setLabel("❌ Give Up").setStyle(ButtonStyle.Danger),
                new ButtonBuilder().setCustomId("guess-the-song_buy").setLabel("💰 Buy Line (£10)").setStyle(ButtonStyle.Success)
            );

            const mainEmbed = new EmbedBuilder()
                .setTitle("🎶 Guess The Song")
                .setDescription(`${censorText(gameData.RevealedLines.join("\n"))}\n\n💰 **Balance:** £100`)
                .setFooter({ text: "Axol System Song Guessing"})
                .setColor("Red")

            return await interaction.editReply({
                embeds: [mainEmbed],
                components: [buttons]
            });
        }

        if (interaction.isButton() || interaction.isModalSubmit()) {
            const customId = interaction.customId;
            const userId = interaction.user.id;
            const game = await gameSchema.findOne({ Guild: interaction.guild.id, User: userId });
            if (!game) return interaction.reply({ content: "No active game found!", flags: MessageFlags.Ephemeral });

            if (customId === "guess-the-song_guess") {
                const modal = new ModalBuilder()
                    .setCustomId("guess-the-song_guessModal")
                    .setTitle("Guess the Song!")
                    .addComponents(
                        new ActionRowBuilder().addComponents(
                            new TextInputBuilder().setCustomId("songGuess").setLabel("Enter song title").setStyle(TextInputStyle.Short)
                        )
                    );
                return await interaction.showModal(modal);
            }

            if (customId === "guess-the-song_giveup") {
                await gameSchema.deleteOne({ Guild: interaction.guild.id, User: userId });
                return interaction.update({
                    content: `❌ **You gave up!** The song was **${game.SongName}** by **${game.SongArtist}**.`,
                    components: []
                });
            }

            if (customId === "guess-the-song_buy") {
                if (game.Balance < 10) return interaction.reply({ content: "Not enough money!", flags: MessageFlags.Ephemeral });

                // Reveal the next available line
                if (game.NextLineIndex < game.FullLyrics.length) {
                    game.RevealedLines.push(censorText(game.FullLyrics[game.NextLineIndex]));
                    game.NextLineIndex++;
                    game.Balance -= 10;

                    game.save();
                } else {
                    return interaction.reply({ content: "No more lines available!", flags: MessageFlags.Ephemeral });
                }

                const editedEmbed = new EmbedBuilder()
                    .setTitle("🎶 Guess The Song")
                    .setDescription(`${censorText(game.RevealedLines.join("\n"))}\n\n💰 **Balance:** £${game.Balance}`)
                    .setFooter({ text: "Axol System Song Guessing"})
                    .setColor("Red")

                return await interaction.update({
                    embeds: [editedEmbed],
                    components: interaction.message.components
                });
            }

            if (customId === "guess-the-song_guessModal") {
                const userGuess = interaction.fields.getTextInputValue("songGuess").toLowerCase();
                const correctTitle = game.SongName.toLowerCase();

                if (userGuess === correctTitle) {
                    await gameSchema.deleteOne({ Guild: interaction.guild.id, User: userId });
                    const economyData = await economySchema.findOne({ Guild: interaction.guild.id, User: userId });

                    if (economyData) {
                        economyData.Money += game.Balance;
                        await economyData.save();
                    }

                    cooldown.End = Date.now() + 60000;

                    await cooldown.save();

                    return interaction.update({
                        content: `🎉 **Correct!** The song was **${game.SongName}** by **${game.SongArtist}**! You Won £**${game.Balance}!**`,
                        components: []
                    });
                }

                game.GuessesLeft--;
                game.save();
                if (game.GuessesLeft === 0) {
                    await gameSchema.deleteOne({ Guild: interaction.guild.id, User: userId });
                    return interaction.update({
                        content: `❌ **Game Over!** The song was **${game.SongName}** by **${game.SongArtist}**.`,
                        components: []
                    });
                }

                return await interaction.reply({
                    content: `❌ Wrong guess! **${game.GuessesLeft} guesses left.**`,
                    flags: MessageFlags.Ephemeral
                });
            }
        }
    },

    init: async (client) => {}
};
