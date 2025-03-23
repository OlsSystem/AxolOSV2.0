const { Events, EmbedBuilder, ChannelType } = require('discord.js');
const logSchema = require("../schemas/auditSchema");

function getChannelType(type) {
    const channelTypes = {
        [ChannelType.GuildText]: "Text Channel",
        [ChannelType.GuildVoice]: "Voice Channel",
        [ChannelType.GuildCategory]: "Category",
        [ChannelType.GuildAnnouncement]: "Announcement Channel",
        [ChannelType.GuildStageVoice]: "Stage Channel",
        [ChannelType.GuildForum]: "Forum Channel",
        [ChannelType.GuildDirectory]: "Directory Channel",
        [ChannelType.GuildMedia]: "Media Channel"
    };
    return channelTypes[type] || "Unknown Type";
}


module.exports = {
    name: "EventLogger",
    once: false,
    async execute(event, ...args) {
        const guild = args[0]?.guild || event.guild;
        if (!guild) return;

        const data = await logSchema.findOne({ Guild: guild.id });
        if (!data) return;

        let logChannelEmbed = new EmbedBuilder();
        let description = "";
        let title = "";
        let user;
        let channelID = data.ChannelID;

        switch (event) {
            case Events.GuildMemberUpdate:
                const [oldMember, newMember] = args;
                user = newMember.user;
                const changes = [];

                if (oldMember.nickname !== newMember.nickname) {
                    changes.push(`**Nickname Changed:** ${oldMember.nickname || 'None'} ➔ ${newMember.nickname || 'None'}`);
                }

                if (oldMember.roles.cache.size !== newMember.roles.cache.size) {
                    const addedRoles = newMember.roles.cache.filter(role => !oldMember.roles.cache.has(role.id));
                    const removedRoles = oldMember.roles.cache.filter(role => !newMember.roles.cache.has(role.id));

                    if (addedRoles.size > 0) changes.push(`**Roles Added:** ${addedRoles.map(r => r.name).join(', ')}`);
                    if (removedRoles.size > 0) changes.push(`**Roles Removed:** ${removedRoles.map(r => r.name).join(', ')}`);
                }

                if (oldMember.communicationDisabledUntilTimestamp !== newMember.communicationDisabledUntilTimestamp) {
                    if (newMember.communicationDisabledUntilTimestamp) {
                        changes.push(`**Timed Out Until:** <t:${Math.floor(newMember.communicationDisabledUntilTimestamp / 1000)}:F>`);
                    } else {
                        changes.push(`**Timeout Removed**`);
                    }
                }

                if (!oldMember.premiumSince && newMember.premiumSince) {
                    changes.push(`**User Started Boosting**`);
                } else if (oldMember.premiumSince && !newMember.premiumSince) {
                    changes.push(`**User Stopped Boosting**`);
                }

                if (oldMember.pending !== newMember.pending) {
                    changes.push(`**Membership Screening:** ${newMember.pending ? "Now Pending" : "Approved"}`);
                }

                if (changes.length === 0) return;

                title = "📝 Member Updated"
                description = `**User:** ${user} (\`${user.id}\`)\n\n${changes.join("\n")}`
                break;

            case Events.GuildUpdate:
                if (!data.Settings[0].guildUpdate) return;
                const [oldGuild, newGuild] = args;
                title = "🔄 Guild Updated";
                description = `**Old Name:** ${oldGuild.name}\n**New Name:** ${newGuild.name}`;
                break;

            case Events.InviteCreate:
                if (!data.Settings[0].inviteCreate) return;
                const invite = args[0];
                title = "🔗 Invite Created";
                description = `**Code:** ${invite.code}\n**Created By:** ${invite.inviter?.tag || "Unknown"}\n**Expires At:** ${invite.expiresAt || "Never"}`;
                break;

            case Events.InviteDelete:
                if (!data.Settings[0].inviteDelete) return;
                const deletedInvite = args[0];
                title = "🚫 Invite Deleted";
                description = `**Code:** ${deletedInvite.code}`;
                break;

            case Events.MessageDelete:
                if (!data.Settings[0].messageDelete) return;
                const deletedMessage = args[0];
                title = "🗑️ Message Deleted";
                description = `**Author:** ${deletedMessage.author?.tag || "Unknown"}\n**Channel:** ${deletedMessage.channel}\n**Content:** ${deletedMessage.content || "Embed/Attachment"}`;
                break;

            case Events.MessageBulkDelete:
                if (!data.Settings[0].messageDeleteBulk) return;
                const deletedMessages = args[0];
                title = "🗑️ Bulk Messages Deleted";
                description = `**Channel:** ${deletedMessages.first().channel}\n**Messages Deleted:** ${deletedMessages.size}`;
                break;

            case Events.MessageUpdate:
                if (!data.Settings[0].messageUpdate) return;
                const [oldMessage, newMessage] = args;
                if (!oldMessage.content || !newMessage.content) return;

                title = "✏️ Message Edited";
                description = `**Author:** ${newMessage.author.tag}\n**Channel:** ${newMessage.channel}\n**Old Message:** ${oldMessage.content}\n**New Message:** ${newMessage.content}`;
                break;

            case Events.GuildRoleCreate:
                if (!data.Settings[0].roleCreate) return;
                const createdRole = args[0];
                title = "🛑 Role Created";
                description = `**Role Name:** ${createdRole.name}\n**ID:** ${createdRole.id}`;
                break;

            case Events.GuildRoleDelete:
                if (!data.Settings[0].roleDelete) return;
                const deletedRole = args[0];
                title = "🚫 Role Deleted";
                description = `**Role Name:** ${deletedRole.name}`;
                break;

            case Events.GuildRoleUpdate:
                if (!data.Settings[0].roleUpdate) return;
                const [oldRole, newRole] = args;
                title = "🔄 Role Updated";
                description = `**Old Name:** ${oldRole.name}\n**New Name:** ${newRole.name}`;
                break;

            case Events.GuildStickerCreate:
                if (!data.Settings[0].stickerCreate) return;
                const createdSticker = args[0];
                title = "🏷️ Sticker Created";
                description = `**Sticker Name:** ${createdSticker.name}\n**Description:** ${createdSticker.description || "No description"}`;
                break;

            case Events.GuildStickerDelete:
                if (!data.Settings[0].stickerDelete) return;
                const deletedSticker = args[0];
                title = "🚫 Sticker Deleted";
                description = `**Sticker Name:** ${deletedSticker.name}`;
                break;

            case Events.GuildStickerUpdate:
                if (!data.Settings[0].stickerUpdate) return;
                const [oldSticker, newSticker] = args;
                title = "🔄 Sticker Updated";
                description = `**Old Name:** ${oldSticker.name}\n**New Name:** ${newSticker.name}`;
                break;

            case Events.ThreadDelete:
                if (!data.Settings[0].threadDelete) return;
                const deletedThread = args[0];
                title = "🧵 Thread Deleted";
                description = `**Thread Name:** ${deletedThread.name}`;
                break;

            case Events.ThreadCreate:
                if (!data.Settings[0].threadCreate) return;
                const createdThread = args[0];
                title = "🧵 Thread Created";
                description = `**Thread Name:** ${createdThread.name}\n**Channel:** ${createdThread.parent}`;
                break;

            case Events.ThreadUpdate:
                if (!data.Settings[0].threadUpdate) return;
                const [oldThread, newThread] = args;
                title = "🔄 Thread Updated";
                description = `**Old Name:** ${oldThread.name}\n**New Name:** ${newThread.name}`;
                break;

            case Events.GuildScheduledEventUpdate:
                if (!data.Settings[0].guildScheduledEventUpdate) return;
                const [oldScheduledEvent, newScheduledEvent] = args;
                title = "📅 Scheduled Event Updated";
                description = `**Old Name:** ${oldScheduledEvent.name}\n**New Name:** ${newScheduledEvent.name}\n**Start Time:** ${newScheduledEvent.scheduledStartTime}`;
                break;

            case Events.GuildScheduledEventUserAdd:
                if (!data.Settings[0].guildScheduledEventUserAdd) return;
                const [eventUserAdd, userAdded] = args;
                title = "✅ User Joined Scheduled Event";
                description = `**User:** ${userAdded.tag} (\`${userAdded.id}\`)\n**Event:** ${eventUserAdd.name}`;
                break;

            case Events.GuildScheduledEventUserRemove:
                if (!data.Settings[0].guildScheduledEventUserRemove) return;
                const [eventUserRemove, userRemoved] = args;
                title = "❌ User Left Scheduled Event";
                description = `**User:** ${userRemoved.tag} (\`${userRemoved.id}\`)\n**Event:** ${eventUserRemove.name}`;
                break;

            case Events.GuildIntegrationsUpdate:
                if (!data.Settings[0].guildIntegrationsUpdate) return;
                title = "🔄 Guild Integrations Updated";
                description = "Guild integrations have been updated.";
                break;

            case Events.GuildScheduledEventCreate:
                if (!data.Settings[0].guildScheduledEventCreate) return;
                const createdEvent = args[0];
                title = "📅 New Scheduled Event Created";
                description = `**Event Name:** ${createdEvent.name}\n**Start Time:** ${createdEvent.scheduledStartTime}\n**Description:** ${createdEvent.description || "No description available."}`;
                break;

            case Events.GuildScheduledEventDelete:
                if (!data.Settings[0].guildScheduledEventDelete) return;
                const deletedEvent = args[0];
                title = "❌ Scheduled Event Deleted";
                description = `**Event Name:** ${deletedEvent.name}\n**Start Time:** ${deletedEvent.scheduledStartTime}\n**Description:** ${deletedEvent.description || "No description available."}`;
                break;

            case Events.ChannelCreate:
                if (!data.Settings[0].channelCreate) return;
                const createdChannel = args[0];
                title = "📢 Channel Created";
                description = `**Channel:** ${createdChannel}\n**Type:** ${getChannelType(createdChannel.type)}`;
                break;

            case Events.ChannelDelete:
                if (!data.Settings[0].channelDelete) return;
                const deletedChannel = args[0];
                title = "❌ Channel Deleted";
                description = `**Channel:** **#${deletedChannel.name}**\n**Type:** ${getChannelType(deletedChannel.type)}`;
                break;

            case Events.ChannelUpdate:
                if (!data.Settings[0].channelUpdate) return;
                const [oldChannel, newChannel] = args;

                if (oldChannel.name !== newChannel.name) {
                    logChannelEmbed.addFields(
                        { name: "Old Name", value: oldChannel.name, inline: true },
                        { name: "New Name", value: newChannel.name, inline: true }
                    );
                }

                if (oldChannel.topic !== newChannel.topic) {
                    logChannelEmbed.addFields(
                        { name: "Old Topic", value: oldChannel.topic || "None", inline: false },
                        { name: "New Topic", value: newChannel.topic || "None", inline: false }
                    );
                }

                title = "🔄 Channel Updated";
                description = `**Old Name:** ${oldChannel.name}\n**New Name:** ${newChannel.name}`;
                break;

            case Events.ChannelPinsUpdate:
                if (!data.Settings[0].channelPinsUpdate) return;
                const pinnedChannel = args[0];
                title = "📌 Channel Pins Updated";
                description = `**Channel:** ${pinnedChannel.name}`;
                break;

            case Events.GuildEmojiCreate:
                if (!data.Settings[0].emojiCreate) return;
                const createdEmoji = args[0];
                title = "😀 New Emoji Added";
                description = `**Emoji:** ${createdEmoji} (\`${createdEmoji.name}\`)`;
                break;

            case Events.GuildEmojiDelete:
                if (!data.Settings[0].emojiDelete) return;
                const deletedEmoji = args[0];
                title = "❌ Emoji Removed";
                description = `**Emoji Name:** \`${deletedEmoji.name}\``;
                break;

            case Events.GuildEmojiUpdate:
                if (!data.Settings[0].emojiUpdate) return;
                const [oldEmoji, newEmoji] = args;
                title = "📝 Emoji Updated";
                description = `**Old Name:** \`${oldEmoji.name}\`\n**New Name:** \`${newEmoji.name}\``;
                break;

            case Events.GuildBanAdd:
                if (!data.Settings[0].guildBanAdd) return;
                const bannedUser = args[0].user;
                title = "🔨 Member Banned";
                description = `**User:** ${bannedUser.tag} (\`${bannedUser.id}\`)`;
                break;

            case Events.GuildBanRemove:
                if (!data.Settings[0].guildBanRemove) return;
                const unbannedUser = args[0].user;
                title = "🔓 Member Unbanned";
                description = `**User:** ${unbannedUser.tag} (\`${unbannedUser.id}\`)`;
                break;


            default:
                return;
        }

        logChannelEmbed
            .setAuthor({
                name: guild.name,
                iconURL: guild.iconURL({ size: 4096, dynamic: true }) || "https://cdn.discordapp.com/attachments/1097171486852255785/1097634246593609868/0a84c22d05ea3f137fe0ca09b9bf9f3a.jpg"
            })
            .setTitle(title)
            .setDescription(description)
            .setThumbnail(user?.displayAvatarURL({ dynamic: true, size: 4096 }) || guild.iconURL({ dynamic: true, size: 4096 }))
            .setTimestamp()
            .setFooter({ text: `User ID: ${user?.id || guild.id}` });

        const channelLogs = await guild.client.channels.cache.get(channelID);
        if (channelLogs) {
            await channelLogs.send({ embeds: [logChannelEmbed] });
        }
    }
};
