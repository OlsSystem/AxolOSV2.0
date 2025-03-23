const { SlashCommandBuilder } = require('@discordjs/builders');
const { Client, GatewayIntentBits, PermissionsBitField, EmbedBuilder, Events, ChannelType } = require('discord.js');
const voiceschema = require('../schemas/jointocreate');
const joinchannelschema = require('../schemas/jointocreatechannels');
require('dotenv').config();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('join-to-create-setup')
        .setDescription('Sets up join-to-create system')
        .addSubcommand(command =>
            command.setName('setup')
                .setDescription('Sets up join-to-create')
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription('Voice channel to join')
                        .setRequired(true)
                        .addChannelTypes(ChannelType.GuildVoice))
                .addChannelOption(option =>
                    option.setName('category')
                        .setDescription('Category for created channels')
                        .setRequired(true)
                        .addChannelTypes(ChannelType.GuildCategory))
                .addIntegerOption(option =>
                    option.setName('voice-limit')
                        .setDescription('Max users in created channel (2-99)')
                        .setMinValue(2)
                        .setMaxValue(99)))
        .addSubcommand(command =>
            command.setName('disable')
                .setDescription('Disables join-to-create system')),
    helpSection: "setup",
    helpSubCommands: "setup/disable",
    helpDescription: 'Automatically creates voice channels when users join a designated channel.',
    modPermissions: true,
    permissions: [PermissionsBitField.Flags.ManageChannels, PermissionsBitField.Flags.MoveMembers],

    execute: async (interaction) => {
        if (!interaction.isChatInputCommand()) return;

        const data = await voiceschema.findOne({ Guild: interaction.guild.id });
        const sub = interaction.options.getSubcommand();

        if (sub === 'setup') {
            if (data) return interaction.reply({ content: 'You already have this system set up.', ephemeral: true });

            const channel = interaction.options.getChannel('channel');
            const category = interaction.options.getChannel('category');
            const limit = interaction.options.getInteger('voice-limit') || 3;

            await voiceschema.create({
                Guild: interaction.guild.id,
                Channel: channel.id,
                Category: category.id,
                VoiceLimit: limit
            });

            const embed = new EmbedBuilder()
                .setColor('Blue')
                .setDescription(`Join-to-Create is now enabled! Use ${channel} to create voice rooms.`);

            return interaction.reply({ embeds: [embed] });
        }

        if (sub === 'disable') {
            if (!data) return interaction.reply({ content: 'This system is not enabled on your server.', ephemeral: true });

            await voiceschema.deleteMany({ Guild: interaction.guild.id });

            const embed = new EmbedBuilder()
                .setColor('Blue')
                .setDescription('Join-to-Create has been disabled.');

            return interaction.reply({ embeds: [embed] });
        }
    },

    init: async (client) => {

    }
};
