const { SlashCommandBuilder } = require('@discordjs/builders');
const EconomySchema = require("../schemas/economy.js");
const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("economy-leaderboards")
        .setDescription('displays all economy leaderboards'),
    helpSection: "economy",
    helpDescription: "Flex on all the haters that you are just supreme.",
    execute: async (interaction) => {

        if (interaction.isChatInputCommand()) {

            const MenuEmbed = new EmbedBuilder()
                .setColor("Red")
                .setTitle("Economy Leaderboards")
                .setDescription("Here you can display all the leaderboards you want with a click of a button.")
                .addFields(
                    {name: "Local", value: "Displays the guilds local leaderboard for economies."},
                    {name: "Global", value: "Displays the bots global leaderboard for economies."}
                )
                .setThumbnail("https://cdn.discordapp.com/attachments/1097171486852255785/1097634246593609868/0a84c22d05ea3f137fe0ca09b9bf9f3a.jpg")
                .setFooter({text: "A project by OlsSystem"});

            const menuComponents = new ActionRowBuilder()
                .addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId(`economy-leaderboards-menu_${interaction.user.id}`)
                        .setMinValues(1)
                        .setMaxValues(1)
                        .addOptions(
                            {
                                label: 'Local Economy',
                                description: 'Shows the local economy leaderboard',
                                value: 'local',
                            },
                            {
                                label: 'Global Commands',
                                description: 'Shows the global economy leaderboard',
                                value: 'global',
                            },
                        ),
                );


            return await interaction.reply({embeds: [MenuEmbed], components: [menuComponents]});
        }

        if (interaction.customId.includes("economy-leaderboards-menu")) {
            let choices = "";

            await interaction.values.forEach(async value => {
                choices += `${value}\n`
                const { client } = interaction;

                switch (value) {
                    case 'local':
                        await interaction.update({ content: "" })

                        let texts = "";

                        const embed2 = new EmbedBuilder()
                            .setColor("Blue")
                            .setDescription(':white_check_mark: Bro yall are poor.')

                        let data = await EconomySchema.find({ Guild: interaction.guild.id })
                            .sort({
                                Money: -1
                            })
                            .limit(10)

                        if (!data) return await interaction.reply({ embeds: [embed2] })


                        for (let counter = 0; counter < data.length; ++counter) {

                            let { User, Money } = data[counter];
                            const value = await client.users.fetch(User) || "Unknown Member."
                            const member = value.tag;
                            texts += `${counter + 1}. ${member} | Money: £${Money} \n`

                            const embed = new EmbedBuilder()
                                .setColor("Blue")
                                .setThumbnail("https://cdn.discordapp.com/attachments/1097171486852255785/1097634246593609868/0a84c22d05ea3f137fe0ca09b9bf9f3a.jpg")
                                .setTitle(`${interaction.guild.name}'s Rich Kid Tier List`)
                                .setDescription(`\`\`\`${texts}\`\`\``)
                                .setTimestamp()
                                .setFooter({ text: "AxolOS Bankin" })

                            interaction.editReply({ embeds: [embed], content: "" })
                        }
                        break;

                    case 'global':
                        await interaction.update({ content: "Loading..." })

                        let text = "";

                        const embed1 = new EmbedBuilder()
                            .setColor("Blue")
                            .setDescription(':white_check_mark: Bro yall are poor.')

                        let Data = await EconomySchema.find()
                            .sort({
                                Money: -1
                            })
                            .limit(10)

                        if (!Data) return await interaction.reply({ embeds: [embed1] })


                        for (let counter = 0; counter < Data.length; ++counter) {

                            let { User, Money, GuildName } = Data[counter];
                            const value = await client.users.fetch(User) || "Unknown Member."
                            const member = value.tag;
                            text += `${counter + 1}. ${member} | Money: £${Money} | Guild: ${GuildName}\n`

                            const embed = new EmbedBuilder()
                                .setColor("Blue")
                                .setTitle(`AxolOS Global Rich Kid Tier List`)
                                .setDescription(`\`\`\`${text}\`\`\``)
                                .setTimestamp()
                                .setFooter({ text: "AxolOS Bankin" })

                            interaction.editReply({ embeds: [embed], content: "" });

                        }
                        break;
                }
            });
        }
    },
    init: (client) => {

    }
}