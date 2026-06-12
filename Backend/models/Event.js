const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    // Stored as a Date — MongoDB handles date comparisons and sorting
    date: {
      type: Date,
      required: true,
    },

    time: {
      type: String,
      trim: true,
    },

    venue: {
      type: String,
      trim: true,
    },

    // Path to the uploaded image file, e.g. "/uploads/1714900000000-event.jpg"
    imageUrl: {
      type: String,
      default: '',
    },

    // The faculty member who created this event
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Array of student IDs who registered for this event
    attendees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
);

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
