const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fullname: { type: String, required: true }, // REQUIRED now
  topScore: { type: Number, default: 0 }
});

module.exports = mongoose.model('User', UserSchema);