const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("membercount")
        .setDescription('tells u how many members u have'),
    helpSection: "moderation",
    helpDescription: "Checks how many people are held ~~against their will~~ in your server.",
    execute: async (interaction) => {
        const guild = interaction.guild;
        const memberCount = guild.memberCount;
        const botCount = guild.members.cache.filter((member) => member.user.bot).size;
        const humanCount = memberCount - botCount;

        const embed = new EmbedBuilder()
            .setColor("Red")
            .setTitle("Member Count")
            .setDescription(`👥 ${memberCount}\n\n**Humans**\n👤 ${humanCount}\n\n**Bots**\n🤖 ${botCount}`)
            .setThumbnail(guild.iconURL({ size: 4096, dynamic: true }) || "https://cdn.discordapp.com/attachments/1097171486852255785/1097634246593609868/0a84c22d05ea3f137fe0ca09b9bf9f3a.jpg")
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
    init: async (client) => {

    }
};