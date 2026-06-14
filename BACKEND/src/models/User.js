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
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: 6,
      select: false, // Don't return password by default
    },
    avatar: {
      type: String,
      default: '',
    },
    phone: {
      type: String,
      default: '',
    },
    firstName: {
      type: String,
      default: '',
    },
    lastName: {
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
    preferences: {
      type: [String],
      default: [],
    },
    preferredCurrency: {
      type: String,
      enum: ['INR', 'USD', ''],
      default: 'INR',
    },
    currency: {
      type: String,
      enum: ['INR', 'USD', ''],
      default: 'INR',
    },
    preferredLanguage: {
      type: String,
      default: 'English',
    },
    language: {
      type: String,
      default: 'English',
    },
    savedTravelersCount: {
      type: Number,
      default: 1,
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
    emailVerificationCode: {
      type: String,
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
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
