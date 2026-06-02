const mongoose = require('mongoose');

const DONATION_STATUSES = ['active', 'reserved', 'picked_up', 'in_transit', 'delivered', 'expired', 'cancelled'];
const DONATION_CATEGORIES = ['cooked_food', 'fruits_vegetables', 'grains', 'packaged_food', 'bakery', 'dairy', 'other'];

const foodDonationSchema = new mongoose.Schema(
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
    expiryTime: {
      type: Date,
      required: [true, 'Expiry time is required'],
    },
    category: {
      type: String,
      enum: DONATION_CATEGORIES,
      required: [true, 'Category is required'],
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
      min: [-180, 'Longitude must be at least -180'],
      max: [180, 'Longitude cannot exceed 180'],
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
      default: 'active',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

foodDonationSchema.index({ status: 1, expiryTime: 1 });

module.exports = {
  DONATION_CATEGORIES,
  DONATION_STATUSES,
  FoodDonation: mongoose.model('FoodDonation', foodDonationSchema),
};
