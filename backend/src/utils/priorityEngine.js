const EARTH_RADIUS_KM = 6371;

const parseQuantityValue = (quantity) => {
  const match = String(quantity || '').match(/\d+(\.\d+)?/);
  return match ? Number(match[0]) : 0;
};

const toRadians = (degrees) => (degrees * Math.PI) / 180;

const calculateDistanceKm = ({ fromLatitude, fromLongitude, toLatitude, toLongitude }) => {
  const lat1 = Number(fromLatitude);
  const lon1 = Number(fromLongitude);
  const lat2 = Number(toLatitude);
  const lon2 = Number(toLongitude);

  if (![lat1, lon1, lat2, lon2].every(Number.isFinite)) {
    return null;
  }

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const getPriorityLevel = (score) => {
  if (score >= 80) {
    return 'HIGH';
  }

  if (score >= 50) {
    return 'MEDIUM';
  }

  return 'LOW';
};

const calculatePriority = (donation, ngoLocation = {}) => {
  const insights = [];
  let priorityScore = 0;

  const expiryMs = new Date(donation.expiryTime).getTime() - Date.now();
  const hoursRemaining = expiryMs / (1000 * 60 * 60);

  if (hoursRemaining < 1) {
    priorityScore += 50;
    insights.push(`Expires in ${Math.max(0, Math.round(hoursRemaining * 60))} minutes`);
  } else if (hoursRemaining <= 3) {
    priorityScore += 30;
    insights.push(`Expires in ${hoursRemaining.toFixed(1)} hours`);
  } else {
    priorityScore += 10;
    insights.push(`Expires in ${hoursRemaining.toFixed(1)} hours`);
  }

  const quantity = parseQuantityValue(donation.quantity);

  if (quantity > 50) {
    priorityScore += 20;
    insights.push('Large quantity donation');
  } else if (quantity >= 20) {
    priorityScore += 10;
    insights.push('Medium quantity donation');
  } else {
    priorityScore += 5;
    insights.push('Small quantity donation');
  }

  if (donation.category === 'cooked_food') {
    priorityScore += 20;
    insights.push('Cooked food needs faster rescue');
  } else if (donation.category === 'packaged_food') {
    priorityScore += 10;
    insights.push('Packaged food has moderate urgency');
  } else if (donation.category === 'raw_food') {
    priorityScore += 5;
    insights.push('Raw food has lower urgency');
  }

  const distanceKm = calculateDistanceKm({
    fromLatitude: ngoLocation.latitude,
    fromLongitude: ngoLocation.longitude,
    toLatitude: donation.latitude,
    toLongitude: donation.longitude,
  });

  if (distanceKm === null) {
    priorityScore += 5;
    insights.push('Distance unknown');
  } else if (distanceKm < 2) {
    priorityScore += 20;
    insights.push('Nearby NGO detected');
  } else if (distanceKm <= 5) {
    priorityScore += 10;
    insights.push(`${distanceKm.toFixed(1)} km from NGO`);
  } else {
    priorityScore += 5;
    insights.push(`${distanceKm.toFixed(1)} km from NGO`);
  }

  return {
    priorityInsights: insights,
    priorityLevel: getPriorityLevel(priorityScore),
    priorityScore,
  };
};

module.exports = {
  calculateDistanceKm,
  calculatePriority,
  getPriorityLevel,
  parseQuantityValue,
};
