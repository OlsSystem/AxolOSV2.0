const { Events, EmbedBuilder} = require('discord.js');
const levelSchema = require('../schemas/level')
const xpmsgSchema = require('../schemas/xpmsgschema')


module.exports = {
    name: Events.MessageCreate,
    once: false,
    async execute(message) {
        const { guild, author } = message;
        if (!guild || author.bot) return;

        const filter = { Guild: guild.id, User: author.id };
        let data = await levelSchema.findOne(filter);

        if (!data) {
            data = await levelSchema.create({
                Guild: guild.id,
                User: guild.id,
                XP: 0,
                Level: 0,
            });
            console.log("New Level Data made")
        }

        const channelData = await xpmsgSchema.findOne({ GuildID: guild.id });
        if (!channelData) return;
        if (channelData.Using === 'false') return;
        let channel = await message.guild.channels.cache.get(channelData.ChannelID)

        const give = 1;

        data.XP += give;
        const requiredXP = data.Level * data.Level * 20 + 20

        if (data.XP >= requiredXP) {
            data.XP -= requiredXP;
            data.Level += 1;
            await data.save();

            if (!channel) return;

            const embed = new EmbedBuilder()
                .setColor("Blue")
                .setDescription(`${message.author}, yay you leveled up. You are now level ${data.Level}`)

            channel.send({ embeds: [embed] })
        }
        await data.save();
    }
}