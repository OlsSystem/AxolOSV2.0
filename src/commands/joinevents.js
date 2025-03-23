const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, PermissionsBitField, MessageFlags} = require('discord.js');
const joineventSchema = require('../schemas/joinchannelsSchema');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('joinevents')
        .setDescription("welcome, leave, and everything nice setup")
        .addSubcommand(command => command.setName('update').setDescription('update either the welcome channel or leave channel.').addChannelOption(option => option.setName('welcome-channel').setDescription("where we welcomein in ppl").setRequired(true)).addChannelOption(option => option.setName('leave-channel').setDescription("where we announcing where ppl leave").setRequired(false)))
        .addSubcommand(command => command.setName('view').setDescription('displays what channels you selected'))
        .addSubcommand(command => command.setName('remove').setDescription('removes the function for the welcome / leave channel')),
    permissions: [PermissionsBitField.Flags.SendMessages],
    helpSection: "setup",
    helpSubCommands: "update/remove/view",
    helpDescription: "Welcome all the newbies to your server with this.",
    rolePermissions: [PermissionsBitField.Flags.Administrator],
    modPermissions: true,
    execute: async (interaction) => {

        const { options } = interaction;
        const sub = options.getSubcommand();
        const data = await joineventSchema.findOne({ GuildID: interaction.guild.id });



        switch (sub) {

            case "update":
                await interaction.deferReply({ flags: MessageFlags.Ephemeral })

                if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return await interaction.reply({content: "Buddtha ur not allowed."})

                const welcomeChannel = await interaction.options.getChannel('welcome-channel');
                const leaveChannel = await interaction.options.getChannel('leave-channel') || interaction.options.getChannel('welcome-channel');

                const requiredPermissions = [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages];
                const missingWelcomePerms = welcomeChannel.permissionsFor(interaction.guild.members.me).missing(requiredPermissions);
                const missingLeavePerms = leaveChannel.permissionsFor(interaction.guild.members.me).missing(requiredPermissions);

                const missingInfo = [];

                if (missingWelcomePerms.length > 0) {
                    missingInfo.push(`\`${missingWelcomePerms.join(", ")}\` - ${welcomeChannel}`);
                }

                if (missingLeavePerms.length > 0) {
                    missingInfo.push(`\`${missingLeavePerms.join(", ")}\` - ${leaveChannel}`);
                }

                if (missingInfo.length > 0) {
                    const embed = new EmbedBuilder()
                        .setColor("Red")
                        .setDescription(`❌ The bot is missing the following permissions:\n${missingInfo.join("\n")}`);

                    return await interaction.editReply({ embeds: [embed] });
                }


                if (data) {
                    data.WelcomeChannelID = welcomeChannel.id;
                    data.LeaveChannelID = leaveChannel.id;

                    await data.save();
                } else {
                    await joineventSchema.create({
                        GuildID: interaction.guild.id,
                        WelcomeChannelID: welcomeChannel.id,
                        LeaveChannelID: leaveChannel.id,
                    })
                }

                const embed = new EmbedBuilder()
                    .setColor("Blue")
                    .setDescription(`:white_check_mark: Sire! The welcoming message has been setuth to the channel called ${welcomeChannel} and the leave channel set to ${leaveChannel}.`)

                await interaction.editReply({ embeds: [embed] })
                break;

            case "remove":
                await interaction.deferReply({ flags: MessageFlags.Ephemeral })

                if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return await interaction.reply({content: "Buddtha ur not allowed."})

                if (!data) {
                    await interaction.editReply({ content: "❌ This server doesn\'t have any welcome or leave channel."})
                } else {
                    await joineventSchema.deleteOne({ GuildID: interaction.guild.id });
                    await interaction.editReply({ content: "✅ Welcome channel and leave channel removed."})
                }

                break;


            case "view":

                if (!data) {
                    await interaction.reply({ content: `This server has no welcome / leave channel setup.`, flags: MessageFlags.Ephemeral })
                } else {

                    const welcomeChannel = await interaction.guild.channels.cache.get(data.WelcomeChannelID)
                    const leaveChannel = await interaction.guild.channels.cache.get(data.LeaveChannelID)

                    const embed = new EmbedBuilder()
                        .setTitle('Join Event Channels')
                        .setThumbnail("https://cdn.discordapp.com/attachments/1099810701335334912/1122999511543992330/0a84c22d05ea3f137fe0ca09b9bf9f3a.jpg")
                        .setDescription(`Welcome Channel - ${welcomeChannel}\nLeave Channel - ${leaveChannel}`)
                        .setColor('Red')

                    await interaction.reply({ embeds: [embed] })
                }



                break;
        }
    },
    init: async (client) => {

    }
}
