const express = require('express');
const router = express.Router();
const { login, register, createUser, getUsers, updateUser } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/login', login);
router.post('/register', register);
router.route('/users')
  .post(protect, authorize('Admin'), createUser)
  .get(protect, authorize('Admin'), getUsers);

router.route('/users/:id')
  .put(protect, authorize('Admin'), updateUser);

module.exports = router;
