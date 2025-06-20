const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const auth = require('../middleware/authMiddleware');
const isAdmin = require('../middleware/isAdminMiddleware');

const router = express.Router();

//Register a new user

router.post('/register', async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body;

    // 1. Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already exists' });

    // 2. Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Create and save the user
    const user = new User({
      fullName,
      email,
      password: hashedPassword,
      role: role || 'user'  // Optional: allow setting role during registration
    });

    await user.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//Login user and return JWT token

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find user by email
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    // 2. Compare password
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    // 3. Generate JWT token with role info
    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || '1h'
      }
    );

    // 4. Send back token and user info
    res.json({
      message: `Welcome back, ${user.fullName}`,
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


//Admin-only: Get list of all users

router.get('/', auth, isAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password'); // Exclude passwords
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;