const rrSchema = require('../schemas/ReactionRoles');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionsBitField, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, MessageFlags} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reaction-roles')
        .setDescription('adding, removing, or displaying reaction roles.')
        .addSubcommand(command => command.setName('add').setDescription('adds said react rolea').addRoleOption(option => option.setName('role').setDescription('de role u giving out').setRequired(true)).addStringOption(option => option.setName('descrption').setDescription('de description of el role').setRequired(false)).addStringOption(option => option.setName('emoji').setDescription('de emoji of el role').setRequired(false)))
        .addSubcommand(command => command.setName('remove').setDescription('removes said react rolea').addRoleOption(option => option.setName('role').setDescription('de role u removing').setRequired(true)))
        .addSubcommand(command => command.setName('panel').setDescription('makes the role panel')),
    modPermissions: true,
    permissions: [PermissionsBitField.Flags.ManageRoles, PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
    helpSection: "setup",
    helpSubCommands: "add/remove/panel",
    helpDescription: "Commands to help setup your reaction role panel.",
    execute: async (interaction) => {


        if (interaction.isChatInputCommand()) {
            const { options, guildId, guild, member } = interaction;
            const subcommand = interaction.options.getSubcommand();
            const role = options.getRole('role');
            const data = await rrSchema.findOne({ Guild: guildId });


            switch (subcommand) {
                case 'add':
                    let description = options.getString('descrption') || "N/A";
                    let emoji = options.getString('emoji') || "🤓";

                    try {

                        if (role.position >= member.roles.highest.position) return await interaction.reply({
                            content: "Hmm. I can't do that role seems too high for you.",
                            flags: MessageFlags.Ephemeral
                        });

                        const newRole = {
                            roleId: role.id,
                            roleDescription: description,
                            roleEmoji: emoji,
                        }

                        if (data) {
                            let roleData = data.Roles.find((x) => x.roleId === role.id)

                            if (roleData) {
                                roleData = newRoleData
                            } else {
                                data.Roles = [...data.Roles, newRole]
                            }

                            await data.save();
                        } else {
                            await rrSchema.create({
                                Guild: guildId,
                                Roles: newRole,
                            });
                        }

                        return interaction.reply({ content: "New Role Created.", flags: MessageFlags.Ephemeral })
                    } catch (err) {
                        console.log(err);
                    }
                    break;


                case 'remove':
                    try {
                        if (!data) return await interaction.reply({
                            content: "No data Found.",
                            flags: MessageFlags.Ephemeral
                        })

                        const roles = data.Roles;
                        const findRole = roles.find((r) => r.roleId === role.id)

                        if (!findRole) return await interaction.reply({
                            content: "Said role no exist.",
                            flags: MessageFlags.Ephemeral
                        });

                        const filteredRoles = roles.filter((r) => r.roleId !== role.id);
                        data.Roles = filteredRoles;

                        await data.save();


                        return interaction.reply({ content: "Role Removed.", flags: MessageFlags.Ephemeral })
                    } catch (err) {
                        console.log(err);
                    }
                    break;

                case 'panel':
                    try {
                        if (!data.Roles.length > 0) return await interaction.reply({
                            content: "Add said roles first you nerd :nerd:",
                            flags: MessageFlags.Ephemeral
                        });

                        const panelEmbed = new EmbedBuilder()
                            .setTitle('Reaction Roles!')
                            .setColor('Red')
                            .setDescription('Roles get your fresh hot roles here today!')

                        const options = data.Roles.map(x => {
                            const role = guild.roles.cache.get(x.roleId);

                            return {
                                label: role.name,
                                value: role.id,
                                description: x.roleDescription,
                                emoji: x.roleEmoji || undefined,
                            };
                        });

                        const menuComponents = new ActionRowBuilder()
                            .addComponents(
                                new StringSelectMenuBuilder()
                                    .setCustomId('reaction-roles-panel')
                                    .setMaxValues(options.length)
                                    .addOptions(options),
                            )

                        const channel = await interaction.channel

                        await channel.send({ embeds: [panelEmbed], components: [menuComponents] })

                        await interaction.reply({ content: "Panel Sent.", flags: MessageFlags.Ephemeral })
                    } catch (err) {
                        await console.log(err)
                    }
                    break;
            }
        }

        const { customId, values, guild, member } = interaction;

        try {

            if (interaction.isStringSelectMenu()) {
                if (customId === "reaction-roles-panel") {
                    for (let i = 0; i < values.length; i++) {
                        const roleId = values[i];

                        const role = guild.roles.cache.get(roleId);
                        const hasRole = member.roles.cache.has(roleId);

                        switch (hasRole) {
                            case true:
                                member.roles.remove(roleId);
                                break;
                            case false:
                                member.roles.add(roleId);
                                break;
                        }
                    }
                    await interaction.reply({ content: "Roles Updated!", flags: MessageFlags.Ephemeral });


                }
            }
        } catch (err) {
            await interaction.reply({ content: "An Error has occured. Check your roles to see if its worked.", flags: MessageFlags.Ephemeral })
        }
    },
    init: async (client) => {

    }
}