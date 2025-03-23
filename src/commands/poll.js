const { SlashCommandBuilder,  } = require('@discordjs/builders');
const { MessageFlags, EmbedBuilder } = require(`discord.js`);

module.exports = {
    data: new SlashCommandBuilder()
        .setName('poll')
        .setDescription('polling innit.')
        .addStringOption(option => option.setName('title').setDescription("what we polin about").setRequired(true))
        .addRoleOption(option => option.setName("role").setDescription("what role we pinging").setRequired(true))
        .addStringOption(option => option.setName('option1').setDescription("option 1 out of 5").setRequired(true))
        .addStringOption(option => option.setName('option2').setDescription("option 2 out of 5").setRequired(true))
        .addStringOption(option => option.setName('option3').setDescription("option 3 out of 5"))
        .addStringOption(option => option.setName('option4').setDescription("option 4 out of 5"))
        .addStringOption(option => option.setName('option5').setDescription("option 5 out of 5")),
    helpSection: "fun",
    modPermissions: true,
    helpDescription: "Politics: Discord Addition",
    execute: async (interaction) => {

        await interaction.deferReply({ content: "Poll is loading....", flags: MessageFlags.Ephemeral });
        const { channel } = await interaction;
        const options = await interaction.options.data;
        const role = interaction.options.getRole("role");
        const emojis = ["N/A", ":one:", ":two:", ":three:", ":four:", ":five:" ];
        const remoji = ["N/A", "1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣"]

        const embed = new EmbedBuilder()
            .setTitle(`${options[0].value}`)
            .setColor('Red')
            .setFooter({ text: `Poll Created by: ${interaction.user.username}`});

        for (let i = 2; i < options.length; i++) {
            let emoji = emojis[i-1];
            let option = options[i];
            embed.addFields(
                { name: `${emoji} | ${option.value}`, value: " " }
            )
        }

        const message = await channel.send({ content: `${role}`, embeds: [embed] });
        await interaction.editReply({ content: "Poll is being discussed by parliment.", flags: MessageFlags.Ephemeral });


        for (let i = 2; i < options.length; i++) {
            let emoji = remoji[i-1];
            message.react(emoji);
        }


    },
    init: async (client) => {

    }
}