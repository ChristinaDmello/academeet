const mongoose = require('mongoose');

// Define the shape of a user document in MongoDB
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,        // name is mandatory
      trim: true,            // removes extra spaces from both ends
    },

    email: {
      type: String,
      required: true,
      unique: true,          // no two users can have the same email
      lowercase: true,       // always store email in lowercase
      trim: true,
    },

    password: {
      type: String,
      required: true,        // will be stored as a bcrypt hash, never plain text
    },

    role: {
      type: String,
      enum: ['student', 'faculty'],  // only these two values are allowed
      required: true,
    },

    department: {
      type: String,
      required: true,
      trim: true,
    },

    year: {
      type: Number,
      // optional — only meaningful for students, ignored for faculty
    },
  },
  {
    timestamps: true,  // automatically adds createdAt and updatedAt fields
  }
);

// Create and export the model
// Mongoose will create a "users" collection in MongoDB automatically
const User = mongoose.model('User', userSchema);

module.exports = User;
