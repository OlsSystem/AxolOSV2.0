const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, Client, GatewayIntentBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("who-has")
        .setDescription("says who has a role.")
        .addRoleOption(option => option.setName("role").setDescription("what role checking?").setRequired(true)),
    helpSection: "events",
    helpDescription: "who had who what where",
    execute: async (interaction) => {

        const requestedRole = interaction.options.get("role").role;
        const guild = interaction.guild;

        const searchedRole = guild.roles.cache.get(requestedRole.id);
        const membersWithRole = guild.members.cache.filter(member => member.roles.cache.has(searchedRole.id));
        const memberList = membersWithRole.map(member => member.user.tag).join('\n') || "Nobody";

        const embed = new EmbedBuilder()
            .setTitle(`Users with ${requestedRole.name}:`)
            .setColor("Red")
            .setDescription(`${memberList}`)
        await interaction.reply({ embeds: [embed] });
    },
    init: async (client) => {

    }

}