const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ball-of-8')
        .setDescription("Magic ball 8 game.")
        .setDefaultMemberPermissions()
        .addStringOption(option => option.setName('wisdom-question').setDescription("what is thee asking el ball").setRequired(true)),
    helpSection: "fun",
    helpDescription: "Find your future for a quid!",
    execute: async (interaction) => {
        if (interaction.isChatInputCommand()) {
            const { options } = interaction;
            const question = options.getString('wisdom-question');
            const choice = ["🎱| It is certian that you can.", "🎱| It is decidedly so. Very proud!", "🎱| Without a doubt your ok.", "🎱| Innit bruv", "🎱| You may rely on it.", "🎱| As I see it, yes.", "🎱| Most likely.", "🎱| Outlook good.", "🎱| Its a Yes from me.", "🎱| Signs point to yes.", "🎱| Reply hazy, try again.", "🎱| Ask again later.", "🎱| Better not tell you now.", "🎱| Cannot predict now.", "🎱| Concentrate and ask again.", "🎱| Don't count on it.", "🎱| My reply is no ur never doing it.", "🎱| My sources say your an idiot for thinking you could do it.", "🎱| L no.", "🎱| Very doubtful."];

            // Create embed without answer
            const embed = new EmbedBuilder()
                .setColor("Red")
                .setTitle(`🎱 | ${interaction.user.username} wisdom from AxolOS`)
                .addFields(
                    { name: "Question", value: question, inline: true }
                );

            // Store question in button ID
            const button = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`ball-of-8_button_${interaction.user.id}`) // Append question to customId
                        .setLabel("🎱 Roll el ball")
                        .setStyle(ButtonStyle.Primary)
                );

            return await interaction.reply({ embeds: [embed], components: [button] });
        }

        // Handle button click
        if (interaction.isButton()) {
            const customId = interaction.customId;

            if (customId.startsWith("ball-of-8_button_")) {
                // Extract question from customId
                const question = customId.replace("ball-of-8_button_", "");
                const choice = ["🎱| It is certian that you can.", "🎱| It is decidedly so. Very proud!", "🎱| Without a doubt your ok.", "🎱| Innit bruv", "🎱| You may rely on it.", "🎱| As I see it, yes.", "🎱| Most likely.", "🎱| Outlook good.", "🎱| Its a Yes from me.", "🎱| Signs point to yes.", "🎱| Reply hazy, try again.", "🎱| Ask again later.", "🎱| Better not tell you now.", "🎱| Cannot predict now.", "🎱| Concentrate and ask again.", "🎱| Don't count on it.", "🎱| My reply is no ur never doing it.", "🎱| My sources say your an idiot for thinking you could do it.", "🎱| L no.", "🎱| Very doubtful."];
                const ball = Math.floor(Math.random() * choice.length);

                const message = interaction.message;
                const embed = message.embeds[0];

                const embed2 = EmbedBuilder.from(embed)
                    .addFields(
                        { name: "Answer", value: choice[ball], inline: true }
                    );

                await interaction.update({ embeds: [embed2], components: [] });
            }
        }
    },
    init: async (client) => {}
};
