const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const USER_ROLES = ['donor', 'ngo', 'delivery', 'admin'];

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [80, 'Name cannot exceed 80 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: USER_ROLES,
      default: 'donor',
    },
    ngoApprovalStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: function defaultNgoApprovalStatus() {
        return this.role === 'ngo' ? 'pending' : 'approved';
      },
    },
    ngoCapacity: {
      type: Number,
      default: 25,
      min: 0,
    },
    acceptedCategories: {
      type: [String],
      default: ['cooked_food', 'packaged_food', 'raw_food', 'fruits_vegetables', 'grains', 'bakery', 'dairy', 'other'],
    },
    ngoLatitude: {
      type: Number,
      default: null,
      min: -90,
      max: 90,
    },
    ngoLongitude: {
      type: Number,
      default: null,
      min: -180,
      max: 180,
    },
    activeDeliveriesCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  return next();
});

userSchema.methods.comparePassword = function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function toJSON() {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = {
  User: mongoose.model('User', userSchema),
  USER_ROLES,
};
