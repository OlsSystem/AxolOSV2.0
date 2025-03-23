const readline = require('readline');
const chalk = require('chalk');
const axios = require('axios');
const {skipCommand} = require("../lib/globalVariables");
let listenChannelList = []
let listenUserList = []

function loadCore(client) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    console.log(chalk.gray(` ${String(new Date).split(" ", 5).join(" ")} `) + chalk.white('[') + chalk.green('INFO') + chalk.white('] ') + chalk.green('ASCORE') + chalk.white(' Loaded!'))


    // Set up an event listener for the 'line' event
    rl.on('line', async (input) => {

        const cmd = input.split(" ")
        const cmdList = ['stats', 'speak', 'help', 'listen', 'stalk', 'reload', 'adddata', 'kickme']

        let cmdInArray = false;

        for (let i = 0; i < cmdList.length; i++) {
            if (cmd[0] === cmdList[i]) {
                cmdInArray = true;
                break; // Exit the loop early if a match is found
            }
        }

        if (cmdInArray === false) {
            console.log(`[ASCORE] ${cmd[0]} is not a registered command. Use help to list all useable commands.`)
        } else {
            if (cmd[0] === 'stats') {
                const response = await axios.get('https://api.olssystem.repl.co/totalstats')
                const stats = response.data;
                let days = Math.floor(client.uptime / 86400000)
                let hours = Math.floor(client.uptime / 3600000) % 24
                let minutes = Math.floor(client.uptime / 60000) % 60
                let seconds = Math.floor(client.uptime / 1000) % 60
                let str = `MemberCount: ${stats.kadenMemberCount}\nServerCount: ${stats.kadenServerCount}\nUptime: ${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds.`
                console.log(`[ASCORE] AxolOS Stats:`)
                import('boxen').then(b => {
                    console.log(b.default(str, { padding: 1 }))
                })
            }

            if (cmd[0] === 'help') {
                let strkaden = 'to be made'
                let strcore = 'speak <staff/main/ops/train/pr> <channel:name> <message:content>\nlisten <guild:guildID> <channel:channelName>\nstalk <guild:guildID> <user:userName>'
                import('boxen').then(b => {
                    console.log('[ASCORE] AxolSystem:AxolOS Commands')
                    console.log(b.default(strkaden, { padding: 1 }))
                    console.log('[ASCORE] AxolSystem:Core Commands')
                    console.log(b.default(strcore, { padding: 1 }))
                })
            }

            if (cmd[0] === 'speak') {
                const guild = cmd[1] || null
                const channel = cmd[2] || null
                const args = cmd.slice(3) || ['[ASCORE] Speak Command was used without a message input']; // Assuming cmd is an array of strings
                const msgString = args.join(' ');

                if (!guild) {
                    console.log('[ASCORE] Missing GuildID. speak <guild:guildID> <channel:channelName> <message:content>')
                }
                if (guild) {
                    if (!channel) {
                        console.log('[ASCORE] Missing ChannelName. speak <guild:guildID> <channel:channelName> <message:content>')
                    }
                    if (channel) {
                        const getGuild = await client.guilds.cache.get(guild)
                        const getChannel = await getGuild.channels.cache.find(ch => ch.name === channel);
                        if (!getChannel) return console.log(`[ASCORE] ${channel} isn\'t accessable or is not real. Try again.`)
                        getChannel.send(msgString)
                        console.log(`[ASCORE] ${msgString} was sent in ${getGuild.name} in the channel ${getChannel.name}`)
                    }
                }
            }

            if (cmd[0] === 'listen') {
                const guild = cmd[1] || null
                const channel = cmd[2] || null

                if (!guild) {
                    if (listenChannelList.length > 0) {
                        listenChannelList = []
                        console.log('[DEBUG]' + listenChannelList)
                        return console.log('[ASCORE] Listen List has been cleared.')
                    }
                    console.log('[ASCORE] Missing GuildID. speak <guild:guildID> <channel:channelName> <message:content>')
                }
                if (guild) {
                    if (!channel) {
                        console.log('[ASCORE] Missing ChannelName. speak <guild:guildID> <channel:channelName> <message:content>')
                    }
                    if (channel) {
                        const getGuild = await client.guilds.cache.get(guild)
                        const getChannel = await getGuild.channels.cache.find(ch => ch.name === channel);
                        if (!getChannel) return console.log(`[ASCORE] ${channel} isn\'t accessable or is not real. Try again.`)
                        listenChannelList.push(getChannel.id)
                        console.log(`[ASCORE] ${getChannel.name} has been whitelisted. New List: ${listenChannelList}`)

                    }
                }
            }

            if (cmd[0] === 'reload') {
                const commandsToRemove = Array.from(client.commands.keys());

                for (const commandName of commandsToRemove) {
                    delete require.cache[require.resolve(`../commands/${commandName}.js`)];
                    client.commands.delete(commandName);

                    try {
                        const newCommand = require(`../commands/${commandName}.js`);
                        if (skipCommand.includes(newCommand.data.name)) {
                            console.log(chalk.gray(` ${String(new Date).split(" ", 5).join(" ")} `) + chalk.white('[') + chalk.red('INFO') + chalk.white('] ') + chalk.green('COMMAND: ') + chalk.white(command.data.name) + chalk.white(' SKIPPED!'));
                        } else {
                            client.commands.set(newCommand.data.name, newCommand);
                            console.log(chalk.gray(` ${String(new Date).split(" ", 5).join(" ")} `) + chalk.white('[') + chalk.green('INFO') + chalk.white('] ') + chalk.green('COMMAND: ') + chalk.white(commandName) + chalk.white(' Loaded!'))
                        }
                    } catch (error) {
                        console.log(chalk.gray(` ${String(new Date).split(" ", 5).join(" ")} `) + chalk.white('[') + chalk.red('INFO') + chalk.white('] ') + chalk.red('COMMAND: ') + chalk.white(commandName) + chalk.white(' Unable to load!'));
                        console.log(error)
                        return;
                    }
                }

                console.log('Reload Successful')
            }

            if (cmd[0] === 'adddata') {
                const fileName = cmd[1] || null
                const jsonData = JSON.stringify(cmd.slice(2).join(' '));

                const schema = require(`../Schemas/${fileName}`);

                if (!schema) {
                    return console.log(`No schema found called ${fileName}`)
                } else {
                    try {
                        console.log(jsonData)

                        const parsedData = await JSON.parse(jsonData);
                        const doubleParsed = await JSON.parse(parsedData);

                        console.log(doubleParsed);

                        if (doubleParsed.RoleName) {
                            const guildID = doubleParsed.GuildID
                            const roleID = doubleParsed.RoleID

                            console.log(guildID, roleID)

                            const guild = await client.guilds.fetch(guildID)

                            if (!guild) {
                                return console.log(`[ASCORE] The Guild - ${doubleParsed.GuildID} was not found!`)
                            }

                            const role = await guild.roles.fetch(roleID)

                            if (!role) {
                                return console.log(`[ASCORE] The role was not found!`)
                            }

                            doubleParsed.RoleName = role.name;

                            console.log(`[ASCORE] Role Name updated to ${doubleParsed.RoleName}`)
                        }

                        console.log(doubleParsed);
                        console.log(typeof doubleParsed);
                        const newEntry = await schema.create(doubleParsed);
                        await newEntry.save();
                        console.log('New data added:', newEntry);

                    } catch (error) {
                        console.error('Error parsing JSON data:', error.message);
                    }
                }
            }

            if (cmd[0] === "kickme") {
                const guildId = cmd[1] || null;
                const reason = cmd.slice(2).join(' ') || "No reason specified.";

                if (!guildId) {
                    return console.log(`[ASCORE] The guildId not entered.`)
                }

                const getGuild = await client.guilds.cache.get(guildId)

                if (!getGuild) {
                    return console.log(`[ASCORE] Guild specified not found.`)
                }

                const owner = await getGuild.fetchOwner()
                await owner.send(reason);
                await getGuild.leave();

                console.log(`[ASCORE] Left Guild ${getGuild.name}.`)


            }

            if (cmd[0] === 'stalk') {
                const guild = cmd[1] || null
                const target = cmd[2] || null

                if (!guild) {
                    if (listenUserList.length > 0) {
                        listenUserList = []
                        console.log('[DEBUG]' + listenUserList)
                        return console.log('[ASCORE] Stalk List has been cleared.')
                    }
                    console.log('[ASCORE] Missing GuildID. stalk <guild:guildID> <user:userName>')
                }
                if (guild) {
                    if (!target) {
                        console.log('[ASCORE] Missing UserName. stalk <guild:guildID> <user:userName>')
                    }
                    if (target) {
                        const getGuild = await client.guilds.cache.get(guild)
                        const getTarget = getGuild.members.cache.find(member => member.user.username === target);
                        if (!getTarget) return console.log(`[ASCORE] ${target} isn\'t real. Try again.`)
                        listenUserList.push(getTarget.id)
                        console.log(`[ASCORE] ${getTarget} has been whitelisted. New List: ${listenUserList}`)

                    }
                }
            }

        }



        rl.prompt();
    });

    // Set up an event listener for the 'close' event
    rl.on('close', () => {
        console.log('Goodbye!');
        process.exit()
    });

    // Start by prompting for input
    rl.setPrompt('');
    rl.prompt();

    client.on('messageCreate', message => {
        if (listenChannelList.includes(message.channel.id)) {
            const targetUser = message.guild.members.cache.get(message.author.id);
            console.log(`[ASCORE | LISTENING TO ${message.channel.name.toLocaleUpperCase()}] ${targetUser.nickname || message.author.username}: ${message.content}`);
        }
        if (listenUserList.includes(message.author.id)) {
            const targetUser = message.guild.members.cache.get(message.author.id);
            console.log(`[ASCORE | STALKING ${message.author.username.toLocaleUpperCase()}] ${targetUser.nickname || message.author.username}: ${message.content}`);
        }
    });

}





module.exports = { loadCore, listenChannelList }