const { REST } = require("@discordjs/rest");
const { Routes } = require('discord-api-types/v9');
const fs = require('fs');
const chalk = require('chalk');

const clientIdBeta = '1098273501846196244';
const clientId = '1097171781158195272';
const guildId = '1096986814784483410';
const { skipCommand } = require('../lib/globalVariables');

module.exports = (client) => {
    client.handleCommands = async (commandFolders, path) => {
        client.commandArray = [];
        const commandFiles = fs.readdirSync(`${path}`).filter(file => file.endsWith('.js'));
        for (const file of commandFiles) {
            const command = require(`../commands/${file}`);
            let cmdName = command.data.name;
            if (skipCommand.includes(cmdName)) {
                console.log(chalk.gray(` ${String(new Date).split(" ", 5).join(" ")} `) + chalk.white('[') + chalk.red('INFO') + chalk.white('] ') + chalk.green('COMMAND: ') + chalk.white(command.data.name) + chalk.white(' SKIPPED!'));

            } else {
                client.commands.set(command.data.name, command);
                client.commandArray.push(command.data.toJSON());
                console.log(chalk.gray(` ${String(new Date).split(" ", 5).join(" ")} `) + chalk.white('[') + chalk.green('INFO') + chalk.white('] ') + chalk.green('COMMAND: ') + chalk.white(command.data.name) + chalk.white(' Loaded!'))
            }
        }

        const rest = new REST({
            version: '9'
        }).setToken(process.env.TOKEN);

        await (async () => {
            try {

                await rest.put(
                    Routes.applicationCommands(clientId), {
                        body: client.commandArray
                    },
                );

            } catch (error) {
                console.error(error);
            }
        })();
    };
};