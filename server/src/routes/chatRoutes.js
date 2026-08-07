const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { 
  accessChat, 
  fetchChats, 
  createGroupChat, 
  sendMessage, 
  allMessages, 
  getUnreadCount, 
  getSupportContact 
} = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Ensure this directory exists
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

router.use(protect);

// Chat Routes
router.post('/', accessChat);
router.get('/', fetchChats);
router.post('/group', createGroupChat);
router.get('/unread-count', getUnreadCount);
router.get('/support-contact', getSupportContact);

// Message Routes
router.post('/message', upload.single('attachment'), sendMessage);
router.get('/message/:chatId', allMessages);

module.exports = router;
