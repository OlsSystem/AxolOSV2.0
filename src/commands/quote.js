const { SlashCommandBuilder, messageLink } = require('@discordjs/builders');
const { Client, GatewayIntentBits, PermissionsBitField, Permissions, MessageManager, Embed, Collection, Guild, ChannelType, channels, MessageFlags } = require(`discord.js`);
const { EmbedBuilder } = require('discord.js');
const axios = require('axios');
const permissions = require("../schemas/permissions");
const quotesSchema = require("../schemas/quotes");

async function checkPerms(interaction, modPermsData) {
    const hasAdminPerms = interaction.member.permissions.has(PermissionsBitField.Flags.Administrator);
    if (!hasAdminPerms) {
        if (!modPermsData) {
            if (!hasAdminPerms) {
                return await interaction.reply({
                    content: "❌ You do not have the required moderator role or administrator permissions to execute this command.",
                    flags: MessageFlags.Ephemeral
                });
            }
        } else {

            const modPermsList = modPermsData.Roles;


            const userRoles = interaction.member.roles.cache.map(role => role.id);
            const requiredRoleIds = modPermsList.map(role => role.roleId);
            const hasModPermission = requiredRoleIds.some(roleId => userRoles.includes(roleId));


            if (!hasModPermission) {
                return await interaction.reply({
                    content: "❌ You do not have the required moderator role to execute this command.",
                    flags: MessageFlags.Ephemeral
                });
            }
        }
    }
}



module.exports = {
    data: new SlashCommandBuilder()
        .setName('quote')
        .setDescription('capture peoples interesting comments for the world to see.')
        .addSubcommand(command => command.setName('send').setDescription('adds a quote to the bank').addStringOption(option => option.setName('target').setDescription('the person that you want to quote').setRequired(true)).addStringOption(option => option.setName('quote').setDescription('what did they say?').setRequired(true)))
        .addSubcommand(command => command.setName('remove').setDescription('removes the most recent quote from the bank.').addStringOption(option => option.setName('user').setDescription('user of the quote your removing')))
        .addSubcommand(command => command.setName('book').setDescription('gives your the quote book link.'))
        .addSubcommand(command => command.setName('channel-set').setDescription('sets the channel for where all the quotes are sent.').addChannelOption(option => option.setName('channel').setDescription('channel your sending quotes to.').setRequired(true)))
        .addSubcommand(command => command.setName('channel-remove').setDescription('removes the quotes chanel and disables module.')),
    permissions: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
    helpSection: "fun",
    helpSubCommands: "send/remove/book/channel-set/channel-remove",
    helpDescription: "Quote everyones interesting comments for the world to see.\n🔒 **Moderator Role Only For Channel-Set/Channel-Remove**",
    execute: async (interaction) => {
        const { options } = interaction;

        const sub = options.getSubcommand();
        const modPermsData = await permissions.findOne({ Guild: interaction.guild.id });
        const quotesData = await quotesSchema.findOne({ GuildID: interaction.guild.id });
        let hasPerms;

        switch (sub) {

            case "send":
                const input = interaction.options.getString('target');
                const user = interaction.options.getUser('user');
                let reason = interaction.options.getString('quote');

                if (!input && !user) return await interaction.reply({ content: "A Person to quote is required.", flags: MessageFlags.Ephemeral });
                if (!reason) return await interaction.reply({ content: "A quote is needed u nerd :nerd:", flags: MessageFlags.Ephemeral });

                let targetName = input;
                if (!input) targetName = user.username;

                const responesEmbed = new EmbedBuilder()
                    .setColor("Blue")
                    .setDescription(`:white_check_mark: You have quoted something! This has been Logged on the Quote Book.`)

                const embedc = new EmbedBuilder()
                    .setColor("Blue")
                    .setTitle(`${targetName} has been quoted!`)
                    .setDescription(`**You have been quoted since you said:** ${reason}`)

                const guild = interaction.guild;

                if (quotesData) {

                    const channelID = quotesData.ChannelID

                    const channel = guild.channels.cache.get(channelID);
                    if (!channel) {
                        console.log('Error: Channel not found!');
                        await interaction.reply({content: "channel not found."})
                    } else {
                        channel.send(`${targetName} was quoted!!!!`);
                        channel.send({embeds: [embedc]});
                    }
                    await interaction.reply({embeds: [responesEmbed], flags: MessageFlags.Ephemeral});
                    try {
                        await axios.post('https://sheetdb.io/api/v1/rzy5qnkekxdng', {
                            data: {
                                Guild: `${interaction.guild.name}`,
                                Target: `${targetName}`,
                                Quote: `${reason}`
                            }
                        })
                        console.log("[DEBUG] Quote Sent to Sheet.")
                    } catch (err) {
                        console.log(`An Error has occured. ${err}`)
                    }
                } else {
                    await interaction.reply({ content: "Quotes are not setup for this server.", flags: MessageFlags.Ephemeral });
                }
                break;

            case "remove":
                await interaction.deferReply()
                setTimeout(function (){
                    interaction.followUp({ content: "No. Lol." })
                }, 30000)
                break;

            case "book":
                const embed = new EmbedBuilder()
                    .setColor("Red")
                    .setTitle("The Quote Book.")
                    .setDescription("Enjoy reading the book.")
                    .setFooter({ text: "AxolOS Quote System"})
                    .setTimestamp();

                await interaction.reply({ embeds: [embed], content: "https://tinyurl.com/axolos" });
                break;

            case "channel-set":
                hasPerms = await checkPerms(interaction, modPermsData);
                const channel = await interaction.options.getChannel('channel')

                if (quotesData) {
                    quotesData.ChannelID = channel.id;
                    await quotesData.save();
                } else {
                    await quotesSchema.create({
                        GuildID: interaction.guild.id,
                        ChannelID: channel.id,
                    })
                }

                await interaction.reply({ content: `The brand spanking new quotes channel is here. Quotes are directed to ${channel}`, flags: MessageFlags.Ephemeral })


                break;

            case "channel-remove":
                hasPerms = await checkPerms(interaction, modPermsData);

                if (!quotesData) {
                    await interaction.reply({ content: "There is no record of there being a quotes channel here.", flags: MessageFlags.Ephemeral });
                } else {
                    await quotesSchema.deleteOne({ GuildID: interaction.guild.id });
                    await interaction.reply({ content: "Quotes channel removed. Module was disabled.", flags: MessageFlags.Ephemeral })
                }
                break;
        }

    },
    init: async (client) => {

    }
}
