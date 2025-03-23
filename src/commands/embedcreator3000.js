const { SlashCommandBuilder, messageLink } = require('@discordjs/builders');
const { Client, GatewayIntentBits, PermissionsBitField, MessageFlags, Permissions, MessageManager, Embed, Collection, Guild, ChannelType, channels } = require(`discord.js`);
const { User } = require('discord.js');
const { EmbedBuilder } = require('discord.js');


require('dotenv').config();
const client = new Client({ intents: [Object.keys(GatewayIntentBits)] });

module.exports = {
    data: new SlashCommandBuilder()
        .setName('embedcreator3000')
        .setDescription('creates a custom embed for u')
        .addStringOption(option => option.setName('title').setDescription('the title of the embed').setRequired(true))
        .addStringOption(option => option.setName('description').setDescription('the description of the embed').setRequired(true))
        .addStringOption(option => option.setName('image').setDescription('the image of the embed').setRequired(false))
        .addStringOption(option => option.setName('thumbnail').setDescription('the thumbnail of the embed').setRequired(false))
        .addStringOption(option => option.setName('field-name').setDescription('the field name of the embed').setRequired(false))
        .addStringOption(option => option.setName('field-value').setDescription('the field value of the embed').setRequired(false))
        .addStringOption(option => option.setName('footer').setDescription('the footer of the embed').setRequired(false)),
    modPermissions: true,
    helpSection: "fun",
    helpDescription: "Read the command name and think about what it does.",
    permissions: [PermissionsBitField.Flags.SendMessages],
    execute: async (interaction) => {

        const { options } = interaction;
        const title = options.getString('title');
        const desc = options.getString('description');
        const image = options.getString('image');
        const thumbnail = options.getString('thumbnail');
        const fieldName = options.getString('field-name') || ' ';
        const fieldValue = options.getString('field-value') || ' ';
        const footer = options.getString('footer') || ' ';

        if (image) {
            if (!image.startsWith('http')) return await interaction.reply({ content: "Bro used http for an image. U can't use my g."})
        }
        if (thumbnail) {
            if (!thumbnail.startsWith('http')) return await interaction.reply({ content: "Bro used http for an image. U can't use my g."})
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

        await interaction.reply({ content: "Embed sent below", flags: MessageFlags.Ephemeral });
        await interaction.channel.send({ embeds: [embed] });
    },
    init: async (client) => {

    }
}