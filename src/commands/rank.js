const { SlashCommandBuilder } = require('@discordjs/builders');
const { AttachmentBuilder, EmbedBuilder } = require('discord.js');
const levelSchema = require('../schemas/level');
const Canvacord = require('canvacord');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rank')
        .setDescription('Gives you the user\'s rank')
        .addUserOption(option => option.setName('user').setDescription('The member whose rank you want to see.').setRequired(false)),
    helpSection: "fun",
    helpDescription: "Lets you see your level and rank in the server.",
    execute: async (interaction) => {
        await interaction.deferReply();

        const { options, user, guild } = interaction;
        const Member = options.getMember('user') || user;
        const member = guild.members.cache.get(Member.id);

        if (!member) {
            return await interaction.editReply({ content: 'User not found.', ephemeral: true });
        }

        const data = await levelSchema.findOne({ Guild: guild.id, User: member.id });

        // Check if the user has any level data
        if (!data) {
            const embed = new EmbedBuilder()
                .setColor('Blue')
                .setDescription(`:white_check_mark: ${member} has no XP yet.`);

            return await interaction.editReply({ embeds: [embed] });
        }

        // Get all user level data from the database and sort it
        const leaderboard = await levelSchema.find({ Guild: guild.id }).sort({ Level: -1, XP: -1 });

        // Find the user's rank
        const rankPosition = leaderboard.findIndex(entry => entry.User === member.id) + 1;

        const Required = data.Level * data.Level * 20 + 20;

        Canvacord.Font.loadDefault();

        // Increase Image Size
        const rank = new Canvacord.RankCardBuilder()
            .setAvatar(member.displayAvatarURL({ forceStatic: false, size: 512 })) // Increase avatar quality
            .setBackground("https://cdn.discordapp.com/attachments/1121808555478110359/1127280273717997608/Axol_Systems_1.png")
            .setCurrentXP(data.XP)
            .setRequiredXP(Required)
            .setRank(rankPosition) // Use actual rank
            .setLevel(data.Level)
            .setUsername(member.user.username)
            .setStatus(member.presence?.status || "offline")

        const Card = await rank.build({ format: 'png' });
        const attachment = new AttachmentBuilder(Card, { name: "rank.png" });

        const embed2 = new EmbedBuilder()
            .setColor("Blue")
            .setTitle(`${member.user.username}\'s Rank`)
            .setImage("attachment://rank.png");

        try {
            await interaction.editReply({ content: `**__${member.user.username}\'s Rank__**`, files: [attachment] });
        } catch (error) {
            console.log(error);
        }
    },
    init: async (client) => {}
};
