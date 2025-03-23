const { Client, GatewayIntentBits, Partials, Collection, Events, MessageFlags, PermissionsBitField} = require('discord.js')
const fs = require('fs');
const client = new Client({ intents: [Object.keys(GatewayIntentBits)], partials: [Partials.Message, Partials.Channel, Partials.Reaction], });
const mongoose = require('mongoose');
const process = require('node:process');
const chalk = require("chalk");

const { loadCore } = require("./src/handlers/ascore");
const { loadError } = require('./src/handlers/crashlogs')
const { loadCronJobs } = require("./src/handlers/cronJobs");


const permissions = require("./src/schemas/permissions");


require('dotenv').config();
require('colors');

const functions = fs.readdirSync('./src/functions').filter(file => file.endsWith('.js'));
const eventFiles = fs.readdirSync('./src/events').filter(file => file.endsWith('.js'));
const commandsFolder = fs.readdirSync('./src/commands');

process.on('unhandledRejection', (reason, promise) => {
    console.warn("Unhandled Rejection Error at: ", promise, "For the reason: ", reason);
});

process.on('uncaughtException', (err) => {
    console.warn("Uncaught Exception: ", err);
});

process.on('uncaughtExceptionMonitor', (err, origin) => {
    console.warn("Uncaught Exception: ", err, origin);
});

(async () => {

    mongoose.connect(process.env.MONGODBURL).then(() => console.log(chalk.gray(` ${String(new Date).split(" ", 5).join(" ")} `) + chalk.white('[') + chalk.green('INFO') + chalk.white('] ') + chalk.green('DATABASE: ') + chalk.white('Connected!'))).catch(err => console.log(chalk.gray(` ${String(new Date).split(" ", 5).join(" ")} `) + chalk.white('[') + chalk.red('INFO') + chalk.white('] ') + chalk.red('DATABASE: ') + chalk.white('Unable to connect.')));

    for (file of functions) {
        require(`./src/functions/${file}`)(client);
    }

    client.commands = new Collection();
    client.jobs = new Collection()
    client.handleEvents(eventFiles, './src/events');
    client.handleCommands(commandsFolder, './src/commands');
    client.login(process.env.TOKEN).then(() => {loadError(client)}).catch(err => console.error(err)).then(() => {loadCore(client)}).catch(err => console.log(err)).then(() => {loadCronJobs(client)}).catch(err => console.log(err));
})();

client.on(Events.InteractionCreate, async (interaction) => {
    let commandName;
    if (!interaction.isChatInputCommand()) {
        const aar = interaction.customId.split('-');
        commandName = aar[0];
        if (aar.length > 2) commandName += `-${aar[1]}`;
    } else {
        commandName = interaction.commandName;
    }

    if (commandName.startsWith('guess-the')) {
        commandName = 'guess-the-song';
    }

    if (commandName.startsWith('ball-of')) {
        commandName = 'ball-of-8';
    }
    const command = client.commands.get(commandName);

    if (!command) {
        console.error(`[ASCORE | ERROR] Command ${commandName} not found.`);
        return await interaction.reply({ flags: MessageFlags.Ephemeral, content: `Command ${commandName} not found.` });
    }

    if (interaction.customId && commandName !== "guess-the-song") {
        const originalUserId = interaction.customId.split("_").pop(); // Extract stored user ID

        if (interaction.user.id !== originalUserId) {
            return await interaction.reply({
                content: "❌ Only the original command user can use this button!",
                flags: MessageFlags.Ephemeral,
            });
        }
    }

    const requiredPermissions = command.permissions || [];
    const botMissingPermissions = interaction.guild.members.me.permissions.missing(requiredPermissions);

    if (botMissingPermissions.length > 0) {
        return interaction.reply({
            content: `❌ I am missing the following permissions to run the command **${commandName}**: \${botMissingPermissions.join(', ')}\``,
            flags: MessageFlags.Ephemeral
        });
    }


    const channel = interaction.channel;

    if (!channel.permissionsFor(interaction.guild.members.me).has(PermissionsBitField.Flags.ViewChannel)) {
        return await interaction.reply({
            content: "❌ I don't have permission to view this channel.",
            flags: MessageFlags.Ephemeral
        });
    }

    if (!channel.permissionsFor(interaction.guild.members.me).has(PermissionsBitField.Flags.SendMessages)) {
        return await interaction.reply({
            content: "❌ I don't have permission to send messages in this channel.",
            flags: MessageFlags.Ephemeral
        });
    }


    if (command.rolePermissions) {
        if (!interaction.member.permissions.has(command.rolePermissions)) {
            return interaction.reply({
                content: "❌ You do not have the required permissions to execute this command.",
                flags: MessageFlags.Ephemeral
            });
        }
    }


    if (command.modPermissions === true) {
        const modPermsData = await permissions.findOne({Guild: interaction.guild.id});

        const hasAdminPerms = interaction.member.permissions.has(PermissionsBitField.Flags.Administrator);
        if (!hasAdminPerms) {
            if (!modPermsData) {
                if (!hasAdminPerms) {
                    return await interaction.reply({
                        content: "❌ You do not have the required moderator role or administrator permissions to execute this command.",
                        flags: MessageFlags.Ephemeral
                    });
                }
            } else {

                const modPermsList = modPermsData.Roles;


                const userRoles = interaction.member.roles.cache.map(role => role.id);
                const requiredRoleIds = modPermsList.map(role => role.roleId);
                const hasModPermission = requiredRoleIds.some(roleId => userRoles.includes(roleId));


                if (!hasModPermission) {
                    return await interaction.reply({
                        content: "❌ You do not have the required moderator role to execute this command.",
                        flags: MessageFlags.Ephemeral
                    });
                }
            }
        }
    }

    try {
        await command.init(client);
        await command.execute(interaction);
    } catch (e) {
        console.error(e)
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ flags: MessageFlags.Ephemeral, content: "Error while executing command." });
        } else {
            await interaction.reply({ flags: MessageFlags.Ephemeral, content: "Error while executing command." });
        }
    }
});