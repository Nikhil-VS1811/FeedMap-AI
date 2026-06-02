const express = require('express');

const upload = require('../config/multer');
const { authorize, protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, authorize('donor'), upload.single('image'), (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('Image file is required');
  }

  const imageUrl = `/uploads/${req.file.filename}`;
  console.log('[upload] image stored', {
    imageUrl,
    mimeType: req.file.mimetype,
    size: req.file.size,
    user: req.user._id.toString(),
  });

  res.status(201).json({ imageUrl });
});

module.exports = router;
