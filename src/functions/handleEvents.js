const chalk = require("chalk");

module.exports = (client) => {
    client.handleEvents = async (eventFiles, path) => {
        for (const file of eventFiles) {
            const event = require(`../events/${file}`);

            if (event.name === "EventLogger") {
                const eventList = [
                    "guildIntegrationsUpdate",
                    "guildUpdate",
                    "inviteCreate",
                    "inviteDelete",
                    "messageDelete",
                    "messageBulkDelete",
                    "messageUpdate",
                    "roleCreate",
                    "roleDelete",
                    "roleUpdate",
                    "stickerCreate",
                    "stickerDelete",
                    "stickerUpdate",
                    "threadDelete",
                    "threadCreate",
                    "threadUpdate",
                    "guildMemberUpdate",
                    "guildScheduledEventCreate",
                    "guildScheduledEventDelete",
                    "guildScheduledEventUpdate",
                    "guildScheduledEventUserAdd",
                    "guildScheduledEventUserRemove",
                    "channelCreate",
                    "channelDelete",
                    "channelUpdate",
                    "channelPinsUpdate",
                    "emojiCreate",
                    "emojiDelete",
                    "emojiUpdate",
                    "guildBanAdd",
                    "guildBanRemove",
                ];

                eventList.forEach(evt => {
                    try {
                        client.on(evt, (...args) => event.execute(evt, ...args, client));

                        // ✅ Log each loaded event
                        console.log(
                            chalk.gray(` ${String(new Date()).split(" ", 5).join(" ")} `) +
                            chalk.white("[") +
                            chalk.green("INFO") +
                            chalk.white("] ") +
                            chalk.green("EVENT LOGGER: ") +
                            chalk.white(`Loaded event: ${evt}`)
                        );
                    } catch (error) {
                        console.log(
                            chalk.gray(` ${String(new Date()).split(" ", 5).join(" ")} `) +
                            chalk.white("[") +
                            chalk.red("ERROR") +
                            chalk.white("] ") +
                            chalk.red(`Failed to bind event: ${evt} - ${error.message}`)
                        );
                    }
                });

                console.log(
                    chalk.gray(` ${String(new Date()).split(" ", 5).join(" ")} `) +
                    chalk.white("[") +
                    chalk.green("INFO") +
                    chalk.white("] ") +
                    chalk.green("EVENT LOGGER: ") +
                    chalk.white("Multiple Events Loaded!")
                );

            } else {
                if (event.once) {
                    client.once(event.name, (...args) => event.execute(...args, client));
                } else {
                    client.on(event.name, (...args) => event.execute(...args, client));
                }

                console.log(
                    chalk.gray(` ${String(new Date()).split(" ", 5).join(" ")} `) +
                    chalk.white("[") +
                    chalk.green("INFO") +
                    chalk.white("] ") +
                    chalk.green("EVENT: ") +
                    chalk.white(event.name) +
                    chalk.white(" Loaded!")
                );
            }
        }
    };
};
