require('dotenv').config();
const connectDB = require('./database');
const Event = require('./models/Event');
const User  = require('./models/User');

// imageUrl paths match files in Backend/uploads/ which are served at /uploads/<filename>
// The frontend getImageSrc() will load them as http://localhost:5000/uploads/<filename>
const seedEvents = [
  {
    title:       'Tech Talk',
    description: 'A session on latest technologies',
    date:        new Date('2026-05-10'),
    time:        '10:00',
    venue:       'Seminar Hall',
    imageUrl:    '/uploads/techtalk.png',
  },
  {
    title:       'Cultural Fest',
    description: 'Annual cultural celebration',
    date:        new Date('2026-06-05'),
    time:        '14:00',
    venue:       'College Ground',
    imageUrl:    '/uploads/culturalfest.webp',
  },
  {
    title:       'Hackathon',
    description: '24-hour coding competition',
    date:        new Date('2026-05-25'),
    time:        '09:00',
    venue:       'Computer Lab',
    imageUrl:    '/uploads/hackathon.jpg',
  },
];

const seed = async () => {
  await connectDB();

  // createdBy is required — use the first faculty account found in the database
  const faculty = await User.findOne({ role: 'faculty' });
  if (!faculty) {
    console.log('❌  No faculty user found.');
    console.log('    Please register as a faculty member first, then run this script again.');
    process.exit(1);
  }

  console.log(`Using faculty: ${faculty.name} (${faculty.email})\n`);

  let added = 0;
  for (const eventData of seedEvents) {
    const exists = await Event.findOne({ title: eventData.title });
    if (exists) {
      console.log(`⏭  Already exists — skipping: ${eventData.title}`);
    } else {
      await Event.create({ ...eventData, createdBy: faculty._id });
      console.log(`✅  Added: ${eventData.title}`);
      added++;
    }
  }

  console.log(`\nDone! ${added} event(s) added to the database.`);
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
