const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, MessageFlags, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription('Provides help'),
    helpSection: "fun",
    helpDescription: "The command ur looking at rn lol.",
    execute: async (interaction) => {

        if (interaction.isChatInputCommand()) {

            const MenuEmbed = new EmbedBuilder()
                .setColor("Red")
                .setTitle("Help Command")
                .setDescription("AxolOS is the only bot you need for your server! It's the number one Party bot according to my friends. Now what can it do? Find out below.")
                .addFields(
                    {name: "Page 1:", value: "Moderation Commands."},
                    {name: "Page 2:", value: "Misc Commands."},
                    {name: "Page 3:", value: "Setup Commands."},
                    {name: "Page 4:", value: "Dungeons And Dragons Commands."},
                    {name: "Page 5:", value: "Event Hosting."},
                    {name: "Page 6:", value: "Economy Commands."}
                )
                .setThumbnail("https://cdn.discordapp.com/attachments/1097171486852255785/1097634246593609868/0a84c22d05ea3f137fe0ca09b9bf9f3a.jpg")
                .setFooter({text: "A project by OlsSystem"});

            const menuComponents = new ActionRowBuilder()
                .addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId(`help-button_${interaction.user.id}`)
                        .setMinValues(1)
                        .setMaxValues(1)
                        .addOptions(
                            {
                                label: 'Moderation Commands',
                                description: 'Shows Mod Commands',
                                value: 'moderation',
                            },
                            {
                                label: 'Fun Commands',
                                description: 'Shows Fun Commands',
                                value: 'fun',
                            },
                            {
                                label: 'Set up Commands',
                                description: 'Shows Set up Commands',
                                value: 'setup',
                            },
                            {
                                label: 'DnD Commands',
                                description: 'Shows DnD Commands',
                                value: 'dnd',
                            },
                            {
                                label: 'Events Commands',
                                description: 'Shows Events Commands',
                                value: 'events',
                            },
                            {
                                label: 'Economy Commands',
                                description: 'Shows Economy Commands',
                                value: 'economy',
                            },
                            {
                                label: 'Menu',
                                description: 'Shows The Help Menu',
                                value: 'default',
                            },
                        ),
                );

            await interaction.reply({embeds: [MenuEmbed], components: [menuComponents]});
        }

        if (interaction.customId?.includes('help-button')) {
            const selectedValue = interaction.values[0];
            let CommandsEmbed;

            let fields = [];
            interaction.client.commands.forEach(command => {
                if (command.helpSection === selectedValue) {
                    let commandName;
                    if (command.helpSubCommands) {
                        commandName = `${command.data.name} ${command.helpSubCommands}`;
                    } else {
                        commandName = command.data.name;
                    }

                    let fieldValue = command.helpDescription || 'No description provided.';

                    if (command.modPermissions) {
                        fieldValue += '\n🔒 **Moderator Role Only**';
                    }

                    if (command.rolePermissions && command.rolePermissions.length > 0) {
                        const permissionNames = command.rolePermissions
                            .map(perm => Object.keys(PermissionsBitField.Flags).find(key => PermissionsBitField.Flags[key] === perm))
                            .join(', ');

                        fieldValue += `\n🛡️ **Required Permissions:** ${permissionNames}`;
                    }

                    fields.push({
                        name: `/${commandName}`,
                        value: fieldValue,
                    });
                }
            });



            if (selectedValue === "default") {
                CommandsEmbed = new EmbedBuilder()
                    .setColor("Red")
                    .setTitle("Help Command")
                    .setDescription("AxolOS is the only bot you need for your server! It's the number one Party bot according to my friends. Now what can it do? Find out below.")
                    .addFields(
                        {name: "Page 1:", value: "Moderation Commands."},
                        {name: "Page 2:", value: "Misc Commands."},
                        {name: "Page 3:", value: "Setup Commands."},
                        {name: "Page 4:", value: "Dungeons And Dragons Commands."},
                        {name: "Page 5:", value: "Event Hosting."},
                        {name: "Page 6:", value: "Economy Commands."}
                    )
                    .setThumbnail("https://cdn.discordapp.com/attachments/1097171486852255785/1097634246593609868/0a84c22d05ea3f137fe0ca09b9bf9f3a.jpg")
                    .setFooter({text: "A project by OlsSystem"});
            } else {
                CommandsEmbed = new EmbedBuilder()
                    .setColor("Red")
                    .setThumbnail("https://cdn.discordapp.com/attachments/1097171486852255785/1097634246593609868/0a84c22d05ea3f137fe0ca09b9bf9f3a.jpg")
                    .setTitle(`${selectedValue.charAt(0).toUpperCase() + selectedValue.slice(1)} Commands:`)
                    .addFields(fields.length > 0 ? fields : {
                        name: 'No Commands',
                        value: 'No commands available for this category.'
                    })
                    .setFooter({text: "A project by OlsSystem"})
                    .setTimestamp();
            }

            await interaction.update({ embeds: [CommandsEmbed] });
        }
    },

    init: async (client) => {

    }
};
