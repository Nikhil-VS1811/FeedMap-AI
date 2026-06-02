const { DONATION_STATUSES, Donation } = require('../models/Donation');
const { User } = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { buildAvailableDonationFilter, filterAndSortDonations, parseAvailableDonationQuery } = require('../utils/donationFilters');
const { getBestNgoForDonation } = require('../utils/ngoMatcher');
const { calculatePriority } = require('../utils/priorityEngine');

const populateDonation = (query) =>
  query
    .populate('donor', 'name email role')
    .populate('acceptedByNgo', 'name email role ngoApprovalStatus')
    .populate('assignedDelivery', 'name email role')
    .populate('recommendedNgo', 'name email role ngoCapacity acceptedCategories ngoLatitude ngoLongitude activeDeliveriesCount');

const getNgoLocationFromQuery = (req) => {
  const latitude = Number(req.query.latitude);
  const longitude = Number(req.query.longitude);

  if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
    return { latitude, longitude };
  }

  return {};
};

const applyPriorityToDonation = async (donation, ngoLocation = {}) => {
  const priority = calculatePriority(donation, ngoLocation);
  donation.priorityScore = priority.priorityScore;
  donation.priorityLevel = priority.priorityLevel;
  donation.priorityInsights = priority.priorityInsights;
  console.log('[priority] calculated', {
    donationId: donation._id?.toString(),
    priorityLevel: priority.priorityLevel,
    priorityScore: priority.priorityScore,
  });
  return donation;
};

const applyRecommendationToDonation = async (donation) => {
  const recommendation = await getBestNgoForDonation(donation);
  donation.recommendedNgo = recommendation.recommendedNgo?._id || null;
  donation.recommendationReason = recommendation.reason;
  donation.ngoMatchScore = recommendation.score;
  donation.recommendationDistanceKm = recommendation.distanceKm;
  console.log('[recommendation] calculated', {
    donationId: donation._id?.toString(),
    recommendedNgo: donation.recommendedNgo?.toString(),
    score: donation.ngoMatchScore,
  });
  return donation;
};

const setStatusTimestamp = (donation, status) => {
  const now = new Date();

  if (status === 'reserved' && !donation.reservedAt) {
    donation.reservedAt = now;
  }

  if (status === 'picked_up' && !donation.pickedUpAt) {
    donation.pickedUpAt = now;
  }

  if (status === 'in_transit' && !donation.transitStartedAt) {
    donation.transitStartedAt = now;
  }

  if (status === 'delivered' && !donation.deliveredAt) {
    donation.deliveredAt = now;
  }

  if (status === 'completed' && !donation.completedAt) {
    donation.completedAt = now;
  }
};

const recalculateAndSaveDonations = async (donations, ngoLocation = {}) => {
  await Promise.all(
    donations.map(async (donation) => {
      await applyPriorityToDonation(donation, ngoLocation);
      await applyRecommendationToDonation(donation);
      await donation.save();
      await donation.populate('recommendedNgo', 'name email role ngoCapacity acceptedCategories ngoLatitude ngoLongitude activeDeliveriesCount');
    })
  );

  return donations.sort((a, b) => {
    const expiryRank = { RED: 0, YELLOW: 1, GREEN: 2, GRAY: 3 };
    const aRank = expiryRank[a.expiryLevel] ?? 4;
    const bRank = expiryRank[b.expiryLevel] ?? 4;

    if (aRank !== bRank) {
      return aRank - bRank;
    }

    if ((b.ngoMatchScore || 0) !== (a.ngoMatchScore || 0)) {
      return (b.ngoMatchScore || 0) - (a.ngoMatchScore || 0);
    }

    if (b.priorityScore !== a.priorityScore) {
      return b.priorityScore - a.priorityScore;
    }

    return new Date(a.expiryTime).getTime() - new Date(b.expiryTime).getTime();
  });
};

