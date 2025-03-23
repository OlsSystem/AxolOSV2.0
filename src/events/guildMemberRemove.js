const { Events, EmbedBuilder} = require('discord.js');
const joineventSchema = require('../schemas/joinchannelsSchema')
const logSchema = require("../schemas/auditSchema");

module.exports = {
    name: Events.GuildMemberRemove,
    once: false,
    async execute(member) {

        if (member.bot) return;

        const channelData = await joineventSchema.findOne({ GuildID: member.guild.id });
        const guild = member.guild;

        if (channelData) {
            const channel = await member.guild.channels.cache.get(channelData.LeaveChannelID);
            channel.send(`<@${member.id}> Left our guild. What a shame! We now have ${member.guild.memberCount} members!`)
        }

        const data = await logSchema.findOne({ Guild: member.guild.id });

        const logChannelEmbed = new EmbedBuilder()
            .setAuthor({
                name: guild.name,
                iconURL: guild.iconURL({ size: 4096, dynamic: true }) || "https://cdn.discordapp.com/attachments/1097171486852255785/1097634246593609868/0a84c22d05ea3f137fe0ca09b9bf9f3a.jpg"
            })
            .setTitle("👋 Member Left")
            .setDescription(`**User:** ${member.user.tag} (\`${member.user.id}\`)\n**Left at:** ${new Date().toISOString()}\n**Account Created:** ${member.user.createdAt}`)
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 4096 }))
            .setTimestamp()
            .setFooter({ text: `User ID: ${member.user.id}` });

        if (data) {
            if (data.Settings[0].guildMemberRemove === true) {
                const channelID = data.ChannelID;
                const channelLogs = await member.client.channels.cache.get(channelID);

                await channelLogs.send({ embeds: [logChannelEmbed]});
            }
        }
    }
}