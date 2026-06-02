export const defaultDonationFilters = {
  category: '',
  expiryLevel: '',
  priorityLevel: '',
  quantityMax: '',
  quantityMin: '',
  search: '',
  sortBy: 'highest_priority',
};

export const categoryOptions = [
  { label: 'All categories', value: '' },
  { label: 'Cooked Food', value: 'cooked_food' },
  { label: 'Packaged Food', value: 'packaged_food' },
  { label: 'Raw Food', value: 'raw_food' },
];

export const priorityOptions = [
  { label: 'All priorities', value: '' },
  { label: 'High', value: 'HIGH' },
  { label: 'Medium', value: 'MEDIUM' },
  { label: 'Low', value: 'LOW' },
];

export const expiryOptions = [
  { label: 'All expiry levels', value: '' },
  { label: 'Fresh', value: 'fresh' },
  { label: 'Expiring Soon', value: 'expiring_soon' },
  { label: 'Critical', value: 'critical' },
];

export const sortOptions = [
  { label: 'Highest Priority', value: 'highest_priority' },
  { label: 'Nearest Expiry', value: 'nearest_expiry' },
  { label: 'Highest Quantity', value: 'quantity_desc' },
  { label: 'Lowest Quantity', value: 'quantity_asc' },
  { label: 'Newest', value: 'newest' },
];
