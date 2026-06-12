const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');   // used to create the login token
const User = require('../models/User');

// ─────────────────────────────────────────────
// POST /api/auth/register
// Registers a new student or faculty user
// ─────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    // Step 1: Pull the fields out of the request body
    const { name, email, password, role, department, year } = req.body;

    // Step 2: Make sure required fields are present
    if (!name || !email || !password || !role || !department) {
      return res.status(400).json({ message: 'Please fill in all required fields.' });
    }

    // Step 3: role must be either "student" or "faculty"
    if (role !== 'student' && role !== 'faculty') {
      return res.status(400).json({ message: 'Role must be either student or faculty.' });
    }

    // Step 4: Check if a user with this email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    // Step 5: Hash the password before saving
    // The number 10 is the "salt rounds" — higher = more secure but slower
    const hashedPassword = await bcrypt.hash(password, 10);

    // Step 6: Build the new user object
    const newUser = new User({
      name,
      email,
      password: hashedPassword,  // never store plain text passwords
      role,
      department,
      year: role === 'student' ? year : undefined, // only save year for students
    });

    // Step 7: Save to MongoDB
    await newUser.save();

    // Step 8: Send a success response (do NOT send the password back)
    res.status(201).json({
      message: 'Account created successfully!',
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        department: newUser.department,
        year: newUser.year,
      },
    });

  } catch (error) {
    console.error('Register error:', error.message);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

// ─────────────────────────────────────────────
// POST /api/auth/login
// Logs in an existing user and returns a JWT
// ─────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    // Step 1: Pull email, password, and role from the request body
    // 'role' is the portal the user selected on the frontend (student or faculty)
    const { email, password, role } = req.body;

    // Step 2: Make sure all fields are provided
    if (!email || !password || !role) {
      return res.status(400).json({ message: 'Please provide email, password, and role.' });
    }

    // Step 3: Look for a user with this email in the database
    const user = await User.findOne({ email });
    if (!user) {
      // Use a vague message — don't reveal whether the email exists
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Step 4: Check that the user's actual role matches the portal they logged in from
    // Example: a student trying to log in via the faculty portal is rejected here
    if (user.role !== role) {
      return res.status(403).json({
        message: 'Please login through the correct portal.',
      });
    }

    // Step 5: Compare the plain-text password from the request
    // against the hashed password stored in the database
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Step 5: Create a JWT token
    // The payload (first argument) is the data we embed inside the token
    // jwt.sign(payload, secretKey, options)
    const token = jwt.sign(
      {
        id: user._id,      // so we know which user this token belongs to
        role: user.role,   // so we can check permissions (student vs faculty)
      },
      process.env.JWT_SECRET,  // secret key from .env — never hardcode this
      { expiresIn: '1d' }      // token expires after 1 day
    );

    // Step 6: Send back the token and user details (never send the password)
    res.status(200).json({
      message: 'Login successful!',
      token,   // the frontend will store this and send it with future requests
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        year: user.year,
      },
    });

  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

module.exports = router;
