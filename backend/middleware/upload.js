const multer = require('multer');
const path = require('path');

// Configure storage
const storage = multer.memoryStorage(); // Store files in memory

// File filter configuration
const fileFilter = (req, file, cb) => {
  const filetypes = /pdf|doc|docx|jpg|jpeg|png|xlsx|pptx/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only the following filetypes are allowed: PDF, DOC, DOCX, JPG, JPEG, PNG, XLSX, PPTX'));
  }
};

// Configure upload with limits
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB file size limit
    files: 5,                    // Maximum 5 files
    fields: 10,                  // Maximum 10 non-file fields
    parts: 15                    // Combined files + fields limit
  }
});

module.exports = upload;