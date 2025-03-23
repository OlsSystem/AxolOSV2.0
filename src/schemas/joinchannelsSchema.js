const { model, Schema, models} = require('mongoose');

let joinChannels = new Schema({
    GuildID: String,
    WelcomeChannelID: String,
    LeaveChannelID: String,
})

module.exports = models.joinChannels || model("joinChannels", joinChannels);
