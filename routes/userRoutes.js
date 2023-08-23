const express = require('express');
const router = express.Router();
const {
  // getAllUsers,
  // getUser,
  // updateUser,
  // deleteUser,
  // updateMe,
  // deleteMe,
  // getMe,
} = require('../controllers/userController');

const {
  // protect,
  signup,
  login,
  logout,
  // updatePassword,
  // forgotPassword,
  // resetPassword,
  // restrictTo,
} = require('../controllers/authController');

// Public
router.post('/signup', signup);
router.post('/login', login);
router.get('/logout', logout);

module.exports = router;
