const axios = require("axios");
const { EmbedBuilder } = require("discord.js");

module.exports = {
    data: {
        name: "refresh-stat-embed",
        cron: "* * * * *",
        skip: true,
    },
    execute: async (client) => {
        try {
            const response = await axios.get('https://project-showtime.vercel.app/api/totalStats')
            const { totalServerCount, totalMemberCount } = response.data.totalData;

            const channel = await client.channels.fetch("1163226970407059608");
            const msg = await channel.messages.fetch("1163234070612938903")


            if (!msg) {
                await channel.bulkDelete(await channel.messages.fetch({ limit: 100 }))
                const embed = new EmbedBuilder()
                    .setTitle('Axol Systems Status')
                    .addFields(
                        { name: "Amount of Users", value: `${client.guilds.cache.map((guild) => guild.memberCount).reduce((p, c) => p + c) + memberCount}` },
                        { name: "Server Count:", value: `${client.guilds.cache.size + serverCount}` },
                        { name: "Having a good time?", value: "YE!" }
                    )
                    .setFooter({ text: "Axol Systems" });

                const msg = channel.send({ embeds: [embed] });

            } else {
                const msg = await channel.messages.fetch("1163234070612938903")
                const now = Date.now();
                const getCDStamp = (timestamp = Date.now()) => `<t:${Math.round(timestamp / 1000)}:R>`;
                const updatedEmbed = new EmbedBuilder()
                    .setTitle('Axol Systems Status')
                    .setColor('Red')
                    .setDescription(`Last updated at ${getCDStamp(now)}`)
                    .addFields(
                        { name: "Amount of Users", value: `${client.guilds.cache.map((guild) => guild.memberCount).reduce((p, c) => p + c) + totalMemberCount}` },
                        { name: "Server Count:", value: `${client.guilds.cache.size + totalServerCount}` },
                        { name: "Online?", value: "I mean idk." },
                        { name: "Having a good time?", value: "YE!!" }
                    )
                    .setFooter({ text: "Axol Systems" });

                msg.edit({ embeds: [updatedEmbed] });
            }


        } catch (error) {
            console.log("Didn't update stats. No response.")
        }
    },
    init: async (client) => {

    }
}