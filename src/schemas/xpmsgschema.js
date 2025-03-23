const { model, Schema, models} = require('mongoose');

let xpmsg = new Schema({
    GuildID: String,
    Using: String,
    ChannelID: String,
});

module.exports = models.xpmsg || model("xpmsg", xpmsg);
