const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcrypt');
const saltRounds = 10;
// @route   POST /api/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    // Create and save new user (password will be hashed automatically)
    const passwordHash = await bcrypt.hash(password, saltRounds);
    const newUser = new User({ name, email, passwordHash });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// @route   POST /api/login
// @desc    Log in a user
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

   // Check if password is correct using bcrypt
   const passwordMatch = await user.comparePassword(password);


   if (!passwordMatch) {
     return res.status(401).json({ message: 'Incorrect password' });
   }

   // ✅ Store user email in session after successful login
   req.session.email = user.email;

    // Login successful (you can add JWT/session here)
    res.json({ message: 'Login successful', user: user.email });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login' });
  }
});

//route to check if user is authenticated.
router.get('/check-auth', async (req, res) => {
  if (req.session && req.session.email) {
    try {
      const user = await User.findOne({ email: req.session.email });
      if (!user) {
        return res.status(401).json({ loggedIn: false });
      }

      res.status(200).json({
        loggedIn: true,
        email: user.email,
        name: user.name 
      });
    } catch (err) {
      console.error('Check-auth error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  } else {
    res.status(401).json({ loggedIn: false });
  }
});
// Middleware to check if user is authenticated
const authMiddleware = async (req, res, next) => {
  if (req.session && req.session.email) {
    try {
      const user = await User.findOne({ email: req.session.email });
      if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      req.user = user;
      next();
    } catch (err) {
      console.error('Auth middleware error:', err);
      res.status(500).json({ message: 'Server error during authentication' });
    }
  } else {
    res.status(401).json({ message: 'Unauthorized' });
  }
};

router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ message: 'Logout failed' });
    res.clearCookie('connect.sid');
    res.status(200).json({ message: 'Logged out' });
  });
});



module.exports = router;
module.exports.authMiddleware = authMiddleware;
