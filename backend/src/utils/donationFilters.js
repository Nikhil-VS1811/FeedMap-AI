const { DONATION_CATEGORIES } = require('../models/Donation');
const { parseQuantityValue } = require('./priorityEngine');

const EXPIRY_LEVELS = {
  critical: 'RED',
  expiring_soon: 'YELLOW',
  fresh: 'GREEN',
  green: 'GREEN',
  red: 'RED',
  yellow: 'YELLOW',
};
const PRIORITY_LEVELS = new Set(['HIGH', 'MEDIUM', 'LOW']);
const SORT_OPTIONS = new Set(['highest_priority', 'nearest_expiry', 'newest', 'quantity_asc', 'quantity_desc']);
const SUPPORTED_QUERY_PARAMETERS = new Set([
  'category',
  'expiryLevel',
  'latitude',
  'longitude',
  'priorityLevel',
  'quantityMax',
  'quantityMin',
  'search',
  'sortBy',
]);

const failValidation = (message) => {
  const error = new Error(message);
  error.statusCode = 400;
  throw error;
};

const parseOptionalNumber = (value, label) => {
  if (value === undefined || value === '') {
    return undefined;
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed < 0) {
    failValidation(`${label} must be a non-negative number`);
  }

  return parsed;
};

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const parseAvailableDonationQuery = (query) => {
  const unsupportedParameters = Object.keys(query).filter((parameter) => !SUPPORTED_QUERY_PARAMETERS.has(parameter));

  if (unsupportedParameters.length) {
    failValidation(`Unsupported query parameter: ${unsupportedParameters.join(', ')}`);
  }

  const category = query.category || undefined;
  const priorityLevel = query.priorityLevel ? String(query.priorityLevel).toUpperCase() : undefined;
  const expiryLevel = query.expiryLevel ? EXPIRY_LEVELS[String(query.expiryLevel).toLowerCase()] : undefined;
  const quantityMin = parseOptionalNumber(query.quantityMin, 'quantityMin');
  const quantityMax = parseOptionalNumber(query.quantityMax, 'quantityMax');
  const search = String(query.search || '').trim().slice(0, 80);
  const requestedSort = query.sortBy || 'highest_priority';
  const sortBy = requestedSort === 'quantity' ? 'quantity_desc' : requestedSort;

  if (category && !DONATION_CATEGORIES.includes(category)) {
    failValidation(`category must be one of: ${DONATION_CATEGORIES.join(', ')}`);
  }

  if (priorityLevel && !PRIORITY_LEVELS.has(priorityLevel)) {
    failValidation('priorityLevel must be one of: HIGH, MEDIUM, LOW');
  }

  if (query.expiryLevel && !expiryLevel) {
    failValidation('expiryLevel must be one of: fresh, expiring_soon, critical');
  }

  if (!SORT_OPTIONS.has(sortBy)) {
    failValidation(`sortBy must be one of: ${[...SORT_OPTIONS].join(', ')}`);
  }

  if (quantityMin !== undefined && quantityMax !== undefined && quantityMin > quantityMax) {
    failValidation('quantityMin cannot be greater than quantityMax');
  }

  return {
    category,
    expiryLevel,
    priorityLevel,
    quantityMax,
    quantityMin,
    search,
    sortBy,
  };
};

const buildAvailableDonationFilter = (filters, now = new Date()) => {
  const query = {
    expiryTime: { $gt: now },
    latitude: { $ne: null },
    longitude: { $ne: null },
    status: { $in: ['available', 'active'] },
  };
  const andConditions = [];

  if (filters.category) {
    query.category = filters.category;
  }

  if (filters.expiryLevel === 'RED') {
    query.expiryTime = { $gt: now, $lt: new Date(now.getTime() + 60 * 60 * 1000) };
  }

  if (filters.expiryLevel === 'YELLOW') {
    query.expiryTime = {
      $gte: new Date(now.getTime() + 60 * 60 * 1000),
      $lte: new Date(now.getTime() + 3 * 60 * 60 * 1000),
    };
  }

  if (filters.expiryLevel === 'GREEN') {
    query.expiryTime = { $gt: new Date(now.getTime() + 3 * 60 * 60 * 1000) };
  }

  if (filters.quantityMin !== undefined || filters.quantityMax !== undefined) {
    const quantityRange = {};

    if (filters.quantityMin !== undefined) {
      quantityRange.$gte = filters.quantityMin;
    }

    if (filters.quantityMax !== undefined) {
      quantityRange.$lte = filters.quantityMax;
    }

    andConditions.push({
      $or: [{ quantityValue: quantityRange }, { quantityValue: { $exists: false } }],
    });
  }

  if (filters.search) {
    const searchExpression = new RegExp(escapeRegex(filters.search), 'i');
    const categoryExpression = new RegExp(escapeRegex(filters.search.replace(/\s+/g, '_')), 'i');
    andConditions.push({
      $or: [{ title: searchExpression }, { category: categoryExpression }],
    });
  }

  if (andConditions.length) {
    query.$and = andConditions;
  }

  return query;
};

const filterAndSortDonations = (donations, filters) => {
  const filteredDonations = donations.filter((donation) => {
    const quantity = Number.isFinite(donation.quantityValue) ? donation.quantityValue : parseQuantityValue(donation.quantity);

    if (filters.priorityLevel && donation.priorityLevel !== filters.priorityLevel) {
      return false;
    }

    if (filters.quantityMin !== undefined && quantity < filters.quantityMin) {
      return false;
    }

    return filters.quantityMax === undefined || quantity <= filters.quantityMax;
  });

  return filteredDonations.sort((a, b) => {
    if (filters.sortBy === 'nearest_expiry') {
      return new Date(a.expiryTime).getTime() - new Date(b.expiryTime).getTime();
    }

    if (filters.sortBy === 'newest') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }

    if (filters.sortBy === 'quantity_asc' || filters.sortBy === 'quantity_desc') {
      const direction = filters.sortBy === 'quantity_asc' ? 1 : -1;
      return direction * (parseQuantityValue(a.quantity) - parseQuantityValue(b.quantity));
    }

    if (b.priorityScore !== a.priorityScore) {
      return b.priorityScore - a.priorityScore;
    }

    return new Date(a.expiryTime).getTime() - new Date(b.expiryTime).getTime();
  });
};

module.exports = {
  buildAvailableDonationFilter,
  filterAndSortDonations,
  parseAvailableDonationQuery,
};
