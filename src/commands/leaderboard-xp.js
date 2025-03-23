const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const levelSchema = require('../schemas/level');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard-xp')
        .setDescription('See who has the most XP!'),
    helpSection: "fun",
    helpDescription: "Race to the top of the leaderboard and flex your XP.",
    execute: async (interaction) => {
        const { guild, client } = interaction;

        await interaction.deferReply(); // Defer reply to prevent timeout

        // Fetch leaderboard data from database
        const Data = await levelSchema.find({ Guild: guild.id })
            .sort({ Level: -1, XP: -1 }) // Sort by Level first, then XP
            .limit(10); // Get top 10 users

        if (Data.length === 0) {
            return interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setColor("Blue")
                        .setDescription(':white_check_mark: No XP data found. Start chatting!')
                ]
            });
        }

        let leaderboardText = "";
        let positionEmojis = ["🥇", "🥈", "🥉"]; // For the top 3 ranks

        for (let i = 0; i < Data.length; i++) {
            let { User, XP, Level } = Data[i];
            let userTag;
            let userAvatar;

            try {
                const fetchedUser = await client.users.fetch(User);
                userTag = fetchedUser.username;
                userAvatar = fetchedUser.displayAvatarURL({ format: "png", size: 128 });
            } catch (error) {
                userTag = "Unknown User";
                userAvatar = "https://cdn.discordapp.com/embed/avatars/0.png"; // Default avatar
            }

            let rankEmoji = positionEmojis[i] || `#${i + 1}`;
            leaderboardText += `${rankEmoji} **${userTag}** - Level: \`${Level}\` | XP: \`${XP}\`\n`;
        }

        const embed = new EmbedBuilder()
            .setColor("Blue")
            .setTitle(`${guild.name}'s XP Leaderboard`)
            .setDescription(leaderboardText)
            .setThumbnail(guild.iconURL({ size: 4096, dynamic: true }) || "https://cdn.discordapp.com/attachments/1097171486852255785/1097634246593609868/0a84c22d05ea3f137fe0ca09b9bf9f3a.jpg")
            .setFooter({ text: "AxolOS XP System Leaderboard" })
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
    },
    init: async (client) => {}
};
