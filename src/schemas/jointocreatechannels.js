const { model, Schema, models} = require('mongoose');

let jointocreatechannels = new Schema({
    Guild: String,
    User: String,
    Channel: String
})

module.exports = models.jointocreatechannels || model("jointocreatechannels", jointocreatechannels);
