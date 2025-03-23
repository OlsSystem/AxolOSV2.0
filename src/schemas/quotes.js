const { model, Schema, models} = require('mongoose');

let quotesChannel = new Schema({
    GuildID: String,
    ChannelID: String
})

module.exports = models.quotesChannel || model("quotesChannel", quotesChannel);
