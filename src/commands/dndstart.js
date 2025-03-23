const { SlashCommandBuilder } = require('@discordjs/builders');
const { channels, ChannelType } = require('discord.js');
const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dndstart')
        .setDescription('Creates a new dnd campain channel')
        .addStringOption(option => option.setName('name').setDescription('The name of the new channel').setRequired(true))
        .addUserOption(option => option.setName('dungeons-master').setDescription('The dungeon Master').setRequired(true))
        .addRoleOption(option => option.setName("role").setDescription("what role we adding").setRequired(true))
        .addStringOption(option => option.setName('campaign-name').setDescription('The name of the new campaign').setRequired(false)),

    permissions: [PermissionsBitField.Flags.ManageChannels, PermissionsBitField.Flags.SendMessages],
    modPermissions: true,
    helpSection: "dnd",
    helpDescription: "Starts a campaign for adventurers. YAR YAR.",
    execute: async (interaction) => {

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChanels)) return await interaction.reply({ content: "No perms. Ask someone with channel making perms."})
        const name = interaction.options.getString('name');
        const dm = interaction.options.getUser('dungeons-master');
        const role = interaction.options.getRole('role');
        let cn = interaction.options.getString('campaign-name');

        if (!name) {
            // If name option is not provided or has an invalid value, send an error message
            await interaction.reply('Please provide a valid name for the channel');
            return;
        }

        if (!cn) cn = "N/A"

        const guild = interaction.guild;
        const channel = await guild.channels.create({
            name: `${name}`,
            type: ChannelType.GuildText,
            permissionOverwrites: [
                {
                    id: role,
                    allow: [PermissionsBitField.Flags.ViewChannel],
                },
                {
                    id: interaction.guild.id,
                    deny: [PermissionsBitField.Flags.ViewChannel],
                }
            ],
        });

        const embed = new EmbedBuilder()
            .setColor("Red")
            .setTitle('Dungons and Dragons System')
            .setDescription(`Welcome traveler to your new DnD campaign.`)
            .addFields(
                { name: `This DnD campaign is called:`, value: `${cn}`},
                { name: `Your dungeon master is:`, value: `${dm.tag}`}
            )

        await interaction.reply({ content: `Channel created: <#${channel.id}>`, ephemeral: true});
        channel.send({ embeds: [embed] });
    },
    init: async (client) => {

    }
};