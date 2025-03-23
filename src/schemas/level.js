const { model, Schema, models} = require('mongoose');

let levelSchema = new Schema({
    Guild: String,
    User: String,
    XP: Number,
    Level: Number
})

module.exports = models.level || model("level", levelSchema);
