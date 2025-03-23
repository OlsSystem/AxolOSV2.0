const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bot-info')
        .setDescription('read the name nerd'),
    helpSection: "fun",
    helpDescription: "Gives all the yip yap on the bot.",
    execute: async (interaction) => {

        const { guild, client } = interaction;

        let serverCount = interaction.client.guilds.cache.size;

        let days = Math.floor(client.uptime / 86400000)
        let hours = Math.floor(client.uptime / 3600000) % 24
        let minutes = Math.floor(client.uptime / 60000) % 60
        let seconds = Math.floor(client.uptime / 1000) % 60

        const startTime = Date.now();
        await interaction.deferReply({ withResponse: true });
        const timeDiff = Date.now() - startTime;

        const embed = new EmbedBuilder()
            .setTitle('AxolOS Info')
            .setThumbnail("https://cdn.discordapp.com/attachments/1099810701335334912/1122999511543992330/0a84c22d05ea3f137fe0ca09b9bf9f3a.jpg")
            .setColor('Red')
            .addFields(
                { name: "Version:", value: `${process.env.VERSION}`},
                { name: "Ping:", value: `${timeDiff}ms.`},
                { name: "Uptime:", value: `\`${days}\` days, \`${hours}\` hours, \`${minutes}\` minutes, \`${seconds}\` seconds.`},
                { name: "Server Count:", value: `${serverCount}`},
                { name: "Command Count:", value: "Idk tbf"},
                { name: "Is having a Party?", value: "Yes."},
                { name: "Used by:", value: `${client.guilds.cache.map((guild) => guild.memberCount).reduce((p, c) => p + c)} people.`}
            )
            .setFooter({ text: "AxolOS - The Party has Just Begun."})
            .setTimestamp()

        await interaction.followUp({ embeds: [embed] });
    },
    init: (client) => {

    }
}