const createDonation = asyncHandler(async (req, res) => {
  console.log('[donations] createDonation', { donor: req.user._id.toString(), body: req.body });

  const { title, quantity, category, expiryTime, pickupAddress, latitude, longitude, image = '' } = req.body;

  if (!title || !quantity || !category || !expiryTime || !pickupAddress || latitude === undefined || longitude === undefined) {
    res.status(400);
    throw new Error('Title, quantity, category, expiry time, pickup address, latitude, and longitude are required');
  }

  const donation = new Donation({
    title,
    quantity,
    category,
    expiryTime,
    pickupAddress,
    latitude,
    longitude,
    image: typeof image === 'string' ? image : '',
    donor: req.user._id,
    status: 'available',
  });

  await applyPriorityToDonation(donation);
  await applyRecommendationToDonation(donation);
  await donation.save();

  const populatedDonation = await populateDonation(Donation.findById(donation._id));

  res.status(201).json({
    success: true,
    donation: populatedDonation,
  });
});

const getAllDonations = asyncHandler(async (req, res) => {
  console.log('[donations] getAllDonations', { user: req.user._id.toString(), role: req.user.role });

  let donations = await populateDonation(Donation.find()).sort({ createdAt: -1 });
  await Promise.all(
    donations.map(async (donation) => {
      await applyPriorityToDonation(donation);
      await applyRecommendationToDonation(donation);
      await donation.save();
    })
  );
  donations = await populateDonation(Donation.find()).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: donations.length,
    donations,
  });
});

const getAvailableDonations = asyncHandler(async (req, res) => {
  const filters = parseAvailableDonationQuery(req.query);
  console.log('[donations] getAvailableDonations', {
    filters,
    role: req.user.role,
    user: req.user._id.toString(),
  });

  const donations = filterAndSortDonations(
    await recalculateAndSaveDonations(
      await populateDonation(Donation.find(buildAvailableDonationFilter(filters))),
      getNgoLocationFromQuery(req)
    ),
    filters
  );

  res.status(200).json({
    success: true,
    count: donations.length,
    donations,
  });
});

const getPrioritizedDonations = asyncHandler(async (req, res) => {
  console.log('[donations] getPrioritizedDonations', {
    role: req.user.role,
    user: req.user._id.toString(),
    query: req.query,
  });

  const donations = await recalculateAndSaveDonations(await populateDonation(
    Donation.find({
      status: { $in: ['available', 'active'] },
      expiryTime: { $gt: new Date() },
      latitude: { $ne: null },
      longitude: { $ne: null },
    })
  ), getNgoLocationFromQuery(req));

  res.status(200).json({
    success: true,
    count: donations.length,
    donations,
  });
});

const getNearbyDonations = asyncHandler(async (req, res) => {
  const latitude = Number(req.query.latitude);
  const longitude = Number(req.query.longitude);
  console.log('[donations] getNearbyDonations', { latitude, longitude, user: req.user._id.toString() });

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    res.status(400);
    throw new Error('latitude and longitude query parameters are required');
  }

  const donations = await recalculateAndSaveDonations(await populateDonation(
    Donation.find({
      status: { $in: ['available', 'active'] },
      expiryTime: { $gt: new Date() },
      latitude: { $ne: null },
      longitude: { $ne: null },
    })
  ), { latitude, longitude });

  const withDistance = donations
    .map((donation) => {
      const latDiff = Number(donation.latitude) - latitude;
      const lngDiff = Number(donation.longitude) - longitude;
      return {
        donation,
        distanceScore: latDiff * latDiff + lngDiff * lngDiff,
      };
    })
    .sort((a, b) => a.distanceScore - b.distanceScore)
    .map((item) => item.donation);

  res.status(200).json({
    success: true,
    count: withDistance.length,
    donations: withDistance,
  });
});

