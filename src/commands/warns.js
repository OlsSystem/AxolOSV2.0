const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField, MessageFlags } = require('discord.js');
const permissions = require('../schemas/permissions');
const warns = require('../schemas/warnSchema');

async function checkPerms(interaction, modPermsData) {
    const hasAdminPerms = interaction.member.permissions.has(PermissionsBitField.Flags.Administrator);

    if (hasAdminPerms) return true; // Admins always pass permission checks

    if (!modPermsData || !modPermsData.Roles || modPermsData.Roles.length === 0) {
        return false;
    }

    const userRoles = interaction.member.roles.cache.map(role => role.id);
    const requiredRoleIds = modPermsData.Roles.map(role => role.roleId);

    return requiredRoleIds.some(roleId => userRoles.includes(roleId));
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warns')
        .setDescription('Warning commands for them naughty kids.')
        .addSubcommand(command => command.setName('add')
            .setDescription('Adds warnings')
            .addUserOption(option => option.setName('user').setDescription('User being warned.').setRequired(true))
            .addStringOption(option => option.setName('reason').setDescription('Reason for the warning.').setRequired(true))
            .addStringOption(option => option.setName('evidence').setDescription('Supporting evidence.')))
        .addSubcommand(command => command.setName('remove')
            .setDescription('Removes warnings')
            .addUserOption(option => option.setName('user').setDescription('User whose warning is removed.').setRequired(true))
            .addStringOption(option => option.setName('reason').setDescription('Reason for removing the warning.').setRequired(true)))
        .addSubcommand(command => command.setName('view')
            .setDescription('View a user’s warnings')
            .addUserOption(option => option.setName('user').setDescription('User to check.').setRequired(true))),

    helpSection: "moderation",
    helpSubCommands: "add/remove/view",
    helpDescription: "Warn the naughty kids.\n🔒 **Moderator Role Only For Add/Remove**",

    execute: async (interaction) => {
        const { options, guild } = interaction;

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const sub = options.getSubcommand();
        const modPermsData = await permissions.findOne({ Guild: interaction.guild.id });
        const warnData = await warns.findOne({ Guild: interaction.guild.id });

        if (!warnData) {
            return await interaction.editReply({
                content: "❌ Warns haven't been set up for this server. Use `/logs-setup` first.",
                flags: MessageFlags.Ephemeral
            });
        }

        const target = options.getUser('user');
        let userProfile = warnData.UsersArray.find(user => user.userId === target.id);

        switch (sub) {
            case "add":
                const hasPerms = await checkPerms(interaction, modPermsData);
                if (!hasPerms) {
                    return await interaction.editReply({
                        content: "❌ You do not have permission to use this command.",
                        flags: MessageFlags.Ephemeral
                    });
                }

                const reason = options.getString('reason');
                const evidence = options.getString('evidence') || "No evidence provided.";

                if (!userProfile) {
                    userProfile = {
                        userId: target.id,
                        warnAmount: 0,
                        warnArray: []
                    };
                    warnData.UsersArray.push(userProfile);
                }

                const warnEntry = {
                    warnReason: reason,
                    warnEvidence: evidence,
                    warnIssuer: interaction.user.id,
                    warnDate: Date.now(),
                };

                userProfile.warnAmount += 1;
                userProfile.warnArray.push(warnEntry);

                // Update the user in UsersArray instead of adding duplicate
                warnData.UsersArray = warnData.UsersArray.map(user =>
                    user.userId === target.id ? userProfile : user
                );

                await warns.updateOne(
                    { Guild: interaction.guild.id, 'UsersArray.userId': target.id },
                    {
                        $inc: { 'UsersArray.$.warnAmount': 1 },
                        $push: { 'UsersArray.$.warnArray': warnEntry }
                    }
                );

                const log = new EmbedBuilder()
                    .setTitle('Warning Added')
                    .setFields(
                        { name: "User:", value: `<@${target.id}>` },
                        { name: "Reason:", value: reason },
                        { name: "Evidence:", value: evidence },
                        { name: "Issued By:", value: `<@${interaction.user.id}>` }
                    )
                    .setFooter({ text: "Axol System Product" })
                    .setColor('Red');

                const logsChannelID = warnData.LogChannelID;
                const channel = guild.channels.cache.get(logsChannelID);

                if (channel && channel.permissionsFor(guild.members.me).has(PermissionsBitField.Flags.ViewChannel)) {
                    await channel.send({ embeds: [log] });
                }

                await interaction.editReply({
                    content: `✅ User warned. They now have **${userProfile.warnAmount}** warning(s).`,
                    flags: MessageFlags.Ephemeral
                });
                break;

            case "remove":
                if (!userProfile || userProfile.warnAmount === 0) {
                    return await interaction.editReply({
                        content: `❌ <@${target.id}> has no warnings to remove.`,
                        flags: MessageFlags.Ephemeral
                    });
                }

                await warns.updateOne(
                    { Guild: interaction.guild.id, "UsersArray.userId": target.id },
                    {
                        $pull: { "UsersArray.$.warnArray": userProfile.warnArray[userProfile.warnArray.length - 1] },
                        $inc: { "UsersArray.$.warnAmount": -1 }
                    }
                );

                await interaction.editReply({
                    content: `✅ Removed one warning from ${target}. They now have **${userProfile.warnAmount - 1}** warning(s).`,
                    flags: MessageFlags.Ephemeral
                });

                await target.send({
                    content: `⚠️ A warning has been removed in **${guild.name}**. You now have **${userProfile.warnAmount - 1}** warning(s).`
                }).catch(() => {});

                break;

            case "view":
                if (!userProfile || userProfile.warnAmount === 0) {
                    return await interaction.editReply({
                        content: `✅ ${target} has no warnings!`,
                        flags: MessageFlags.Ephemeral
                    });
                }

                const warningsEmbed = new EmbedBuilder()
                    .setTitle(`${target.username}'s Warnings`)
                    .setColor('Red')
                    .setFooter({ text: "Axol System Product" });

                for (let i = 0; i < userProfile.warnAmount; i++) {
                    const warning = userProfile.warnArray[i];

                    warningsEmbed.addFields({
                        name: `Warning ${i + 1}`,
                        value: `**Reason:** ${warning.warnReason}\n**Evidence:** ${warning.warnEvidence}\n**Issuer:** <@${warning.warnIssuer}>\n**Date:** <t:${Math.floor(warning.warnDate / 1000)}:F>`,
                    });
                }


                await interaction.editReply({ embeds: [warningsEmbed], flags: MessageFlags.Ephemeral });
                break;
        }
    },
    init: async (client) => {

    }
};
