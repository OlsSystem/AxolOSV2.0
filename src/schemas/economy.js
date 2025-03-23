const { model, Schema, models } = require('mongoose');

let economySchema = new Schema({
    Guild: String,
    User: String,
    Money: Number,
    GuildName: String
})

module.exports = models.economy || model("economy", economySchema);
