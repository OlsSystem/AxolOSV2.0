const { model, Schema, models } = require('mongoose');

let eventSchema = new Schema({
    Guild: String,
    EventName: String,
    EventID: String,
    CategoryChannel: String,
    AnnouncementsChannel: String,
    GeneralChannel: String,
    InfoChannel: String,
    RoleID: String,
})

module.exports = models.eventSchema || model("eventSchema", eventSchema);
