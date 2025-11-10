const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const User = require('../models/User');

// Save a score for current user (updates topScore if higher)
router.post('/save', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const { score } = req.body;
    if (score > user.topScore) {
      user.topScore = score;
      await user.save();
    }
    // Always return the current topScore
    res.json({ topScore: user.topScore });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Leaderboard (top N users)
router.get('/leaderboard', async (req, res) => {
  try {
    const limit = Math.min(50, parseInt(req.query.limit || '50', 10));
    const topUsers = await User.find()
      .sort({ topScore: -1 })
      .limit(limit)
      .select('username fullname topScore -_id');

    res.json(topUsers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
