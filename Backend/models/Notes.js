const mongoose = require('mongoose');

const notesSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    subject: {
      type: String,
      required: true,
      trim: true,
    },

    // URL of the uploaded file (e.g. a link to the file in cloud storage or local server)
    fileUrl: {
      type: String,
      required: true,
    },

    // Reference to the User who uploaded this note
    // mongoose will use this to link back to the users collection
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    department: {
      type: String,
      required: true,
      trim: true,
    },

    year: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,  // automatically adds createdAt and updatedAt
  }
);

const Notes = mongoose.model('Notes', notesSchema);

module.exports = Notes;
