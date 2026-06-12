require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./database');

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files as static assets
// A file saved as uploads/abc.pdf is accessible at http://localhost:5000/uploads/abc.pdf
app.use('/uploads', express.static('uploads'));

// Import routes
const authRoutes   = require('./routes/auth');
const notesRoutes  = require('./routes/notes');
const eventsRoutes = require('./routes/events');

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Server is running' });
});

// Mount auth routes — all requests to /api/auth/... will go to routes/auth.js
app.use('/api/auth', authRoutes);

// Mount notes routes — all requests to /api/notes/... will go to routes/notes.js
app.use('/api/notes', notesRoutes);

// Mount events routes — all requests to /api/events/... will go to routes/events.js
app.use('/api/events', eventsRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
