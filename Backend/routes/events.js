const express = require('express');
const router  = express.Router();
const Event   = require('../models/Event');
const { protect, facultyOnly } = require('../middleware/authMiddleware');
const upload  = require('../middleware/upload'); // reuses existing multer config

// ─────────────────────────────────────────────────────────────
// POST /api/events
// Create a new event — faculty only
// Accepts multipart/form-data: title, description, date, time, venue + optional image
// ─────────────────────────────────────────────────────────────
router.post('/', protect, facultyOnly, upload.single('image'), async (req, res) => {
  try {
    const { title, description, date, time, venue } = req.body;

    if (!title || !date) {
      return res.status(400).json({ message: 'Title and date are required.' });
    }

    // If an image was uploaded, build its public URL path
    // req.file is populated by multer when a file is sent — undefined if no file
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';

    const event = new Event({
      title,
      description,
      date,
      time,
      venue,
      imageUrl,
      createdBy: req.user.id, // from JWT token via protect middleware
    });

    await event.save();

    res.status(201).json({ message: 'Event created successfully!', event });

  } catch (error) {
    console.error('Create event error:', error.message);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

// ─────────────────────────────────────────────────────────────
// GET /api/events
// Get all events — accessible by both students and faculty
// ─────────────────────────────────────────────────────────────
router.get('/', protect, async (req, res) => {
  try {
    // Sort newest first, and populate the creator's name
    const events = await Event.find()
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name email');

    res.status(200).json({ events });

  } catch (error) {
    console.error('Get events error:', error.message);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

// ─────────────────────────────────────────────────────────────
// PUT /api/events/:id
// Edit an event — faculty only
// Accepts multipart/form-data so a new image can optionally be uploaded
// ─────────────────────────────────────────────────────────────
router.put('/:id', protect, facultyOnly, upload.single('image'), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    // Only the faculty who created this event can edit it
    if (event.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only edit your own events.' });
    }

    // Update only the fields that were sent — leave others unchanged
    const { title, description, date, time, venue } = req.body;
    if (title)       event.title       = title;
    if (description) event.description = description;
    if (date)        event.date        = date;
    if (time)        event.time        = time;
    if (venue)       event.venue       = venue;

    // If a new image was uploaded, replace the old imageUrl
    if (req.file) {
      event.imageUrl = `/uploads/${req.file.filename}`;
    }

    await event.save();

    res.status(200).json({ message: 'Event updated successfully!', event });

  } catch (error) {
    console.error('Edit event error:', error.message);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

// ─────────────────────────────────────────────────────────────
// DELETE /api/events/:id
// Delete an event — faculty only
// ─────────────────────────────────────────────────────────────
router.delete('/:id', protect, facultyOnly, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    // Only the creator can delete their own event
    if (event.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only delete your own events.' });
    }

    await Event.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'Event deleted successfully!' });

  } catch (error) {
    console.error('Delete event error:', error.message);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

// ─────────────────────────────────────────────────────────────
// POST /api/events/:id/register
// Register a student for an event — students only
// ─────────────────────────────────────────────────────────────
router.post('/:id/register', protect, async (req, res) => {
  try {
    // Only students can register
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can register for events.' });
    }

    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    // Check if this student has already registered
    // .toString() converts ObjectId to string so === comparison works
    const alreadyRegistered = event.attendees.some(
      (id) => id.toString() === req.user.id
    );

    if (alreadyRegistered) {
      return res.status(409).json({ message: 'You are already registered for this event.' });
    }

    // Add the student's ID to the attendees array
    event.attendees.push(req.user.id);
    await event.save();

    res.status(200).json({ message: 'Successfully registered for the event!' });

  } catch (error) {
    console.error('Register event error:', error.message);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

// ─────────────────────────────────────────────────────────────
// GET /api/events/:id/attendees
// View all attendees for an event — faculty only
// ─────────────────────────────────────────────────────────────
router.get('/:id/attendees', protect, facultyOnly, async (req, res) => {
  try {
    // .populate fills in the full user details for each attendee ID
    const event = await Event.findById(req.params.id)
      .populate('attendees', 'name email department');

    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    res.status(200).json({
      event:     event.title,
      attendees: event.attendees, // each is now a full user object with name, email, department
      total:     event.attendees.length,
    });

  } catch (error) {
    console.error('Get attendees error:', error.message);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

module.exports = router;
