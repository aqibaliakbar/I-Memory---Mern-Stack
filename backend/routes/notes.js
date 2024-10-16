const express = require("express");
const router = express.Router();
const Note = require("../models/Note");
const fetchuser = require("../middleware/fetchuser");
const { body, validationResult } = require("express-validator");
const cloudinary = require("../utils/cloudinary");
const upload = require("../middleware/upload");

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
  upload.single("image"), // 'image' is the field name for the file input
  [
    body("title", "Enter a Valid Title").isLength({ min: 3 }),
    body("description", "Description must be atleast 5 characters").isLength({
      min: 5,
    }),
  ],
  async (req, res) => {
    try {
      const { title, description, tag } = req.body;

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      let imageUrl = "";
      if (req.file) {
        // Convert buffer to base64 string
        const base64String = req.file.buffer.toString("base64");
        const dataURI = `data:${req.file.mimetype};base64,${base64String}`;

        // Generate a unique filename
        const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;

        const result = await cloudinary.uploader.upload(dataURI, {
          folder: "notes_images",
          public_id: filename,
          resource_type: "auto",
        });
        imageUrl = result.secure_url;
      }

      const note = new Note({
        title,
        description,
        tag,
        imageUrl,
        user: req.user.id,
      });

      const savedNote = await note.save();

      res.json(savedNote);
    } catch (error) {
      console.error("Error in addnotes:", error);
      console.error("Full error object:", error);
      console.error("Error in addnotes:", error.message);
      res
        .status(500)
        .json({ error: "Internal Server Error", details: error.message });
    }
  }
);
//---================ENDPOINT/ROUTE 3: Update existing notes using: PUT "http://localhost:5000/api/notes/updatenote/:id" Login Required =============================---//

router.put(
  "/updatenote/:id",
  fetchuser,
  upload.single("image"),
  [
    body("title", "Enter a Valid Title").optional().isLength({ min: 3 }),
    body("description", "Description must be at least 5 characters")
      .optional()
      .isLength({
        min: 5,
      }),
  ],
  async (req, res) => {
    try {
      const { title, description, tag } = req.body;

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      let note = await Note.findById(req.params.id);

      if (!note) {
        return res.status(404).json({ error: "Note not found" });
      }

      if (note.user.toString() !== req.user.id) {
        return res.status(401).json({ error: "Not authorized" });
      }

      const newNote = {};
      if (title) newNote.title = title;
      if (description) newNote.description = description;
      if (tag) newNote.tag = tag;

      if (req.file) {
        // Convert buffer to base64 string
        const base64String = req.file.buffer.toString("base64");
        const dataURI = `data:${req.file.mimetype};base64,${base64String}`;

        // Generate a unique filename
        const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;

        const result = await cloudinary.uploader.upload(dataURI, {
          folder: "notes_images",
          public_id: filename,
          resource_type: "auto",
        });
        newNote.imageUrl = result.secure_url;

        // If there's an existing image, delete it from Cloudinary
        if (note.imageUrl) {
          const publicId = note.imageUrl.split("/").pop().split(".")[0];
          await cloudinary.uploader.destroy(publicId);
        }
      }

      note = await Note.findByIdAndUpdate(
        req.params.id,
        { $set: newNote },
        { new: true }
      );

      res.json({ note });
    } catch (error) {
      console.error("Error in updatenote:", error);
      console.error("Full error object:", error);
      res
        .status(500)
        .json({ error: "Internal Server Error", details: error.message });
    }
  }
);

//---================ENDPOINT/ROUTE 4: Update existing notes using: Delete "http://localhost:5000/api/notes/deletenote/:id" Login Required ==========================---//

router.delete("/deletenote/:id", fetchuser, async (req, res) => {
  try {
    // Find the note to be deleted
    let note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    // Check if user owns the note
    if (note.user.toString() !== req.user.id) {
      return res.status(401).json({ error: "Not authorized" });
    }

    // If there's an image associated with the note, delete it from Cloudinary
    if (note.imageUrl) {
      try {
        // Extract public_id from the Cloudinary URL
        const publicId = note.imageUrl.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(publicId);
      } catch (cloudinaryError) {
        console.error("Error deleting image from Cloudinary:", cloudinaryError);
        // Continue with note deletion even if Cloudinary deletion fails
      }
    }

    // Delete the note
    await Note.findByIdAndDelete(req.params.id);

    res.json({ success: "Note has been deleted", note: note });
  } catch (error) {
    console.error("Error in deletenote:", error);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
});

module.exports = router;
