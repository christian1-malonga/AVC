const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  first_name: {
    type: String,
    required: true,
    unique: true,
  },
  last_name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: () => this.provider === "local",
    unique: true,
  },
  phone: {
    type: String,
      unique: true,
    sparse: true,
    required: () => this.provider === "local",
  },
  password: {
    type: String,
    required: () => this.provider === "local",
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true,
  },
  provider: {
    type: String,
    enum: ["local", "google"],
    default: "local",
  },
});

// Hash the password before saving the user
UserSchema.pre('save', async function() {
  const user = this;
  if (!user.isModified('password')) return;
  const hashedPassword = await bcrypt.hash(user.password, 10);
  user.password = hashedPassword;
});

// Method to compare the provided password with the hashed password
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
}

module.exports = mongoose.model('User', UserSchema);
