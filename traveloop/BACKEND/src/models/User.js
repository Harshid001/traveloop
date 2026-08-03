const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    avatar: {
      type: String,
      default: '',
    },
    phone: {
      type: String,
      default: '',
    },
    location: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      default: '',
    },
    travelStyle: {
      type: String,
      default: '',
    },
    preferredBudget: {
      type: String,
      enum: ['low', 'medium', 'high', 'luxury', ''],
      default: '',
    },
    interests: {
      type: [String],
      default: [],
    },
    preferredCurrency: {
      type: String,
      enum: ['INR', 'USD', ''],
      default: 'INR',
    },
    preferredLanguage: {
      type: String,
      default: 'English',
    },
    travelers: {
      type: Number,
      default: 1,
    },
    profileComplete: {
      type: Boolean,
      default: false,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: {
      type: String,
      select: false,
    },
    emailVerificationExpires: {
      type: Date,
      select: false,
    },
    resetPasswordToken: {
      type: String,
      select: false,
    },
    resetPasswordExpires: {
      type: Date,
      select: false,
    },
    googleId: {
      type: String,
      select: false,
    },
    loginAttempts: {
      type: Number,
      default: 0,
      select: false,
    },
    lockedUntil: {
      type: Date,
      default: null,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.index({ googleId: 1 }, { unique: true, sparse: true });
userSchema.index({ resetPasswordToken: 1 }, { sparse: true });
userSchema.index({ emailVerificationToken: 1 }, { sparse: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.generateEmailVerificationToken = function () {
  const crypto = require('crypto');
  const token = crypto.randomBytes(32).toString('hex');
  this.emailVerificationToken = crypto.createHash('sha256').update(token).digest('hex');
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;
  return token;
};

userSchema.methods.isLocked = function () {
  if (!this.lockedUntil) return false;
  return Date.now() < this.lockedUntil.getTime();
};

userSchema.methods.incrementLoginAttempts = async function () {
  const MAX_ATTEMPTS = 5;
  this.loginAttempts = (this.loginAttempts || 0) + 1;
  if (this.loginAttempts >= MAX_ATTEMPTS) {
    this.lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15-minute lockout
  }
  await this.save({ validateBeforeSave: false });
};

userSchema.methods.resetLoginAttempts = async function () {
  this.loginAttempts = 0;
  this.lockedUntil = null;
  await this.save({ validateBeforeSave: false });
};

userSchema.methods.getResetPasswordToken = function () {
  const crypto = require('crypto');
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.resetPasswordExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

module.exports = mongoose.model('User', userSchema);