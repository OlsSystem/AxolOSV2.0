const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder, PermissionsBitField, ChannelType } = require("discord.js");
const modSchema = require("../schemas/permissions"); // Assuming your schema is named "mod"

module.exports = {
    data: new SlashCommandBuilder()
        .setName("channel-settings")
        .setDescription("Locks or unlocks channels with commands")
        .addSubcommand(command =>
            command.setName('lock')
                .setDescription("Gets people to touch grass")
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription("The channel you're locking")
                        .addChannelTypes(ChannelType.GuildText)
                        .setRequired(true)
                )
        )
        .addSubcommand(command =>
            command.setName('unlock')
                .setDescription("Gets people to become basement dwellers again")
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription("The channel you're unlocking")
                        .addChannelTypes(ChannelType.GuildText)
                        .setRequired(true)
                )
        ),
    helpSection: "moderation",
    permissions: [PermissionsBitField.Flags.ManageChannels],
    modPermissions: true,
    helpSubCommands: "lock/unlock",
    helpDescription: "One person being annoying? Ruin everyone's fun by locking the channel. Or let them have fun by unlocking.",

    execute: async (interaction) => {
        const channel = interaction.options.getChannel('channel');
        const subcommand = interaction.options.getSubcommand();

        const modData = await modSchema.findOne({ Guild: interaction.guild.id });
        const modPermsList = modData.Roles;
        const requiredRoleIds = modPermsList.map(role => role.roleId); // Extract role IDs

        switch (subcommand) {
            case 'lock':
                await channel.permissionOverwrites.create(interaction.guild.id, { SendMessages: false });

                for (const roleId of requiredRoleIds) {
                    await channel.permissionOverwrites.create(roleId, { SendMessages: true });
                }

                const lockEmbed = new EmbedBuilder()
                    .setColor("Red")
                    .setTitle("Channel Locked 🔒")
                    .setDescription(`The channel ${channel} has now been locked. Everyone go touch some grass.`);

                await interaction.reply({ embeds: [lockEmbed] });
                break;

            case 'unlock':
                await channel.permissionOverwrites.create(interaction.guild.id, { SendMessages: true });

                for (const roleId of requiredRoleIds) {
                    await channel.permissionOverwrites.delete(roleId);
                }

                const unlockEmbed = new EmbedBuilder()
                    .setColor("Green")
                    .setTitle("Channel Unlocked 🔓")
                    .setDescription(`The channel ${channel} has now been unlocked. Back to the basement, everyone.`);

                await interaction.reply({ embeds: [unlockEmbed] });
                break;

            default:
                await interaction.reply({ content: "Invalid subcommand.", ephemeral: true });
                break;
        }
    },
    init: async (client) => {

    }
}
