const { EmbedBuilder, ActivityType } = require('discord.js');
const chalk = require('chalk');
const http = require('http');

const port = process.env.PORT;

module.exports = {
    name: 'ready',
    once: true,
    async execute(client, message) {

        const logschannelid = "1098355458886090802";
        const logsChannel = await client.channels.cache.get(logschannelid);

        const embed = new EmbedBuilder()
            .setTitle("AxolOS Online")
            .setColor("Green")
            .setDescription(":thumbsup: AxolOS has come online.")
            .setTimestamp();
        logsChannel.send({ embeds: [embed] })

        const activities = [
            'Welcome to The Party',
            'Looking out for Party People',
            'AxolOS: The party has just begun.',
            `Version: ${process.env.VERSION}`,
            'Around the world',
            'microwave do u know what am sayin?',
            'The boys are back in town',
            'Paranoid',
            'Chaise Loungue',
            'ALL THE PEOPLE SO MANY PEOPLE',
            'WHERES THE BEST PLACE TO TAKE A GIRL ON A DATE?',
            'NANDOS!',
            'Take me on a trip I\'d like to go someday',
            'You\'ve arrived at panic Station.',
            `Used by over ${client.guilds.cache.map((guild) => guild.memberCount).reduce((p, c) => p + c)} people.`,
            'bot plays games'
        ];

        setInterval(() => {
            const status = activities[Math.floor(Math.random() * activities.length)]
            client.user.setPresence({ activities: [{ type: ActivityType.Playing, name: `${status}` }] });
        }, 5000);

        const requestHandler = (req, res) => {
            if (req.url === '/health' && req.method === 'GET') {
                if (client.isReady()) {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ status: 'ok', message: 'Service is healthy, bot is online' }));
                } else {
                    res.statusCode = 503;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ status: 'error', message: 'Bot is offline or not logged in' }));
                }
            } else {
                res.statusCode = 404;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ status: 'error', message: 'Not Found' }));
            }
        };

        const server = http.createServer(requestHandler);

        server.listen(port, () => {
            console.log(chalk.gray(` ${String(new Date).split(" ", 5).join(" ")} `) + chalk.white('[') + chalk.green('INFO') + chalk.white('] ') + chalk.green('AXOLOS V') + chalk.green(`${process.env.VERSION}`) + chalk.white(' Loaded!'))
        });

    }
};