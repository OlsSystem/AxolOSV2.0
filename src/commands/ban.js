const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionsBitField, MessageFlags } = require(`discord.js`);
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ban")
        .setDescription("bans that annoyin kid")
        .addUserOption(option => option.setName('user').setDescription('the member that mus go.').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('tell me what they do?').setRequired(true)),

    permissions: [PermissionsBitField.Flags.BanMembers],
    rolePermissions: [PermissionsBitField.Flags.BanMembers],
    helpSection: "moderation",
    helpDescription: "Someone annoyed you so much you never wanna see em again? Ban em.",
    execute: async (interaction) => {

        await interaction.deferReply({ flags: MessageFlags.Ephemeral })
        const users = interaction.options.getUser('user');
        const client = interaction.client;
        const ID = users.id;
        const banUser = client.users.cache.get(ID)

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) return await interaction.editReply({ content: "Bro thought he could ban people lmao.", flags: MessageFlags.Ephemeral });

        if (!banUser.bannable) {
            return interaction.editReply({
                content: `❌ I cannot ban **${banUser.tag}** because they have a higher or equal role than me.`,
                ephemeral: true
            });
        }

        let reason = interaction.options.getString('reason');
        if (!reason) reason = "Nobody could care to write a reason.";

        const dmEmbed = new EmbedBuilder()
            .setColor("Blue")
            .setDescription(`:white_check_mark: Congrats you got your self banned in **${interaction.guild.name}** | for ${reason}`)

        const embed = new EmbedBuilder()
            .setColor("Blue")
            .setDescription(`:white_check_mark: The bozo named ${banUser.tag} has been smited to death for ${reason}`)

        await banUser.send({ embeds: [dmEmbed] }).catch(err => {
            console.log(`${banUser.tag} has been yeeted out of a server`)
            interaction.editReply({ embeds: [embed] });
            return;
        })

        await interaction.guild.bans.create(banUser.id, {reason}).catch(err => {
            return interaction.editReply({ content: "THEY ARE TOO POWERFULL RUN AWAY!"})
        })

    },
    init: async (client) => {

    }
}