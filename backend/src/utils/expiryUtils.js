const getExpiryInfo = (expiryTime) => {
  const expiryDate = new Date(expiryTime);
  const remainingMs = expiryDate.getTime() - Date.now();
  const remainingMinutes = Math.ceil(remainingMs / (1000 * 60));
  const remainingHours = remainingMs / (1000 * 60 * 60);

  if (remainingMs <= 0) {
    return {
      expiryLevel: 'GRAY',
      remainingHours: 0,
      remainingMinutes: 0,
    };
  }

  if (remainingHours < 1) {
    return {
      expiryLevel: 'RED',
      remainingHours,
      remainingMinutes,
    };
  }

  if (remainingHours <= 3) {
    return {
      expiryLevel: 'YELLOW',
      remainingHours,
      remainingMinutes,
    };
  }

  return {
    expiryLevel: 'GREEN',
    remainingHours,
    remainingMinutes,
  };
};

const getExpiryLevel = (expiryTime) => getExpiryInfo(expiryTime).expiryLevel;

module.exports = {
  getExpiryInfo,
  getExpiryLevel,
};
