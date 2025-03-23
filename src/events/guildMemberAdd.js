const { Events, EmbedBuilder} = require('discord.js');
const joineventSchema = require('../schemas/joinchannelsSchema')
const autoroleSchema = require('../schemas/autorole')
const logSchema = require("../schemas/auditSchema");

module.exports = {
    name: Events.GuildMemberAdd,
    once: false,
    async execute(member) {

        const channelData = await joineventSchema.findOne({ GuildID: member.guild.id });
        const roleData = await autoroleSchema.findOne({ GuildID: member.guild.id });
        const guild = member.guild
        let validRoles = []


        if (channelData) {
            const channel = await member.guild.channels.cache.get(channelData.WelcomeChannelID);
            channel.send(`**Welcome to ${member.guild.name}** <@${member.id}>. We now have ${member.guild.memberCount} members!`)
        }

        if (roleData) {
            const roleDocs = await autoroleSchema.find({ GuildID: member.guild.id });

            if (roleDocs.length > 0) {
                const invalidRoleIds = [];

                for (const doc of roleDocs) {
                    const role = member.guild.roles.cache.get(doc.RoleID);
                    if (role) {
                        validRoles.push(role);
                    } else {
                        invalidRoleIds.push(doc.RoleID);
                    }
                }

                if (invalidRoleIds.length > 0) {
                    await autoroleSchema.deleteMany({ GuildID: member.guild.id, RoleID: { $in: invalidRoleIds } });
                    console.log(`Removed invalid auto roles: ${invalidRoleIds.join(", ")}`);
                }

                if (validRoles.length > 0) {
                    try {
                        await member.roles.add(validRoles);
                    } catch (error) {
                        console.error(`Failed to add roles to ${member.user.tag}:`, error);
                    }
                }
            }
            member.send(`Welcome to our Party at **${member.guild.name}** <@${member.id}>! I have added some fresh roles to your user. Go check them out!`).catch(() => {})
        } else {
            member.send(`Welcome to our Party at **${member.guild.name}** <@${member.id}>!`).catch(() => {})
        }

        const data = await logSchema.findOne({ Guild: member.guild.id });

        const logChannelEmbed = new EmbedBuilder()
            .setAuthor({
                name: guild.name,
                iconURL: guild.iconURL({ size: 4096, dynamic: true }) || "https://cdn.discordapp.com/attachments/1097171486852255785/1097634246593609868/0a84c22d05ea3f137fe0ca09b9bf9f3a.jpg"
            })
            .setTitle("🎉 New Member Joined")
            .setDescription(`**User:** ${member.user.tag} (\`${member.user.id}\`)\n**Joined at:** ${member.joinedAt}\n**Account Created:** ${member.user.createdAt}`)
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 4096 }))
            .setTimestamp()
            .setFooter({ text: `User ID: ${member.user.id}` });

        if (data) {
            if (data.Settings[0].guildMemberAdd === true) {
                const channelID = data.ChannelID;
                const channelLogs = await member.client.channels.cache.get(channelID);

                await channelLogs.send({ embeds: [logChannelEmbed]});
            }
        }
    }
}