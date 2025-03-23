const skipCommand = ["viewcharactersheet", "dndstart", "dndcharactercreation"]

const schemasList = [
    { name: "auditSchema", field: "Guild" },
    { name: "autorole", field: "GuildID" },
    { name: "cooldown", field: "Guild" },
    { name: "economy", field: "Guild" },
    { name: "events", field: "Guild" },
    { name: "giveawaysSchema", field: "guildId" },
    { name: "joinchannelsSchema", field: "GuildID" },
    { name: "jointocreate", field: "Guild" },
    { name: "jointocreatechannels", field: "Guild" },
    { name: "level", field: "Guild" },
    { name: "permissions", field: "Guild" },
    { name: "quotes", field: "GuildID" },
    { name: "ReactionRoles", field: "Guild" },
    { name: "songGuessing", field: "Guild" },
    { name: "warnSchema", field: "Guild" },
    { name: "xpmsgschema", field: "GuildID" }
];

module.exports = { skipCommand, schemasList }