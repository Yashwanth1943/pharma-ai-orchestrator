const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const { login, register, createUser, getUsers, updateUser, deleteUser, getMe, updateProfile, forgotPassword, getDirectoryUsers } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Rate limiters
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 login requests per windowMs
  message: { message: 'Too many login attempts, please try again later.' }
});

const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }
    res.status(400).json({ errors: errors.array() });
  };
};

// Public routes
router.post('/login', loginLimiter, login);
router.post('/register', validate([
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
]), register);
router.post('/forgot-password', forgotPassword);

// Token validation — used on page refresh
router.get('/me', protect, getMe);

// User profile update
router.put('/profile', protect, updateProfile);

// Directory (Internal staff only)
router.get('/directory', protect, getDirectoryUsers);

// Admin-only user management
router.route('/users')
  .post(protect, authorize('Admin'), createUser)
  .get(protect, authorize('Admin'), getUsers);

router.route('/users/:id')
  .put(protect, authorize('Admin'), updateUser)
  .delete(protect, authorize('Admin'), deleteUser);

module.exports = router;
