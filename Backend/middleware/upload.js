const multer = require('multer');
const path   = require('path');

// ── Where to store the file and what to name it ──
const storage = multer.diskStorage({

  // Files will be saved inside the "uploads/" folder in your Backend directory
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },

  // Give each file a unique name so two files with the same name don't overwrite each other
  // Example result: "1714900000000-notes.pdf"
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  },
});

// ── Only allow certain file types ──
const fileFilter = (req, file, cb) => {
  const allowedTypes = /pdf|doc|docx|ppt|pptx|txt|png|jpg|jpeg/;
  const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
  if (allowedTypes.test(ext)) {
    cb(null, true);  // accept the file
  } else {
    cb(new Error('Only PDF, DOC, PPT, TXT, and image files are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // max 10 MB
});

module.exports = upload;
