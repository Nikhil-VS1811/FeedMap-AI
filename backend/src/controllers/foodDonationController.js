const { DONATION_STATUSES, FoodDonation } = require('../models/FoodDonation');
const asyncHandler = require('../utils/asyncHandler');

const createDonation = asyncHandler(async (req, res) => {
  const { title, quantity, expiryTime, category, pickupAddress, latitude, longitude, image = '' } = req.body;

  if (!title || !quantity || !expiryTime || !category || !pickupAddress || latitude === undefined || longitude === undefined) {
    res.status(400);
    throw new Error('Title, quantity, expiry time, category, pickup address, latitude, and longitude are required');
  }

  const donation = await FoodDonation.create({
    title,
    quantity,
    expiryTime,
    category,
    pickupAddress,
    latitude,
    longitude,
    image,
    donor: req.user._id,
  });

  const populatedDonation = await donation.populate('donor', 'name email role');

  res.status(201).json({
    success: true,
    donation: populatedDonation,
  });
});

const populateDonation = (query) =>
  query
    .populate('donor', 'name email role')
    .populate('acceptedByNgo', 'name email role ngoApprovalStatus')
    .populate('assignedDelivery', 'name email role');

const getDonorDonations = asyncHandler(async (req, res) => {
  const donations = await populateDonation(FoodDonation.find({ donor: req.user._id })).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: donations.length,
    donations,
  });
});

const getActiveDonations = asyncHandler(async (req, res) => {
  const donations = await populateDonation(FoodDonation.find({
    status: 'active',
    expiryTime: { $gt: new Date() },
  }))
    .select('title quantity expiryTime category pickupAddress latitude longitude image donor acceptedByNgo assignedDelivery status createdAt updatedAt')
    .sort({ expiryTime: 1 });

  res.status(200).json({
    success: true,
    count: donations.length,
    donations,
  });
});

const getAcceptedDonations = asyncHandler(async (req, res) => {
  const donations = await populateDonation(FoodDonation.find({ acceptedByNgo: req.user._id })).sort({ updatedAt: -1 });

  res.status(200).json({
    success: true,
    count: donations.length,
    donations,
  });
});

const getAssignedDeliveries = asyncHandler(async (req, res) => {
  const donations = await populateDonation(
    FoodDonation.find({
      status: { $in: ['reserved', 'picked_up', 'in_transit', 'delivered'] },
      acceptedByNgo: { $ne: null },
    })
  ).sort({ updatedAt: -1 });

  res.status(200).json({
    success: true,
    count: donations.length,
    donations,
  });
});

const getAllDonations = asyncHandler(async (req, res) => {
  const donations = await populateDonation(FoodDonation.find()).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: donations.length,
    donations,
  });
});

const acceptDonation = asyncHandler(async (req, res) => {
  if (req.user.ngoApprovalStatus !== 'approved') {
    res.status(403);
    throw new Error('NGO account must be approved before accepting donations');
  }

  const donation = await FoodDonation.findById(req.params.id);

  if (!donation) {
    res.status(404);
    throw new Error('Donation not found');
  }

  if (donation.status !== 'active') {
    res.status(409);
    throw new Error('Only active donations can be accepted');
  }

  donation.status = 'reserved';
  donation.acceptedByNgo = req.user._id;
  await donation.save();

  const populatedDonation = await populateDonation(FoodDonation.findById(donation._id));

  res.status(200).json({
    success: true,
    donation: populatedDonation,
  });
});

const updateDonationStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!DONATION_STATUSES.includes(status)) {
    res.status(400);
    throw new Error(`Status must be one of: ${DONATION_STATUSES.join(', ')}`);
  }

  const donation = await FoodDonation.findById(req.params.id);

  if (!donation) {
    res.status(404);
    throw new Error('Donation not found');
  }

  const isOwner = donation.donor.toString() === req.user._id.toString();
  const isAssignedDelivery = donation.assignedDelivery?.toString() === req.user._id.toString();
  const canDeliveryUpdate = req.user.role === 'delivery' && ['picked_up', 'in_transit', 'delivered'].includes(status);
  const canUpdate = isOwner || req.user.role === 'admin' || isAssignedDelivery || canDeliveryUpdate;

  if (!canUpdate) {
    res.status(403);
    throw new Error('Forbidden: you cannot update this donation');
  }

  donation.status = status;
  if (req.user.role === 'delivery' && !donation.assignedDelivery) {
    donation.assignedDelivery = req.user._id;
  }
  await donation.save();

  const populatedDonation = await populateDonation(FoodDonation.findById(donation._id));

  res.status(200).json({
    success: true,
    donation: populatedDonation,
  });
});

const removeDonation = asyncHandler(async (req, res) => {
  const donation = await FoodDonation.findById(req.params.id);

  if (!donation) {
    res.status(404);
    throw new Error('Donation not found');
  }

  await donation.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Donation removed successfully',
  });
});

module.exports = {
  acceptDonation,
  createDonation,
  getAcceptedDonations,
  getActiveDonations,
  getAllDonations,
  getAssignedDeliveries,
  getDonorDonations,
  removeDonation,
  updateDonationStatus,
};
