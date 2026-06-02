const getDateRange = (filter = 'all') => {
  const now = new Date();
  const start = new Date(now);

  if (filter === 'today') {
    start.setHours(0, 0, 0, 0);
    return { start, end: now };
  }

  if (filter === 'weekly') {
    start.setDate(now.getDate() - 7);
    return { start, end: now };
  }

  if (filter === 'monthly') {
    start.setMonth(now.getMonth() - 1);
    return { start, end: now };
  }

  return { start: null, end: now };
};

const buildCreatedAtMatch = (filter) => {
  const { start, end } = getDateRange(filter);

  if (!start) {
    return {};
  }

  return {
    createdAt: {
      $gte: start,
      $lte: end,
    },
  };
};

const parseQuantityValue = (quantity) => {
  const match = String(quantity || '').match(/\d+(\.\d+)?/);
  return match ? Number(match[0]) : 0;
};

const estimateMeals = (donations) =>
  donations.reduce((total, donation) => total + Math.round(parseQuantityValue(donation.quantity) || 0), 0);

const estimateWastePreventedKg = (donations) =>
  donations.reduce((total, donation) => total + (parseQuantityValue(donation.quantity) || 0) * 0.45, 0);

const calculateAverageDeliveryMinutes = (donations) => {
  const completedDurations = donations
    .filter((donation) => donation.pickedUpAt && (donation.completedAt || donation.deliveredAt))
    .map((donation) => {
      const end = new Date(donation.completedAt || donation.deliveredAt).getTime();
      const start = new Date(donation.pickedUpAt).getTime();
      return Math.max(0, (end - start) / (1000 * 60));
    });

  if (!completedDurations.length) {
    return 0;
  }

  return Math.round(completedDurations.reduce((sum, duration) => sum + duration, 0) / completedDurations.length);
};

const groupCount = (items, key, fallback = 'unknown') =>
  Object.values(
    items.reduce((acc, item) => {
      const value = item[key] || fallback;
      acc[value] = acc[value] || { name: value, value: 0 };
      acc[value].value += 1;
      return acc;
    }, {})
  );

const getMonthLabel = (date) => new Date(date).toLocaleString('en-US', { month: 'short', year: '2-digit' });

const buildMonthlyTrend = (donations) => {
  const grouped = donations.reduce((acc, donation) => {
    const label = getMonthLabel(donation.createdAt);
    acc[label] = acc[label] || { donations: 0, month: label };
    acc[label].donations += 1;
    return acc;
  }, {});

  return Object.values(grouped);
};

module.exports = {
  buildCreatedAtMatch,
  buildMonthlyTrend,
  calculateAverageDeliveryMinutes,
  estimateMeals,
  estimateWastePreventedKg,
  getDateRange,
  groupCount,
};
