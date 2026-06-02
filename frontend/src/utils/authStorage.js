export const TOKEN_STORAGE_KEY = 'feedmap_token';
export const USER_STORAGE_KEY = 'feedmap_user';

const legacyTokenKeys = ['token', 'authToken', 'jwt'];

export const normalizeToken = (token) => {
  if (!token) {
    return '';
  }

  return token.replace(/^Bearer\s+/i, '').replace(/^"|"$/g, '').trim();
};

export const getStoredToken = () => {
  const primaryToken = normalizeToken(localStorage.getItem(TOKEN_STORAGE_KEY));

  if (primaryToken) {
    return primaryToken;
  }

  for (const key of legacyTokenKeys) {
    const token = normalizeToken(localStorage.getItem(key));

    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
      return token;
    }
  }

  return '';
};

export const storeAuthSession = ({ token, user }) => {
  const normalizedToken = normalizeToken(token);

  localStorage.setItem(TOKEN_STORAGE_KEY, normalizedToken);
  localStorage.setItem('token', normalizedToken);
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
};

export const clearAuthSession = () => {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(USER_STORAGE_KEY);

  for (const key of legacyTokenKeys) {
    localStorage.removeItem(key);
  }
};
