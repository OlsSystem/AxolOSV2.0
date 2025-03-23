const { SlashCommandBuilder, EmbedBuilder, MessageFlags, PermissionsBitField } = require('discord.js');
const permissionsDB = require('../schemas/permissions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('permissions')
        .setDescription('blacklists a user from axol systems')
        .addSubcommand(command => command.setName('add').setDescription("adds a role to the mod permissions.").addRoleOption(option => option.setName('role').setDescription("role to add to mod perms").setRequired(true)))
        .addSubcommand(command => command.setName('remove').setDescription("removes a role from mod permissions.").addRoleOption(option => option.setName('role').setDescription("role to remove from mod perms").setRequired(true)))
        .addSubcommand(command => command.setName("view").setDescription("views all roles with mod permissions.")),
    helpSection: "setup",
    helpSubCommands: "add/remove/view",
    rolePermissions: [PermissionsBitField.Flags.Administrator],
    helpDescription: "Sets up moderator permissions for your server.",
    execute: async (interaction) => {

        const { options } = interaction;

        const sub = options.getSubcommand();
        const role = options.getRole("role");
        const data = await permissionsDB.findOne({ Guild: interaction.guild.id });

        if (!data) {
            await permissionsDB.create({
                Guild: interaction.guild.id,
                Roles: []
            });
        }

        switch (sub) {
            case "add":
                await interaction.deferReply({ flags: MessageFlags.Ephemeral })
                let newData = {
                    roleId: role.id,
                }
                console.log(data.Roles)
                let isAlreadyThere = data.Roles.find((x) => x.roleId === role.id);

                if (!isAlreadyThere) {
                    data.Roles = [...data.Roles, newData];
                    await data.save();
                    await interaction.editReply({ content: `The role ${role} has been given moderator status.`, flags: MessageFlags.Ephemeral })

                } else {
                    await interaction.editReply({ content: `The role ${role} has already been given moderator status.`, flags: MessageFlags.Ephemeral})
                }
                break;
            case "remove":
                await interaction.deferReply({ flags: MessageFlags.Ephemeral })
                let isRoleThere = data.Roles.find((x) => x.roleId === role.id);

                if (!isRoleThere) {
                    await interaction.editReply({ content: `The role ${role} wasn't found to have moderator status.`})
                } else {

                    data.Roles = data.Roles.filter((x) => x.roleId !== role.id);
                    await data.save()

                    await interaction.editReply({content: `The role ${role} has been removed from the moderator permissions list.`})
                }
                break;
            case "view":
                let roleList = []

                if (data.Roles.length <= 0) {
                    await interaction.reply({ content: `This server has no moderator roles setup.`, flags: MessageFlags.Ephemeral })
                } else {
                    await Promise.all(data.Roles.map(async (roles) => {
                        const role = interaction.guild.roles.cache.get(roles.roleId); // Fetch the role from the guild
                        console.log(role)
                        roleList.push(`**Role:** ${role.name} - ${role}`)
                    }));



                    const embed = new EmbedBuilder()
                        .setTitle('Moderator Roles')
                        .setThumbnail("https://cdn.discordapp.com/attachments/1099810701335334912/1122999511543992330/0a84c22d05ea3f137fe0ca09b9bf9f3a.jpg")
                        .setDescription(`${roleList.join('\n')}`)
                        .setColor('Red')

                    await interaction.reply({ embeds: [embed] })
                }
                break;




        }

        await data.save();
    },
    init: (client) => {

    }
}