const { Donation } = require('../models/Donation');
const { User } = require('../models/User');
const {
  buildCreatedAtMatch,
  buildMonthlyTrend,
  calculateAverageDeliveryMinutes,
  estimateMeals,
  estimateWastePreventedKg,
  groupCount,
} = require('../utils/analyticsUtils');
const asyncHandler = require('../utils/asyncHandler');

const cache = new Map();
const CACHE_TTL_MS = 30 * 1000;

const getCached = (key) => {
  const cached = cache.get(key);

  if (!cached || Date.now() - cached.createdAt > CACHE_TTL_MS) {
    return null;
  }

  return cached.data;
};

const setCached = (key, data) => {
  cache.set(key, { createdAt: Date.now(), data });
};

const getDashboardAnalytics = asyncHandler(async (req, res) => {
  const filter = req.query.filter || 'all';
  const cacheKey = `dashboard:${filter}`;
  const cached = getCached(cacheKey);

  if (cached) {
    console.log('[analytics] cache hit', { filter });
    return res.status(200).json(cached);
  }

  console.log('[analytics] dashboard query', { filter, user: req.user._id.toString() });

  const createdAtMatch = buildCreatedAtMatch(filter);
  const [donations, users] = await Promise.all([
    Donation.find(createdAtMatch)
      .populate('donor', 'name email role')
      .populate('acceptedByNgo', 'name email role')
      .populate('assignedDelivery', 'name email role')
      .populate('recommendedNgo', 'name email role')
      .sort({ createdAt: -1 }),
    User.find(),
  ]);

  const completedDonations = donations.filter((donation) => ['completed', 'delivered'].includes(donation.status));
  const assignedDonations = donations.filter((donation) => donation.assignedDelivery);
  const highPriorityDonations = donations.filter((donation) => donation.priorityLevel === 'HIGH');
  const activeNgos = new Set(donations.filter((donation) => donation.acceptedByNgo).map((donation) => donation.acceptedByNgo._id.toString()));
  const urgentDonations = donations.filter((donation) => donation.expiryLevel === 'RED' || donation.priorityLevel === 'HIGH');
  const deliverySuccessRate = assignedDonations.length
    ? Math.round((completedDonations.length / assignedDonations.length) * 100)
    : 0;
  const recommendationMatched = donations.filter(
    (donation) =>
      donation.acceptedByNgo &&
      donation.recommendedNgo &&
      donation.acceptedByNgo._id.toString() === donation.recommendedNgo._id.toString()
  ).length;
  const acceptedDonations = donations.filter((donation) => donation.acceptedByNgo).length;
  const recommendationEfficiency = acceptedDonations ? Math.round((recommendationMatched / acceptedDonations) * 100) : 0;

  const ngoActivityMap = donations.reduce((acc, donation) => {
    const ngo = donation.acceptedByNgo;

    if (!ngo) {
      return acc;
    }

    const key = ngo._id.toString();
    acc[key] = acc[key] || {
      activeRequests: 0,
      deliveriesCompleted: 0,
      donationsHandled: 0,
      name: ngo.name,
    };
    acc[key].donationsHandled += 1;

    if (donation.status === 'reserved') {
      acc[key].activeRequests += 1;
    }

    if (['completed', 'delivered'].includes(donation.status)) {
      acc[key].deliveriesCompleted += 1;
    }

    return acc;
  }, {});

  const recentActivity = donations.slice(0, 8).map((donation) => ({
    id: donation._id,
    message:
      donation.status === 'reserved'
        ? 'Donation accepted'
        : ['completed', 'delivered'].includes(donation.status)
          ? 'Delivery completed'
          : donation.priorityLevel === 'HIGH'
            ? 'High priority alert'
            : donation.assignedDelivery
              ? 'Delivery assigned'
              : 'Donation created',
    status: donation.status,
    title: donation.title,
    timestamp: donation.updatedAt,
  }));

  const data = {
    success: true,
    filter,
    metrics: {
      activeDeliveries: donations.filter((donation) => ['picked_up', 'in_transit', 'delivered'].includes(donation.status)).length,
      averageDeliveryTime: calculateAverageDeliveryMinutes(donations),
      deliverySuccessRate,
      highPriorityDonations: highPriorityDonations.length,
      mealsDistributed: estimateMeals(completedDonations),
      ngosActive: activeNgos.size,
      recommendationEfficiency,
      totalFoodSaved: Math.round(estimateWastePreventedKg(completedDonations)),
      urgentDonations: urgentDonations.length,
      wastePreventedKg: Math.round(estimateWastePreventedKg(completedDonations)),
    },
    charts: {
      categoryDistribution: groupCount(donations, 'category'),
      deliveryCompletion: groupCount(donations, 'status'),
      expiryStatistics: groupCount(donations, 'expiryLevel'),
      monthlyTrend: buildMonthlyTrend(donations),
      ngoActivity: Object.values(ngoActivityMap),
      priorityDistribution: groupCount(donations, 'priorityLevel'),
    },
    overview: [
      `${estimateMeals(completedDonations)} meals distributed`,
      `${highPriorityDonations.length} high priority donations active`,
      `${activeNgos.size} NGOs currently active`,
    ],
    recentActivity,
    systemHealth: {
      approvedNgos: users.filter((user) => user.role === 'ngo' && user.ngoApprovalStatus === 'approved').length,
      deliveryUsers: users.filter((user) => user.role === 'delivery').length,
      pendingNgos: users.filter((user) => user.role === 'ngo' && user.ngoApprovalStatus === 'pending').length,
      totalUsers: users.length,
    },
  };

  setCached(cacheKey, data);
  res.status(200).json(data);
});

module.exports = {
  getDashboardAnalytics,
};
