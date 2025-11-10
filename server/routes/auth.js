const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');


const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

router.post('/register', async (req, res) => {
  try {
    const { username, password, fullname } = req.body;
    if (!username || !password || !fullname) {
      return res.status(400).json({ msg: 'Username, Password, and Full Name are required' });
    }
    const existing = await User.findOne({ username });
    if (existing) return res.status(400).json({ msg: 'Username taken' });
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    const user = new User({
      username,
      password: hash,
      fullname
    });
    await user.save();
    const token = jwt.sign(
      { id: user._id, username: user.username, fullname: user.fullname },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({
      token,
      user: { id: user._id, username: user.username, fullname: user.fullname, topScore: user.topScore }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ msg: 'Missing fields' });
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: '3h' });
    res.json({ token, user: { id: user._id, username: user.username, fullname: user.fullname, topScore: user.topScore } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

const Activity = require('../models/Activity'); // to delete user's activity
const authMiddleware = require('../middleware/authMiddleware');
// DELETE /api/auth/delete
router.post('/delete', authMiddleware, async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) return res.status(400).json({ msg: 'Password is required' });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Incorrect password' });

    // Delete user's activities
    await Activity.deleteMany({ user: user._id });

    // Delete user
    await User.findByIdAndDelete(user._id);

    res.json({ msg: 'Account deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('fullname username topScore');
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});


module.exports = router;
