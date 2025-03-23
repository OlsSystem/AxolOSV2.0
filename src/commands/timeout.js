const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('timeout')
        .setDescription("speedy shut up system with discord")
        .addSubcommand(command => command.setName('add').setDescription('speedy shutup.').addUserOption(option => option.setName("user").setDescription("whos being annoying?").setRequired(true)).addStringOption(option => option.setName('duration').setRequired(true).setDescription("how long").addChoices(
            { name: '60 seconds', value: '60' },
            { name: '2 Minutes', value: '120' },
            { name: '5 Minutes', value: '300' },
            { name: '10 Minutes', value: '600' },
            { name: '15 seconds', value: '900' },
            { name: '20 Minutes', value: '1200' },
            { name: '30 Minutes', value: '1800' },
            { name: '45 Minutes', value: '2700' },
            { name: '1 Hour', value: '3600' },
            { name: '2 Hour', value: '7200' },
            { name: '3 Hour', value: '10800' },
            { name: '5 Hour', value: '18000' },
            { name: '10 Hour', value: '36000' },
            { name: '1 Day', value: '86400' },
            { name: '2 Day', value: '127800' },
            { name: '3 Day', value: '259200' },
            { name: '5 Day', value: '432000' },
            { name: '1 Week', value: '604800' },
        )).addStringOption(option => option.setName('reason').setDescription('why what they do?')))
        .addSubcommand(command => command.setName('remove').setDescription('removes speedy shutup').addUserOption(option => option.setName("user").setDescription("whos being a nice person?").setRequired(true)).addStringOption(option => option.setName('reason').setDescription('why what they do to be nice?'))),
    helpSection: "moderation",
    helpDescription: "shuts up that one squeeker",
    helpSubCommands: "add/remove",
    modPermissions: true,
    permissions: [PermissionsBitField.Flags.ModerateMembers, PermissionsBitField.Flags.SendMessages],
    execute: async (interaction) => {

        const timeUser = interaction.options.getUser('user');
        const timeMember = await interaction.guild.members.fetch(timeUser.id);
        const duration = interaction.options.getString("duration");
        const sub = interaction.options.getSubcommand();
        const reason = interaction.options.getString('reason') || "No reason provided.";


    switch (sub) {

        case "add":
            if (!timeMember) return await interaction.reply({
                content: "U can't do them Sorry my bad.",
                flags: MessageFlags.Ephemeral
            });
            if (!timeMember.kickable) return await interaction.reply({
                content: "I can't. Too powerful.",
                flags: MessageFlags.Ephemeral
            });

            if (interaction.member.id === timeMember.id) return await interaction.reply({
                content: "no ur not allowed to time ur self out.",
                flags: MessageFlags.Ephemeral
            });
            if (timeMember.permissions.has(PermissionsBitField.Flags.Administrator)) return await interaction.reply({content: `Bro tried to time an admin out named ${timeUser}. Ye thats right the bot owner is ratting you out!`});


            await timeMember.timeout(duration * 1000, reason);

            const embed = new EmbedBuilder()
                .setColor("Red")
                .setDescription(`:white_check_mark: Nice work! You timed out ${timeUser.tag} for the duration of ${duration / 60} minutes(s) for the reason ${reason}.`)

            const dmEmbed = new EmbedBuilder()
                .setColor("Red")
                .setDescription(`:white_check_mark: Well done. You have been timed out in ${interaction.guild.name} for ${duration / 60} minutes(s) for the reason ${reason}`)

            await timeMember.send({embeds: [dmEmbed]}).catch(err => {
                return;
            })

            await interaction.reply({embeds: [embed]});
            break;

        case "remove":
            if (!timeMember) return await interaction.reply({ content: "U can't do them Sorry my bad.", flags: MessageFlags.Ephemeral });
            if (!timeMember.kickable) return await interaction.reply({ content: "I can't. Too powerful.", flags: MessageFlags.Ephemeral });

            if (interaction.member.id === timeMember.id) return await interaction.reply({ content: "no ur not allowed to time ur self out.", flags: MessageFlags.Ephemeral });
            if (timeMember.permissions.has(PermissionsBitField.Flags.Administrator)) return await interaction.reply({ content: `Bro tried to time an admin out named ${timeUser}. Ye thats right the bot owner is ratting you out!`});


            await timeMember.timeout(null, reason);

            const embedRemove = new EmbedBuilder()
                .setColor("Red")
                .setDescription(`:white_check_mark: Nice work! ${timeUser.tag} is now untimed out for the reason ${reason}.`)

            const dmEmbedRemove = new EmbedBuilder()
                .setColor("Red")
                .setDescription(`:white_check_mark: Well done. You have been untimed out for ${reason} in ${interaction.guild.name}.`)

            await timeMember.send({ embeds: [dmEmbedRemove] }).catch(err => {
                return;
            })

            await interaction.reply({ embeds: [embedRemove] });
            break;
        }
    },
    init: async (client) => {

    }
}