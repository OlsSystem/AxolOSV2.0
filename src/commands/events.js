const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, Client, GatewayIntentBits, PermissionsBitField, ChannelType, MessageFlags} = require('discord.js');
const eventsDb = require('../schemas/events');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("events")
        .setDescription("start hosting events in your server")
        .addSubcommand(command => command.setName('create').setDescription('create and event in your server').addStringOption(option => option.setName('name').setDescription("whats dis event called?").setRequired(true)))
        .addSubcommand(command => command.setName('info').setDescription('change the info for your event.') .setDescription('creates a custom info embed')
            .addStringOption(option => option.setName("eventname").setDescription('name of the event your editing').setRequired(true))
            .addStringOption(option => option.setName('title').setDescription('the title of the embed').setRequired(true))
            .addStringOption(option => option.setName('description').setDescription('the description of the embed').setRequired(true))
            .addStringOption(option => option.setName('image').setDescription('the image of the embed').setRequired(false))
            .addStringOption(option => option.setName('thumbnail').setDescription('the thumbnail of the embed').setRequired(false))
            .addStringOption(option => option.setName('field-name').setDescription('the field name of the embed').setRequired(false))
            .addStringOption(option => option.setName('field-value').setDescription('the field value of the embed').setRequired(false))
            .addStringOption(option => option.setName('footer').setDescription('the footer of the embed').setRequired(false))),
    modPermissions: true,
    helpSection: "events",
    helpSubCommands: "create/info",
    helpDescription: "ITS EVENT TIME. Sets up and allows you to edit your events.",
    permissions: [PermissionsBitField.Flags.ManageChannels, PermissionsBitField.Flags.ManageRoles],
    execute: async (interaction) => {

        const { options } = interaction;
        await interaction.deferReply({ flags: MessageFlags.Ephemeral })
        const sub = options.getSubcommand();

        switch (sub) {
            case 'create':

                const name = interaction.options.getString('name');

                const eventID = name.toLowerCase();

                const findCurrentEvent = await eventsDb.findOne({ Guild: interaction.guild.id, EventID: eventID });


                if (findCurrentEvent) {
                    return await interaction.editReply({ content: `You already have an event made called ${name}.`})
                }

                const newEventData = {
                    Guild: interaction.guild.id,
                    EventName: name,
                    EventID: eventID,
                    CategoryChannel: "0",
                    AnnouncementsChannel: "0",
                    GeneralChannel: "0",
                    InfoChannel: "0",
                    RoleID: "0",
                }

                const eventrole = await interaction.guild.roles.create({
                    name: `${name} Event`
                });

                newEventData.RoleID = eventrole.id;

                const category = await interaction.guild.channels.create({
                    name: `${name} Event`,
                    type: ChannelType.GuildCategory,
                    permissionOverwrites: [
                        {
                            id: eventrole,
                            allow: [PermissionsBitField.Flags.ViewChannel],
                        },
                        {
                            id: interaction.guild.id,
                            deny: [PermissionsBitField.Flags.ViewChannel],
                        },
                        {
                            id: interaction.guild.members.me.id,
                            allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
                        },
                    ]
                });

                const announce = await interaction.guild.channels.create({
                    name: `${name}-event-annoucements`,
                    type: ChannelType.GuildText,
                    permissionOverwrites: [
                        {
                            id: eventrole,
                            deny: [PermissionsBitField.Flags.SendMessages],
                            allow: [PermissionsBitField.Flags.ViewChannel],
                        },
                        {
                            id: interaction.guild.id,
                            deny: [PermissionsBitField.Flags.ViewChannel],
                        },
                        {
                            id: interaction.guild.members.me.id,
                            allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
                        },
                    ],
                    parent: category
                });

                const information = await interaction.guild.channels.create({
                    name: `${name}-event-information`,
                    type: ChannelType.GuildText,
                    permissionOverwrites: [
                        {
                            id: eventrole,
                            deny: [PermissionsBitField.Flags.SendMessages],
                            allow: [PermissionsBitField.Flags.ViewChannel],
                        },
                        {
                            id: interaction.guild.id,
                            deny: [PermissionsBitField.Flags.ViewChannel],
                        },
                        {
                            id: interaction.guild.members.me.id,
                            allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
                        },
                    ],
                    parent: category
                });

                const general = await interaction.guild.channels.create({
                    name: `${name}-event-general`,
                    type: ChannelType.GuildText,
                    permissionOverwrites: [
                        {
                            id: eventrole,
                            allow: [PermissionsBitField.Flags.ViewChannel],
                        },
                        {
                            id: interaction.guild.id,
                            deny: [PermissionsBitField.Flags.ViewChannel],
                        },
                        {
                            id: interaction.guild.members.me.id,
                            allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
                        },
                    ],
                    parent: category
                });

                newEventData.AnnouncementsChannel = announce.id;
                newEventData.CategoryChannel = category.id;
                newEventData.GeneralChannel = general.id;
                newEventData.InfoChannel = information.id;

                const announceembed = new EmbedBuilder()
                    .setColor("Red")
                    .setTitle(`Welcome to The ${name} Event.`)
                    .setDescription(`Here you are able to chill and join in on the event! \n Check <#${information.id}> for details!`)
                    .setFooter({text: "AxolOS Events System."})

                const dmembed = new EmbedBuilder()
                    .setColor("Red")
                    .setTitle("Events Hub Created!")
                    .setDescription(`Congrats on creating an Event! Give the ${name} Event to anyone whos participating!`)
                    .setFooter({text: "AxolOS Events System."})

                await eventsDb.create(newEventData);

                await announce.send({ embeds: [announceembed] });
                await interaction.member.send({ embeds: [dmembed] })
                await interaction.editReply({ content: `Event now created. Role: ${eventrole} Main Channel: ${general}`, flags: MessageFlags.Ephemeral});
                console.log("[DEBUG] Event has been created.")
                break;

            case "info":
                const eventId = options.getString('eventname').toLowerCase();
                const title = options.getString('title');
                const desc = options.getString('description');
                const image = options.getString('image');
                const thumbnail = options.getString('thumbnail');
                const fieldName = options.getString('field-name') || ' ';
                const fieldValue = options.getString('field-value') || ' ';
                const footer = options.getString('footer') || ' ';

                if (image) {
                    if (!image.startsWith('http')) return await interaction.editReply({ content: "Bro used http for an image. U can't use my g.", flags: MessageFlags.Ephemeral})
                }
                if (thumbnail) {
                    if (!thumbnail.startsWith('http')) return await interaction.editReply({ content: "Bro used http for an image. U can't use my g.", flags: MessageFlags.Ephemeral})
                }

                const embed = new EmbedBuilder()
                    .setTitle(title)
                    .setDescription(desc)
                    .setColor("Red")
                    .setImage(image)
                    .setThumbnail(thumbnail)
                    .setTimestamp()
                    .addFields({ name: `${fieldName}`, value: `${fieldValue}`})
                    .setFooter({ text: `${footer}`, iconURL: interaction.member.displayAvatarURL({ dynamic: true})})

                const guild = interaction.guild;
                console.log(eventId)
                const eventData = await eventsDb.findOne({ Guild: guild.id, EventID: eventId });
                console.log(eventData);
                const channel = guild.channels.cache.get(eventData.InfoChannel);
                if (!channel) {
                    console.log('Error: Channel not found!');
                    await interaction.editReply({ content: "Channel not found.", flags: MessageFlags.Ephemeral})
                } else {
                    channel.send({ embeds: [embed] });
                    await interaction.editReply({ content: "Embed sent", flags: MessageFlags.Ephemeral});
                }

                break;
        }

    },
    init: async (client) => {

    }
}