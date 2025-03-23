const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionsBitField, EmbedBuilder, Client, GatewayIntentBits, MessageFlags } = require('discord.js');


module.exports = {
    data: new SlashCommandBuilder()
        .setName("give-role")
        .setDescription("gives a role. read it")
        .addRoleOption(option => option.setName("role").setDescription("what role give?").setRequired(true))
        .addUserOption(option => option.setName("user").setDescription("who?").setRequired(true)),
    modPermissions: true,
    helpSection: "moderation",
    helpDescription: "For the lazy ones who can't click on a user to give out a role.",
    permissions: [PermissionsBitField.Flags.ManageRoles],
    execute: async (interaction) => {
        const givenRole = interaction.options.get("role").role;

        const roleUser = await interaction.guild.members.fetch(interaction.user.id);
        const botMember = await interaction.guild.members.fetch(interaction.guild.members.me.id);

        if (botMember.roles.highest.position <= givenRole.position) {
            return await interaction.reply({ content: "I cannot assign this role because it is higher or equal to my highest role.", flags: MessageFlags.Ephemeral });
        }

        if (roleUser.roles.highest.position <= givenRole.position) {
            return await interaction.reply({ content: "You can't give a role that is higher then the your highest role.", flags: MessageFlags.Ephemeral });
        }

        if (roleUser.roles.cache.has(givenRole.id)) {
            return await interaction.reply({ content: "The user already has this role.", flags: MessageFlags.Ephemeral  });
        }

        try {
            await roleUser.roles.add(givenRole.id);
            const embed = new EmbedBuilder()
                .setDescription(`Congrats! You have given the role ${givenRole} to ${roleUser}.`)
                .setColor("Blue");
            await interaction.reply({ embeds: [embed] });
            console.log(`[DEBUG] ${interaction.guild.id} gave a role to a user.`);
        } catch (err) {
            console.log("[DEBUG] Error while giving role");
            await interaction.reply({ content: "Error while giving roles. Please check my Permissions!" });
        }
    },
    init: async (client) => {

    }
};