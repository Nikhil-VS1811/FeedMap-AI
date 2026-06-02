export const getExpiryLevel = (donation) => {
  if (donation.expiryLevel) {
    return donation.expiryLevel;
  }

  const remainingHours = (new Date(donation.expiryTime).getTime() - Date.now()) / (1000 * 60 * 60);

  if (remainingHours <= 0) {
    return 'GRAY';
  }

  if (remainingHours < 1) {
    return 'RED';
  }

  if (remainingHours <= 3) {
    return 'YELLOW';
  }

  return 'GREEN';
};

export const getRemainingMinutes = (donation) => {
  if (Number.isFinite(Number(donation.remainingMinutes))) {
    return Number(donation.remainingMinutes);
  }

  return Math.max(0, Math.ceil((new Date(donation.expiryTime).getTime() - Date.now()) / (1000 * 60)));
};

export const getRemainingTimeText = (donation) => {
  const level = getExpiryLevel(donation);
  const minutes = getRemainingMinutes(donation);

  if (level === 'GRAY' || minutes <= 0) {
    return 'Expired';
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours <= 0) {
    return `Expires in ${remainingMinutes}m`;
  }

  return `Expires in ${hours}h ${remainingMinutes}m`;
};

export const expiryRank = {
  RED: 0,
  YELLOW: 1,
  GREEN: 2,
  GRAY: 3,
};

export const sortByExpiryUrgency = (donations) =>
  [...donations].sort((a, b) => {
    const rankDifference = (expiryRank[getExpiryLevel(a)] ?? 4) - (expiryRank[getExpiryLevel(b)] ?? 4);

    if (rankDifference !== 0) {
      return rankDifference;
    }

    return (b.ngoMatchScore || b.priorityScore || 0) - (a.ngoMatchScore || a.priorityScore || 0);
  });
