const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, MessageFlags } = require("discord.js")

module.exports = {
    data: new SlashCommandBuilder()
        .setName('viewcharactersheet')
        .setDescription('View your D&D character sheet'),
    helpSection: "dnd",
    helpDescription: "show character man",
    execute: async (interaction) => {
        const user = interaction.user;
        const sheet = await db.get(user.id);
        const { name, basicStats, abilities, attacks, spells, modifiers, proficiencies, items } = sheet;

        if (!sheet) {
            await interaction.reply({ content: "You haven't created a character sheet yet!", flags: MessageFlags.Ephemeral });
            return;
        }

        const embed = new EmbedBuilder()
            .setTitle(`${user.tag}'s Character Sheet:`)
            .setColor("Red")
            .addFields(
                { name: "Character Name:", value: `${name}` },
                { name: "Basic Stats:", value: `${basicStats}` },
                { name: "Abilities:", value: `${abilities}` },
                { name: "Attacks:", value: `${attacks}` },
                { name: "Spells:", value: `${spells}` },
                { name: "Modifiers:", value: `${modifiers}` },
                { name: "Proficiencies:", value: `${proficiencies}` },
            )

        await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    },
    init: async (client) => {

    }
};
