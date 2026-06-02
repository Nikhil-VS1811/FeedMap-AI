const mongoose = require('mongoose');

const { getExpiryInfo } = require('../utils/expiryUtils');
const { parseQuantityValue } = require('../utils/priorityEngine');

const DONATION_STATUSES = ['available', 'active', 'reserved', 'picked_up', 'in_transit', 'completed', 'delivered', 'expired', 'cancelled'];
const DONATION_CATEGORIES = ['cooked_food', 'raw_food', 'fruits_vegetables', 'grains', 'packaged_food', 'bakery', 'dairy', 'other'];

const donationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    quantity: {
      type: String,
      required: [true, 'Quantity is required'],
      trim: true,
      maxlength: [80, 'Quantity cannot exceed 80 characters'],
    },
    quantityValue: {
      type: Number,
      default: 0,
      index: true,
      min: [0, 'Quantity cannot be negative'],
    },
    category: {
      type: String,
      enum: DONATION_CATEGORIES,
      required: [true, 'Category is required'],
    },
    expiryTime: {
      type: Date,
      required: [true, 'Expiry time is required'],
    },
    pickupAddress: {
      type: String,
      required: [true, 'Pickup address is required'],
      trim: true,
      maxlength: [300, 'Pickup address cannot exceed 300 characters'],
    },
    latitude: {
      type: Number,
      required: [true, 'Latitude is required'],
      min: [-90, 'Latitude must be at least -90'],
      max: [90, 'Latitude cannot exceed 90'],
    },
    longitude: {
      type: Number,
      required: [true, 'Longitude is required'],
      min: [-180, 'Longitude must be at most 180'],
      max: [180, 'Longitude must be at most 180'],
    },
    image: {
      type: String,
      trim: true,
      default: '',
    },
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    acceptedByNgo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    assignedDelivery: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    status: {
      type: String,
      enum: DONATION_STATUSES,
      default: 'available',
      index: true,
    },
    priorityScore: {
      type: Number,
      default: 0,
      index: true,
    },
    priorityLevel: {
      type: String,
      enum: ['HIGH', 'MEDIUM', 'LOW'],
      default: 'LOW',
      index: true,
    },
    priorityInsights: {
      type: [String],
      default: [],
    },
    recommendedNgo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    recommendationReason: {
      type: String,
      default: '',
    },
    ngoMatchScore: {
      type: Number,
      default: 0,
      index: true,
    },
    recommendationDistanceKm: {
      type: Number,
      default: null,
    },
    reservedAt: {
      type: Date,
      default: null,
    },
    pickedUpAt: {
      type: Date,
      default: null,
    },
    transitStartedAt: {
      type: Date,
      default: null,
    },
    deliveredAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

donationSchema.virtual('expiryLevel').get(function expiryLevel() {
  return getExpiryInfo(this.expiryTime).expiryLevel;
});

donationSchema.virtual('remainingMinutes').get(function remainingMinutes() {
  return getExpiryInfo(this.expiryTime).remainingMinutes;
});

donationSchema.virtual('remainingHours').get(function remainingHours() {
  return getExpiryInfo(this.expiryTime).remainingHours;
});

donationSchema.pre('validate', function syncQuantityValue(next) {
  const parsedQuantity = parseQuantityValue(this.quantity);

  if (this.quantityValue !== parsedQuantity) {
    this.quantityValue = parsedQuantity;
  }

  next();
});

donationSchema.index({ status: 1, expiryTime: 1 });
donationSchema.index({ status: 1, priorityScore: -1, expiryTime: 1 });
donationSchema.index({ status: 1, quantityValue: -1 });
donationSchema.index({ recommendedNgo: 1, ngoMatchScore: -1 });

module.exports = {
  DONATION_CATEGORIES,
  DONATION_STATUSES,
  Donation: mongoose.model('Donation', donationSchema),
};
