const { SlashCommandBuilder, messageLink } = require('@discordjs/builders');
const { Client, GatewayIntentBits, PermissionsBitField, Permissions, MessageManager, Embed, Collection, Guild, ChannelType, channels, ButtonStyle, ActionRowBuilder, ButtonBuilder  } = require(`discord.js`);
const { User } = require('discord.js');
const { EmbedBuilder } = require('discord.js');


require('dotenv').config();
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ],
});

module.exports = {
    data: new SlashCommandBuilder()
        .setName("kick")
        .setDescription("kicks that one kid")
        .addUserOption(option => option.setName('user').setDescription('the member that mus go.').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('tell me what they do?').setRequired(true)),
    modPermissions: true,
    helpSection: "moderator",
    helpDescription: "Someone being annoying? Kick them.",
    permissions: [PermissionsBitField.Flags.KickMembers],
    execute: async (interaction) => {


        const user = interaction.options.getUser('user');
        const member = interaction.guild.members.cache.get(user.id);

        if (!member) {
            return await interaction.reply({
                content: 'The specified user is not a member of this server you idiot.',
            });
        }

        if (!member.kickable) {
            return await interaction.reply({
                content: 'I do not have permission to kick this user. RUN!',
            });
        }

        const reason = interaction.options.getString('reason') || 'No reason specified so this person clearly doesn\'t care that you are gone. F.';

        const dmEmbed = new EmbedBuilder()
            .setColor("Blue")
            .setDescription(`:white_check_mark: Congrats you got your self kicked in **${interaction.guild.name}** | for ${reason}`)

        const embed = new EmbedBuilder()
            .setColor("Blue")
            .setDescription(`:white_check_mark: The bozo named ${user.tag} has been smited to death for ${reason}`)


        try {
            await user.send({ embeds: [dmEmbed] }).catch(() => {});

            await member.kick(reason);
            await interaction.reply({embeds: [embed]})
        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: 'An error occurred while trying to kick the user.',
                ephemeral: true,
            });
        }
    },
    init: async (client) => {

    }
};