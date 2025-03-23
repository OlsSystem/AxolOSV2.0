const { model, Schema, models} = require('mongoose');

let warnSchema = new Schema({
    Guild: String,
    LogChannelID: String,
    UsersArray: Array,
})

module.exports = models.warnSchema || model("warnSchema", warnSchema);
