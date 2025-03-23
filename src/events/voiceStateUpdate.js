const { Events, ChannelType, EmbedBuilder } = require('discord.js');
const voiceschema = require("../schemas/jointocreate");
const joinchannelschema = require("../schemas/jointocreatechannels");
const logSchema = require("../schemas/auditSchema");


module.exports = {
    name: Events.VoiceStateUpdate,
    once: false,
    async execute(oldState, newState) {
        if (!newState?.member?.guild) return;

        const joindata = await voiceschema.findOne({ Guild: newState.guild.id });
        if (!joindata) return;

        const joinchanneldata = await joinchannelschema.findOne({ Guild: newState.guild.id, User: newState.member.id });
        const voicechannel = newState.channel;

        if (voicechannel?.id === joindata.Channel) {
            if (joinchanneldata) {
                return newState.member.send({ content: 'You already have a voice channel open!' }).catch(() => {});
            }

            try {
                const channel = await newState.guild.channels.create({
                    type: ChannelType.GuildVoice,
                    name: `${newState.member.user.username}-room`,
                    userLimit: joindata.VoiceLimit,
                    parent: joindata.Category
                });

                await joinchannelschema.create({
                    Guild: newState.guild.id,
                    Channel: channel.id,
                    User: newState.member.id
                });

                try {
                    await newState.member.voice.setChannel(channel.id);
                } catch (err) {
                    console.error('Error moving user to channel:', err);
                }

            } catch (err) {
                console.error('Error creating voice channel:', err);
                return newState.member.send({ content: 'Could not create a voice channel. Check bot permissions.' }).catch(() => {});
            }
        }

        if (oldState.channel) {
            const leavechanneldata = await joinchannelschema.findOne({ Guild: oldState.guild.id, User: oldState.member.id });
            if (leavechanneldata && oldState.channel.id === leavechanneldata.Channel) {
                const voicechannel = oldState.guild.channels.cache.get(leavechanneldata.Channel);
                if (voicechannel && voicechannel.members.size === 0) {
                    await voicechannel.delete().catch(() => {});
                    await joinchannelschema.deleteMany({ Guild: oldState.guild.id, User: oldState.member.id });
                }
            }
        }

        const guild = newState.guild;
        const member = newState.member;
        const data = await logSchema.findOne({ Guild: oldIntegration.guild.id });

        const changes = [];

        if (!oldState.channel && newState.channel) {
            changes.push(`**Joined Voice Channel:** ${newState.channel.name}`);
        }

        if (oldState.channel && !newState.channel) {
            changes.push(`**Left Voice Channel:** ${oldState.channel.name}`);
        }

        if (oldState.channel && newState.channel && oldState.channel.id !== newState.channel.id) {
            changes.push(`**Switched Voice Channel:** ${oldState.channel.name} ➔ ${newState.channel.name}`);
        }

        if (changes.length === 0) return;

        const logChannelEmbed = new EmbedBuilder()
            .setAuthor({
                name: guild.name,
                iconURL: guild.iconURL({ size: 4096, dynamic: true }) || "https://cdn.discordapp.com/attachments/1097171486852255785/1097634246593609868/0a84c22d05ea3f137fe0ca09b9bf9f3a.jpg"
            })
            .setTitle("🎙️ Voice State Updated")
            .setDescription(`**User:** ${member.user.tag} (\`${member.user.id}\`)\n\n${changes.join('\n')}`)
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 4096 }))
            .setTimestamp()
            .setFooter({ text: `User ID: ${member.user.id}` });

        if (data) {
            if (data.Settings[0].voiceStateUpdate === true) {
                const channelID = data.ChannelID;
                const channelLogs = await oldState.client.channels.cache.get(channelID);

                await channelLogs.send({ embeds: [logChannelEmbed] });
            }
        }
    }
};