const getDonationRecommendation = asyncHandler(async (req, res) => {
  console.log('[donations] getDonationRecommendation', { donationId: req.params.id, user: req.user._id.toString() });

  const donation = await Donation.findById(req.params.id);

  if (!donation) {
    res.status(404);
    throw new Error('Donation not found');
  }

  await applyPriorityToDonation(donation);
  await applyRecommendationToDonation(donation);
  await donation.save();

  const populatedDonation = await populateDonation(Donation.findById(donation._id));

  res.status(200).json({
    success: true,
    distance:
      populatedDonation.recommendationDistanceKm === null || populatedDonation.recommendationDistanceKm === undefined
        ? null
        : `${populatedDonation.recommendationDistanceKm.toFixed(1)} km`,
    recommendedNgo: populatedDonation.recommendedNgo,
    reason: populatedDonation.recommendationReason,
    score: populatedDonation.ngoMatchScore,
  });
});

const getDonorDonations = asyncHandler(async (req, res) => {
  console.log('[donations] getDonorDonations', { donor: req.user._id.toString() });

  const donations = await populateDonation(Donation.find({ donor: req.user._id })).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: donations.length,
    donations,
  });
});

const getAcceptedDonations = asyncHandler(async (req, res) => {
  console.log('[donations] getAcceptedDonations', { ngo: req.user._id.toString() });

  const donations = await populateDonation(Donation.find({ acceptedByNgo: req.user._id })).sort({ updatedAt: -1 });

  res.status(200).json({
    success: true,
    count: donations.length,
    donations,
  });
});

const getAssignedDeliveries = asyncHandler(async (req, res) => {
  console.log('[donations] getAssignedDeliveries', { delivery: req.user._id.toString() });

  const donations = await populateDonation(
    Donation.find({
      status: { $in: ['reserved', 'picked_up', 'in_transit', 'completed', 'delivered'] },
      assignedDelivery: req.user._id,
    })
  ).sort({ updatedAt: -1 });

  res.status(200).json({
    success: true,
    count: donations.length,
    donations,
  });
});

const assignDelivery = asyncHandler(async (req, res) => {
  const { deliveryId } = req.body;
  console.log('[donations] assignDelivery', { admin: req.user._id.toString(), deliveryId, donationId: req.params.id });

  if (!deliveryId) {
    res.status(400);
    throw new Error('deliveryId is required');
  }

  const [donation, deliveryUser] = await Promise.all([
    Donation.findById(req.params.id),
    User.findById(deliveryId),
  ]);

  if (!donation) {
    res.status(404);
    throw new Error('Donation not found');
  }

  if (!deliveryUser || deliveryUser.role !== 'delivery') {
    res.status(400);
    throw new Error('deliveryId must belong to a delivery user');
  }

  if (donation.assignedDelivery) {
    res.status(409);
    throw new Error('Donation already has an assigned delivery partner');
  }

  if (['completed', 'delivered'].includes(donation.status)) {
    res.status(409);
    throw new Error('Completed donations cannot be assigned');
  }

  if (donation.status !== 'reserved') {
    res.status(409);
    throw new Error('Only reserved donations can be assigned');
  }

  donation.assignedDelivery = deliveryId;
  setStatusTimestamp(donation, 'reserved');
  await applyPriorityToDonation(donation);
  await applyRecommendationToDonation(donation);
  await donation.save();

  const populatedDonation = await populateDonation(Donation.findById(donation._id));

  res.status(200).json({
    success: true,
    donation: populatedDonation,
  });
});

const acceptDonation = asyncHandler(async (req, res) => {
  console.log('[donations] acceptDonation', { donationId: req.params.id, ngo: req.user._id.toString() });

  if (req.user.ngoApprovalStatus !== 'approved') {
    res.status(403);
    throw new Error('NGO account must be approved before accepting donations');
  }

  const donation = await Donation.findById(req.params.id);

  if (!donation) {
    res.status(404);
    throw new Error('Donation not found');
  }

  if (!['available', 'active'].includes(donation.status)) {
    res.status(409);
    throw new Error('Only available donations can be accepted');
  }

  donation.status = 'reserved';
  donation.acceptedByNgo = req.user._id;
  setStatusTimestamp(donation, 'reserved');
  await applyPriorityToDonation(donation);
  await applyRecommendationToDonation(donation);
  await donation.save();

  const populatedDonation = await populateDonation(Donation.findById(donation._id));

  res.status(200).json({
    success: true,
    donation: populatedDonation,
  });
});

