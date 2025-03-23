const { model, Schema, models} = require('mongoose');

let reaction = new Schema({
    Guild: String,
    Roles: Array

});

module.exports = models.ReactionRoles || model("ReactionRoles", reaction);
