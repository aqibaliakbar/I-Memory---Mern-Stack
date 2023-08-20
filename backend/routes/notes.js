const express = require("express");
const router = express.Router();
const Note = require("../models/Note");
const fetchuser = require("../middleware/fetchuser");
const { body, validationResult } = require("express-validator");

//---============ENDPOINT/ROUTE 1: Get all the notes using: GET "http://localhost:5000/api/notes/fetchallnotes" Login Required ==============================---//

router.get(
  "/fetchallnotes",
  fetchuser,

  async (req, res) => {
    try {
      const notes = await Note.find({ user: req.user.id });
      res.json(notes);
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ error: "Internal Server error" });
    }
  }
);

//---================ENDPOINT/ROUTE 2: Post all the notes using: POST "http://localhost:5000/api/notes/addnotes" Login Required ===============================---//

router.post(
  "/addnotes",
  fetchuser,

  [
    body("title", "Enter a Valid Title").isLength({ min: 3 }),
    body("description", "Description must be atleast 5 characters").isLength({
      min: 5,
    }),
  ],

  async (req, res) => {
    try {
      const { title, description, tag } = req.body;
      // If there are errors, return bad request and return the errors

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      // After validation we save a new note which will return a promise

      const note = new Note({
        title,
        description,
        tag,
        user: req.user.id,
      });

      const savedNote = await note.save();

      res.json(savedNote);
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ error: "Internal Server error" });
    }
  }
);

//---================ENDPOINT/ROUTE 3: Update existing notes using: PUT "http://localhost:5000/api/notes/updatenote/:id" Login Required =============================---//

router.put(
  "/updatenote/:id",
  fetchuser,

  [],

  async (req, res) => {
    const { title, description, tag } = req.body; // we will take title, description and tag from the req.body

    try {
      // create newNote Object

      const newNote = {}; // newNote is empty

      if (title) {
        newNote.title = title;
      }
      if (description) {
        newNote.description = description;
      }
      if (tag) {
        newNote.tag = tag;
      }

      // Find a note to be updated and update it.

      let note = await Note.findById(req.params.id);

      if (!note) {
        // in case note not exist
        return res.status(404).send("Not Found");
      }

      if (note.user.toString() !== req.user.id) {
        return res.status(401).send("Not Allowed");
      }

      // In case note exist then we do the following to update it:
      note = await Note.findByIdAndUpdate(
        req.params.id,
        { $set: newNote },
        { new: true }
      );

      res.json({ note });
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ error: "Internal Server error" });
    }
  }
);

//---================ENDPOINT/ROUTE 4: Update existing notes using: Delete "http://localhost:5000/api/notes/deletenote/:id" Login Required ==========================---//

router.delete(
  "/deletenote/:id",
  fetchuser,

  [],

  async (req, res) => {
    try {
      // Find a note to be deleted and delete it.

      let note = await Note.findById(req.params.id);
      if (!note) {
        // in case note not exist
        return res.status(404).send("Not Found");
      }

      // Allows deletion only if the user owns the note.
      if (note.user.toString() !== req.user.id) {
        return res.status(401).send("Not Allowed");
      }

      // In case note exist then we do the following to delete it:
      note = await Note.findByIdAndDelete(req.params.id);

      res.json({ Success: "Note Has Been Deleted", note: note });
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ error: "Internal Server error" });
    }
  }
);

module.exports = router;
