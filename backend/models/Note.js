const mongoose = require("mongoose");
const { Schema } = mongoose;

const NotesSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },

  title: {
    type: String,
    reqiured: true,
  },

  description: {
    type: String,
    reqiured: true,
  },

  tag: {
    type: String,
    default: "General",
  },
  imageUrl: {
    type: String,
  },

  date: {
    type: String,
    default: new Date(),
  },
});

const Note = mongoose.model("Usernotes", NotesSchema);
module.exports = Note;
