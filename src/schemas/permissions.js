const { model, Schema, models} = require('mongoose');

let permissions = new Schema({
    Guild: String,
    Roles: Array

});

module.exports = models.permissions || model("permissions", permissions);
