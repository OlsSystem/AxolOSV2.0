const axios = require("axios");

module.exports = {
    data: {
        name: "refresh-stats",
        cron: "* * * * *"
    },
    execute: async (client) => {
        const statusData = {
            serverCount: client.guilds.cache.size,
            memberCount: client.guilds.cache.map((guild) => guild.memberCount).reduce((p, c) => p + c),
            botStatus: 'Online'
        }
        try {
            const response = await axios.post('https://project-showtime.vercel.app/api/axolosStats', statusData)
        } catch (error) {
            console.log("Didn't send stats. Response failed.")
        }
    },
    init: async (client) => {

    }
}