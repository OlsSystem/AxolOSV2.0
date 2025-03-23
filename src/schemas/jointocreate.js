const { model, Schema, models} = require('mongoose');

let jointocreate = new Schema({
    Guild: String,
    Channel: String,
    Category: String,
    VoiceLimit: Number
})

module.exports = models.jointocreate || model("jointocreate", jointocreate);
