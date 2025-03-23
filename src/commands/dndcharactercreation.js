const { SlashCommandBuilder, messageLink } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('dndcharactercreation')
        .setDescription('Creates a D&D character sheet')
        .addStringOption(option => option.setName('name').setDescription('The Name of your very cool character.').setRequired(false))
        .addStringOption(option => option.setName('basicstats').setDescription('The basic stats of your character').setRequired(false))
        .addStringOption(option => option.setName('abilities').setDescription('The abilities of your character').setRequired(false))
        .addStringOption(option => option.setName('attacks').setDescription('The attacks of your character').setRequired(false))
        .addStringOption(option => option.setName('modifiers').setDescription('The modifiers of your character').setRequired(false))
        .addStringOption(option => option.setName('proficiencies').setDescription('The proficiencies of your character').setRequired(false))
        .addStringOption(option => option.setName('items').setDescription('The items of your character').setRequired(false))
        .addStringOption(option => option.setName('spells').setDescription('The spells of your character').setRequired(false)),
    helpSection: "dnd",
    helpDescription: "Makeuth yound D'uth&D'uth character.",
    execute: async (interaction) => {

        const user = interaction.user;
        const sheet = {
            name: interaction.options.getString('name') || "Insert basic character name here",
            basicStats: interaction.options.getString('basicstats') || "N/A", // Adds the inputs from the command to a sheet
            abilities: interaction.options.getString('abilities') || "N/A" ,
            attacks: interaction.options.getString('attacks') || "N/A",
            spells: interaction.options.getString('spells') || "N/A", // the || symbol a pipe. This means if nothing is there then it does whats on the other side.
            modifiers: interaction.options.getString('modifiers') || "N/A",
            proficiencies: interaction.options.getString('proficiencies') || "N/A",
            items: interaction.options.getString('items') || "N/A",
        };
        db.set(user.id, sheet); // qucik db sets the user id to the sheet idk what u wanna do with it but ok


        const embed = new EmbedBuilder() // makes embed
            .setColor("Red")
            .setTitle(`${user.tag}'s Character Sheet`)
            .addFields({ name: 'Character Name:', value: sheet.name})
            .addFields({ name: 'Basic Stats:', value: sheet.basicStats})
            .addFields({ name: 'Abilities:', value: sheet.abilities})
            .addFields({ name: 'Attacks:', value: sheet.attacks})
            .addFields({ name: 'Spells:', value: sheet.spells})
            .addFields({ name:'Modifiers:', value: sheet.modifiers})
            .addFields({ name: 'Proficiencies:', value: sheet.proficiencies})
            .addFields({ name: 'Items:', value: sheet.items})
            .setFooter({ text: "AxolOS DnD System"})

        const channel = interaction.channel;
        const thread = await channel.threads.create({
            name: `${user.tag}'s character sheet`
        })

        thread.send({ embeds: [embed] }); // sends embed
        await interaction.reply({ content: "Sent in Thread.", ephemeral: true})

    },
    init: (client) => {

    }

}



