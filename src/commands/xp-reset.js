const { SlashCommandBuilder } = require('@discordjs/builders');
const { AttachmentBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const levelSchema = require('../schemas/level');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('xp-reset')
        .setDescription('resets xp')
        .addSubcommand(command => command.setName('full').setDescription('wipe entire server xp.'))
        .addSubcommand(command => command.setName('user').setDescription('reset user xp').addUserOption(option => option.setName('user').setDescription('users data your wiping.').setRequired(true))),
    helpSection: "moderation",
    helpSubCommands: "full/user",
    helpDescription: "remove xp like that. not windows xp. chat xp.",
    rolePermissions: [PermissionsBitField.Flags.Administrator],
    async execute (interaction) {

        const sub = await interaction.options.getSubcommand();
        const {guildId} = interaction;


        switch (sub) {

            case 'full':
                await levelSchema.deleteMany({Guild: guildId})

                const embed = new EmbedBuilder()
                    .setColor("Blue")
                    .setDescription(`:white_check_mark: Opps! The entire server now has 0 xp. Not my fault ngl.`)

                await interaction.reply({embeds: [embed]})
                break;

            case 'user':
                const user = await interaction.options.getUser('user');
                await levelSchema.deleteMany({ Guild: guildId, User: user.id})

                const embedUser = new EmbedBuilder()
                    .setColor("Blue")
                    .setDescription(`:white_check_mark: Opps! ${user.tag}'s xp has been reset. Don't tell em I did it. `)

                await interaction.reply({embeds: [embedUser] })
                break;
        }

    }
}