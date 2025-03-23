const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionsBitField, MessageFlags } = require(`discord.js`);
const { EmbedBuilder } = require('discord.js');
const roleSchema = require('../schemas/autorole');



module.exports = {
    data: new SlashCommandBuilder()
        .setName(`autorole`)
        .setDescription(`autorole users on join`)
        .addSubcommand(command => command.setName('add').setDescription('adds a new auto role to your server').addRoleOption(option => option.setName(`role`).setDescription(`the role ur adding to autorole`).setRequired(true)))
        .addSubcommand(command => command.setName('remove').setDescription('removes an auto role to your server').addRoleOption(option => option.setName(`role`).setDescription(`the role ur removing from autorole`).setRequired(true)))
        .addSubcommand(command => command.setName('view').setDescription('shows all your autoroles for your server')),
    permissions: [PermissionsBitField.Flags.ManageRoles],
    modPermissions: true,
    rolePermissions: [PermissionsBitField.Flags.Administrator],
    helpSection: "moderation",
    helpSubCommands: "add/remove/view",
    helpDescription: "This allows you to set an autorole for when people join the server.",
    execute: async (interaction) => {

        const { options } = interaction;
        const sub = options.getSubcommand();
        const role = interaction.options.getRole(`role`);



        switch (sub) {

            case 'add':
                await interaction.deferReply({ flags: MessageFlags.Ephemeral })
                if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                    return await interaction.editReply({context: "Autorole set. Jk. :nerd: U need admin for this fam.", flags: MessageFlags.Ephemeral });
                }

                const botMember = interaction.guild.members.me;

                if (role.position >= botMember.roles.highest.position) {
                    return interaction.editReply({
                        content: `❌ I cannot manage the **${role.name}** role because it is equal to or higher than my highest role.`,
                        flags: MessageFlags.Ephemeral
                    });
                }

                const findRole = await roleSchema.findOne({ GuildID: interaction.guild.id, RoleID: role.id });

                if (!findRole) {
                    await roleSchema.create({
                        GuildID: interaction.guild.id,
                        RoleName: role.name,
                        RoleID: role.id,
                    })

                    const embed = new EmbedBuilder()
                        .setColor("Blue")
                        .setDescription(`:white_check_mark:  Your auto role has been set to ${role}`)
                    await interaction.editReply({ embeds: [embed], flags: MessageFlags.Ephemeral });
                } else {
                    const embed = new EmbedBuilder()
                        .setColor("Red")
                        .setDescription(`❌ The role ${role} is already being automatically added.`)
                    await interaction.editReply({ embeds: [embed], flags: MessageFlags.Ephemeral });
                }
                break;

            case 'remove':
                await interaction.deferReply({ flags: MessageFlags.Ephemeral })

                if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                    return await interaction.reply({context: "Autorole set. Jk. :nerd: U need admin for this fam.", flags: MessageFlags.Ephemeral });
                }

                const isAnAutoRole = await roleSchema.findOne({ GuildID: interaction.guild.id, RoleID: role.id });

                if (isAnAutoRole) {
                    await roleSchema.deleteOne({ GuildID: interaction.guild.id, RoleID: role.id });

                    const embed = new EmbedBuilder()
                        .setColor("Blue")
                        .setDescription(`:white_check_mark: Your auto role ${role} has been removed`)
                    await interaction.editReply({ embeds: [embed], flags: MessageFlags.Ephemeral });
                } else {
                    const embed = new EmbedBuilder()
                        .setColor("Red")
                        .setDescription(`❌ The role ${role} isn't being automatically given.`)
                    await interaction.editReply({ embeds: [embed], flags: MessageFlags.Ephemeral });
                }
                break;

            case 'view':
                const data = await roleSchema.find({ GuildID: interaction.guild.id });
                let roleList = [];

                if (data.length <= 0) {
                    await interaction.reply({ content: `This server has no auto roles set up.`, flags: MessageFlags.Ephemeral });
                } else {
                    await Promise.all(data.map(async (roleData) => {
                        const role = interaction.guild.roles.cache.get(roleData.RoleID); // Fetch the role from the guild using roleData
                        if (role) {
                            roleList.push(`**Role:** ${role.name} - ${role}`);
                        } else {
                            roleList.push(`**Role:** ${roleData.RoleName} - NOT FOUND..`);
                            roleSchema.deleteOne({ GuildID: interaction.guild.id, RoleID: roleData.RoleID });
                        }
                    }));

                    const embed = new EmbedBuilder()
                        .setTitle('Auto Roles')
                        .setThumbnail("https://cdn.discordapp.com/attachments/1099810701335334912/1122999511543992330/0a84c22d05ea3f137fe0ca09b9bf9f3a.jpg")
                        .setDescription(roleList.length > 0 ? roleList.join('\n') : 'No roles found.')
                        .setColor('Red');

                    await interaction.reply({ embeds: [embed] });
                }
                break
        }
    },
    init: async (client) => {

    }
}