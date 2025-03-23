const { Events, EmbedBuilder } = require('discord.js');


module.exports = {
    name: Events.GuildCreate,
    once: false,
    async execute(guild, client) {
        const logChannelID = "1123004926524657767"
        const logsChannel = await client.channels.cache.get(logChannelID);
        const serverCount = client.guilds.cache.size;

        const embed = new EmbedBuilder()
            .setTitle("New Server")
            .setColor("Green")
            .setDescription(`${guild.name} has added AxolOS to their server!`)
            .addFields({ name: "Guilds AxolOS is in:", value: `${serverCount}`})
            .setTimestamp()
            .setFooter({ text: "AxolOS: The Party has just begun."})

        logsChannel.send({ embeds: [embed] });
    }
}