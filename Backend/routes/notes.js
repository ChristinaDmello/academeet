const express = require('express');
const router = express.Router();
const Notes  = require('../models/Notes');
const { protect, facultyOnly } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload'); // multer file upload config

// ─────────────────────────────────────────────────────────────
// POST /api/notes
// Upload a new note — faculty only
// Accepts multipart/form-data (FormData from frontend)
// Fields: title, subject, department, year + file
// ─────────────────────────────────────────────────────────────
//
// Middleware order:
//   protect       → verifies JWT, adds req.user
//   facultyOnly   → blocks non-faculty
//   upload.single → parses the uploaded file into req.file,
//                   and all other fields into req.body
//
router.post('/', protect, facultyOnly, upload.single('file'), async (req, res) => {
  try {
    // Text fields come from req.body (parsed by multer, not express.json)
    const { title, subject, department, year } = req.body;

    // req.file is the uploaded file object added by multer
    // It is undefined if no file was sent
    if (!title || !subject || !department || !year || !req.file) {
      return res.status(400).json({ message: 'Please provide all required fields and a file.' });
    }

    // Build the public URL path for this file
    // e.g. /uploads/1714900000000-notes.pdf
    // The frontend can use this to download the file
    const fileUrl = `/uploads/${req.file.filename}`;

    // Create the note and link it to the logged-in faculty user
    const note = new Notes({
      title,
      subject,
      department,
      year: Number(year),
      fileUrl,
      uploadedBy: req.user.id, // comes from the JWT token via protect middleware
    });

    await note.save();

    res.status(201).json({
      message: 'Note uploaded successfully!',
      note,
    });

  } catch (error) {
    console.error('Upload note error:', error.message);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

// ─────────────────────────────────────────────────────────────
// GET /api/notes
// Get notes — accessible by both students and faculty
// Optional query filters: ?department=cse&year=2&subject=math
// ─────────────────────────────────────────────────────────────
router.get('/', protect, async (req, res) => {
  try {
    // Build a filter object from the query parameters
    // Only add a filter if the query param was actually provided
    const filter = {};
    if (req.query.department) filter.department = req.query.department;
    if (req.query.year)       filter.year = Number(req.query.year);
    if (req.query.subject)    filter.subject = req.query.subject;

    // Find notes matching the filter, newest first
    // .populate fills in the uploader's name and email from the users collection
    const notes = await Notes.find(filter)
      .sort({ createdAt: -1 })
      .populate('uploadedBy', 'name email');

    res.status(200).json({ notes });

  } catch (error) {
    console.error('Get notes error:', error.message);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

// ─────────────────────────────────────────────────────────────
// PUT /api/notes/:id
// Edit a note — faculty only
// Body: any fields you want to update (title, subject, etc.)
// ─────────────────────────────────────────────────────────────
router.put('/:id', protect, facultyOnly, async (req, res) => {
  try {
    // Find the note by its MongoDB _id
    const note = await Notes.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ message: 'Note not found.' });
    }

    // Only the faculty member who uploaded the note can edit it
    if (note.uploadedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only edit your own notes.' });
    }

    // Update only the fields that were sent in the request body
    const { title, subject, department, year, fileUrl } = req.body;
    if (title)      note.title = title;
    if (subject)    note.subject = subject;
    if (department) note.department = department;
    if (year)       note.year = Number(year);
    if (fileUrl)    note.fileUrl = fileUrl;

    await note.save();

    res.status(200).json({
      message: 'Note updated successfully!',
      note,
    });

  } catch (error) {
    console.error('Edit note error:', error.message);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

// ─────────────────────────────────────────────────────────────
// DELETE /api/notes/:id
// Delete a note — faculty only
// ─────────────────────────────────────────────────────────────
router.delete('/:id', protect, facultyOnly, async (req, res) => {
  try {
    const note = await Notes.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ message: 'Note not found.' });
    }

    // Only the faculty member who uploaded the note can delete it
    if (note.uploadedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only delete your own notes.' });
    }

    await Notes.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'Note deleted successfully!' });

  } catch (error) {
    console.error('Delete note error:', error.message);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

module.exports = router;
