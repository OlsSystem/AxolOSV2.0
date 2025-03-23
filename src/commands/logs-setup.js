const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionsBitField, MessageFlags } = require('discord.js')
const warnSchema = require('../schemas/warnSchema')
const logsSchema = require('../schemas/auditSchema')
const xpmsgschema = require('../schemas/xpmsgschema')


module.exports = {
    data: new SlashCommandBuilder()
        .setName('logs-setup')
        .setDescription('set up logs for some cool features')
        .addStringOption(option => option.setName('logtype').setDescription('type of log you want to make').addChoices(
            { name: "Warn Logging", value: "warn"},
            { name: "Audit Logging", value: "audit" },
            { name: "XP Logging", value: "level"}
        ).setRequired(true))
        .addChannelOption(option => option.setName('channel').setDescription('channel for the logging type you have selected').setRequired(true)),
    helpSection: "setup",
    helpDescription: "for all logging needs setup your server.",
    rolePermissions: [PermissionsBitField.Flags.Administrator],
    execute: async (interaction) => {

        const { options, guild } = interaction;
        const logType = options.getString('logtype');
        const warnData = await warnSchema.findOne({ Guild: guild.id });
        const logData = await logsSchema.findOne({ Guild: guild.id });
        const channel = options.getChannel('channel')

        switch (logType) {
            case 'warn':
                if (!warnData) {
                    const newWarnData = await warnSchema.create({
                        Guild: guild.id,
                        LogChannelID: channel.id,
                        UsersArray: [],
                    })

                    await newWarnData.save();

                    return await interaction.reply({ content: `Warn logging has been setup for the channel ${channel}!`, flags: MessageFlags.Ephemeral })
                } else {
                    let oldChannel = warnData.LogChannelID;
                    warnData.LogChannelID = channel.id;
                    await warnData.save();
                    await interaction.reply({ content: `Warn logging channel has been changed from <#${oldChannel}> to ${channel}.`})
                }

                break;


            case 'level':
                const data = await xpmsgschema.findOne({ GuildID: interaction.guild.id})
                const filter = { GuildID: interaction.guild.id }
                if (data) {
                    await xpmsgschema.findOneAndUpdate(filter, { Using: true, ChannelID: channel.id})
                }

                if (!data) {
                    await xpmsgschema.create({
                        GuildID: interaction.guild.id,
                        Using: true,
                        ChannelID: channel.id,
                    })
                }

                await interaction.reply({ content: `Set level up message to the channel ${channel}.`, flags: MessageFlags.Ephemeral })
                break;

            case 'audit':
                if (!logData) {
                    const newAuditData = await logsSchema.create({
                        Guild: guild.id,
                        ChannelID: channel.id,
                        Settings: {
                            "channelCreate": true,
                            "channelDelete": true,
                            "channelPinsUpdate": true,
                            "channelUpdate": true,
                            "emojiCreate": true,
                            "emojiDelete": true,
                            "emojiUpdate": true,
                            "guildBanAdd": true,
                            "guildBanRemove": true,
                            "guildIntegrationsUpdate": true,
                            "guildMemberAdd": true,
                            "guildMemberRemove": true,
                            "guildMemberUpdate": true,
                            "guildScheduledEventCreate": true,
                            "guildScheduledEventDelete": true,
                            "guildScheduledEventUpdate": true,
                            "guildScheduledEventUserAdd": true,
                            "guildScheduledEventUserRemove": true,
                            "guildUpdate": true,
                            "inviteCreate": true,
                            "inviteDelete": true,
                            "messageDelete": true,
                            "messageDeleteBulk": true,
                            "messageUpdate": true,
                            "roleCreate": true,
                            "roleDelete": true,
                            "roleUpdate": true,
                            "stickerCreate": true,
                            "stickerDelete": true,
                            "stickerUpdate": true,
                            "threadCreate": true,
                            "threadDelete": true,
                            "threadUpdate": true,
                            "voiceStateUpdate": true,
                        },
                    })

                    await newAuditData.save();

                    return await interaction.reply({ content: `Audit logging has been setup for the channel ${channel}!`, flags: MessageFlags.Ephemeral })
                } else {
                    let oldChannel = logData.ChannelID;
                    logData.ChannelID = channel.id;
                    await logData.save();
                    await interaction.reply({ content: `Audit logging channel has been changed from <#${oldChannel}> to ${channel}.`, flags: MessageFlags.Ephemeral })
                }
                break;
        }
    },
    init: async (client) => {

    }
}