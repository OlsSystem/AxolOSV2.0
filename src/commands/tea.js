const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags, PermissionsBitField} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("tea")
        .setDescription("if there be drama going down use this command")
        .addUserOption(option => option.setName("user1").setDescription('who is arguing').setRequired(true))
        .addUserOption(option => option.setName('user2').setDescription('who is arguing with the first person').setRequired(true))
        .addStringOption(option => option.setName('description').setDescription("whats it about?").setRequired(false)),
    helpSection: "fun",
    helpDescription: "☕🫗",
    permissions: [PermissionsBitField.Flags.SendMessages],
    execute: async (interaction) => {

        const { options } = interaction;

        if (interaction.isChatInputCommand()) {

            const user1 = options.getUser("user1");
            const user2 = options.getUser("user2");
            let description = options.getString("description") || "No reason Found.";

            const embed1 = new EmbedBuilder()
                .setColor("Red")
                .setDescription(`🍿 Omg ${user1} and ${user2} are arguing over ${description} smh 🍿`)

            const embed2 = new EmbedBuilder()
                .setColor("Red")
                .setDescription("🍿 AxolOS is now selling popcorn for this amazing argument! 🍿")
                .setTitle("Popcorn for sale!!")

            const button = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('tea-buy')
                        .setLabel("Buy Popcorn")
                        .setStyle(ButtonStyle.Success),
                )

            await interaction.reply({embeds: [embed1]})
            const message = await interaction.followUp({embeds: [embed2], components: [button]});

            return await interaction.followUp({content: "🍿", flags: MessageFlags.Ephemeral })

        }

        const customId = interaction.customId;

        if (customId === "tea-buy") {
            return await interaction.reply({content: `Sold! 🍿 🍿 `, flags: MessageFlags.Ephemeral });
        }

    },
    init: async (client) => {

    }
}