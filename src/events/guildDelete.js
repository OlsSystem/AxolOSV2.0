const { Events, EmbedBuilder } = require('discord.js');
const { schemasList } = require('../lib/globalVariables');
const chalk = require("chalk");

module.exports = {
    name: Events.GuildDelete,
    once: false,
    async execute(guild, client) {
        const logChannelID = "1123004926524657767"
        const logsChannel = await client.channels.cache.get(logChannelID);
        const serverCount = client.guilds.cache.size;

        const embed = new EmbedBuilder()
            .setTitle("Lost Server")
            .setColor("Red")
            .setDescription(`${guild.name} has removed AxolOS from their server!`)
            .addFields({ name: "Guilds AxolOS is in:", value: `${serverCount}`})
            .setTimestamp()
            .setFooter({ text: "AxolOS: The Party has just begun."})

        logsChannel.send({ embeds: [embed] });

        try {
            for (const schema of schemasList) {
                const data = require(`../schemas/${schema.name}.js`)
                if (!data) return;

                const criteria = {};
                criteria[schema.field] = guild.id;

                await data.deleteMany(criteria);
            }
            console.warn(chalk.gray(` ${String(new Date).split(" ", 5).join(" ")} `) + chalk.white('[') + chalk.rgb(255, 165, 0)('WARNING') + chalk.white('] ') + chalk.rgb(255, 165, 0)('DATABASE EDITS:') + chalk.rgb(255, 165, 0)(` REMOVED DATA FOR SERVER ${guild.name}`));

        } catch (e) {
            console.log(e)
        }
    }
}