const rejectDonation = asyncHandler(async (req, res) => {
  console.log('[donations] rejectDonation', { donationId: req.params.id, ngo: req.user._id.toString() });

  const donation = await Donation.findById(req.params.id);

  if (!donation) {
    res.status(404);
    throw new Error('Donation not found');
  }

  if (!donation.acceptedByNgo || donation.acceptedByNgo.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('You can reject only donations accepted by your NGO');
  }

  if (['completed', 'delivered'].includes(donation.status)) {
    res.status(409);
    throw new Error('Completed donations cannot be rejected');
  }

  donation.status = 'available';
  donation.acceptedByNgo = null;
  donation.assignedDelivery = null;
  donation.reservedAt = null;
  donation.pickedUpAt = null;
  donation.transitStartedAt = null;
  donation.deliveredAt = null;
  donation.completedAt = null;
  await applyPriorityToDonation(donation);
  await applyRecommendationToDonation(donation);
  await donation.save();

  const populatedDonation = await populateDonation(Donation.findById(donation._id));

  res.status(200).json({
    success: true,
    donation: populatedDonation,
  });
});

const updateDonationStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  console.log('[donations] updateDonationStatus', { donationId: req.params.id, status, user: req.user._id.toString(), role: req.user.role });

  if (!DONATION_STATUSES.includes(status)) {
    res.status(400);
    throw new Error(`Status must be one of: ${DONATION_STATUSES.join(', ')}`);
  }

  const donation = await Donation.findById(req.params.id);

  if (!donation) {
    res.status(404);
    throw new Error('Donation not found');
  }

  const validTransitions = {
    delivered: ['completed'],
    in_transit: ['delivered'],
    picked_up: ['in_transit'],
    reserved: ['picked_up'],
  };
  const isAssignedDelivery = donation.assignedDelivery?.toString() === req.user._id.toString();
  const canDeliveryUpdate = req.user.role === 'delivery' && ['picked_up', 'in_transit', 'delivered', 'completed'].includes(status);
  const canAdminUpdate = req.user.role === 'admin';
  const canUpdate = canAdminUpdate || (isAssignedDelivery && canDeliveryUpdate);

  if (!canUpdate) {
    res.status(403);
    throw new Error('Forbidden: insufficient permissions to update donation status');
  }

  if (req.user.role === 'delivery') {
    if (!isAssignedDelivery) {
      res.status(403);
      throw new Error('You can update only deliveries assigned to you');
    }

    if (!validTransitions[donation.status]?.includes(status)) {
      res.status(409);
      throw new Error(`Cannot change delivery from ${donation.status} to ${status}`);
    }
  }

  if (req.user.role === 'admin' && validTransitions[donation.status] && !validTransitions[donation.status].includes(status)) {
    res.status(409);
    throw new Error(`Cannot change delivery from ${donation.status} to ${status}`);
  }

  donation.status = status;
  setStatusTimestamp(donation, status);
  await applyPriorityToDonation(donation);
  await applyRecommendationToDonation(donation);

  await donation.save();

  const populatedDonation = await populateDonation(Donation.findById(donation._id));

  res.status(200).json({
    success: true,
    donation: populatedDonation,
  });
});

const removeDonation = asyncHandler(async (req, res) => {
  console.log('[donations] removeDonation', { donationId: req.params.id, admin: req.user._id.toString() });

  const donation = await Donation.findById(req.params.id);

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
  getAllDonations,
  getAssignedDeliveries,
  getAvailableDonations,
  getDonationRecommendation,
  getDonorDonations,
  getNearbyDonations,
  getPrioritizedDonations,
  assignDelivery,
  rejectDonation,
  removeDonation,
  updateDonationStatus,
};
