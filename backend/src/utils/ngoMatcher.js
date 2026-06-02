const { Donation } = require('../models/Donation');
const { User } = require('../models/User');
const { calculateDistanceKm } = require('./priorityEngine');

const getDistanceScore = (distanceKm) => {
  if (distanceKm === null) {
    return 5;
  }

  if (distanceKm < 2) {
    return 30;
  }

  if (distanceKm <= 5) {
    return 20;
  }

  if (distanceKm <= 10) {
    return 10;
  }

  return 5;
};

const getUrgencyScore = (donation) => {
  if (donation.priorityLevel === 'HIGH') {
    return 20;
  }

  if (donation.priorityLevel === 'MEDIUM') {
    return 12;
  }

  return 5;
};

const getCapacityScore = ({ activeDonationCount, ngoCapacity }) => {
  const capacity = Number(ngoCapacity) || 0;

  if (capacity <= 0) {
    return 5;
  }

  const loadRatio = activeDonationCount / capacity;

  if (loadRatio < 0.4) {
    return 20;
  }

  if (loadRatio < 0.75) {
    return 12;
  }

  return 5;
};

const getDeliveryFeasibilityScore = (ngo) => {
  const activeDeliveries = Number(ngo.activeDeliveriesCount) || 0;

  if (activeDeliveries <= 2) {
    return 10;
  }

  if (activeDeliveries <= 5) {
    return 6;
  }

  return 3;
};

const buildReasons = ({ categoryMatch, distanceKm, ngo, activeDonationCount }) => {
  const reasons = [];

  if (distanceKm !== null && distanceKm < 2) {
    reasons.push('Nearby location');
  } else if (distanceKm !== null) {
    reasons.push(`${distanceKm.toFixed(1)} km away`);
  } else {
    reasons.push('Distance unavailable');
  }

  if (categoryMatch) {
    reasons.push(`Supports ${String(ngo.acceptedCategories || []).includes('cooked_food') ? 'cooked food' : 'requested food type'}`);
  }

  if (activeDonationCount < (Number(ngo.ngoCapacity) || 0) / 2) {
    reasons.push('Lower active load');
  }

  if ((Number(ngo.activeDeliveriesCount) || 0) <= 2) {
    reasons.push('Faster delivery possible');
  }

  return reasons;
};

const scoreNgoForDonation = async (ngo, donation) => {
  const distanceKm = calculateDistanceKm({
    fromLatitude: ngo.ngoLatitude,
    fromLongitude: ngo.ngoLongitude,
    toLatitude: donation.latitude,
    toLongitude: donation.longitude,
  });
  const activeDonationCount = await Donation.countDocuments({
    acceptedByNgo: ngo._id,
    status: { $in: ['reserved', 'picked_up', 'in_transit'] },
  });
  const categoryMatch = (ngo.acceptedCategories || []).includes(donation.category);

  const distanceScore = getDistanceScore(distanceKm);
  const urgencyScore = getUrgencyScore(donation);
  const categoryScore = categoryMatch ? 25 : 0;
  const capacityScore = getCapacityScore({ activeDonationCount, ngoCapacity: ngo.ngoCapacity });
  const deliveryFeasibilityScore = getDeliveryFeasibilityScore(ngo);
  const score = distanceScore + urgencyScore + categoryScore + capacityScore + deliveryFeasibilityScore;
  const reasons = buildReasons({ activeDonationCount, categoryMatch, distanceKm, ngo });

  return {
    distanceKm,
    ngo,
    reason: reasons.join(', '),
    score,
  };
};

const getBestNgoForDonation = async (donation) => {
  const approvedNgos = await User.find({
    role: 'ngo',
    ngoApprovalStatus: 'approved',
  });

  if (!approvedNgos.length) {
    return {
      distanceKm: null,
      recommendedNgo: null,
      reason: 'No approved NGOs available',
      score: 0,
    };
  }

  const scoredNgos = await Promise.all(approvedNgos.map((ngo) => scoreNgoForDonation(ngo, donation)));
  scoredNgos.sort((a, b) => b.score - a.score);

  const bestMatch = scoredNgos[0];
  console.log('[ngo matcher] best match', {
    donationId: donation._id?.toString(),
    ngoId: bestMatch.ngo._id.toString(),
    reason: bestMatch.reason,
    score: bestMatch.score,
  });

  return {
    distanceKm: bestMatch.distanceKm,
    recommendedNgo: bestMatch.ngo,
    reason: bestMatch.reason,
    score: bestMatch.score,
  };
};

module.exports = {
  getBestNgoForDonation,
  scoreNgoForDonation,
};
