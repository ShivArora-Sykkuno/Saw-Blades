const express = require('express');
const router = express.Router();
const Activity = require('../models/Activity');
const authMiddleware = require('../middleware/authMiddleware'); // JWT check

router.post('/add', authMiddleware, async (req, res) => {
  try {
    const { score } = req.body;

    // Save activity correctly according to the schema
    const activity = new Activity({
      user: req.user.id, // <-- ObjectId
      score
    });
    await activity.save();

    res.json({ msg: 'Score saved', activity });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get user's activities
router.get('/', authMiddleware, async (req, res) => {
  try {
    const activities = await Activity.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(activities);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
