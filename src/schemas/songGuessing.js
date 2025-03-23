const { model, Schema, models} = require('mongoose');

let songGuessing = new Schema({
    Guild: String,
    User: String,
    SongName: String,
    SongArtist: String,
    Balance: Number,
    GuessesLeft: Number,
    NextLineIndex: Number,
    FullLyrics: Array,
    RevealedLines: Array,
});

module.exports = models.songGuessing || model("songGuessing", songGuessing);
