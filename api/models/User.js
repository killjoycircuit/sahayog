const mongoose = require('mongoose');
const { Schema } = mongoose;

const UserSchema = new Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  avatar: {
    type: String, // Optional field for the user's avatar URL
  },
}, { timestamps: true }); // Automatically adds createdAt and updatedAt fields

const UserModel = mongoose.model('User', UserSchema);

module.exports = UserModel;