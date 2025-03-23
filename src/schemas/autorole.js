const { model, Schema, models} = require('mongoose');

let autoRole = new Schema({
    GuildID: String,
    RoleName: String,
    RoleID: String
})

module.exports = models.autoRole || model("autoRole", autoRole);
