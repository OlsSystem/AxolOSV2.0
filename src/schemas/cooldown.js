const { model, Schema, models} = require('mongoose');

let cooldownSchema = new Schema({
    Command: String,
    User: String,
    Guild: String,
    End: Date

})

module.exports = models.cooldown || model("cooldown", cooldownSchema);

