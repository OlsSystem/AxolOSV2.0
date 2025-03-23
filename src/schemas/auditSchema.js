const { model, Schema, models} = require('mongoose');

let auditSchema = new Schema({
    Guild: String,
    ChannelID: String,
    Settings: Array,
})

module.exports = models.auditSchema || model("auditSchema", auditSchema);
