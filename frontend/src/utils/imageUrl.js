const placeholderImage = '/food-placeholder.svg';
const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const serverBaseUrl = apiBaseUrl.replace(/\/api\/?$/, '');

export const resolveImageUrl = (image) => {
  if (!image) {
    return placeholderImage;
  }

  if (/^(blob:|data:|https?:\/\/)/i.test(image)) {
    return image;
  }

  return `${serverBaseUrl}${image.startsWith('/') ? '' : '/'}${image}`;
};

export { placeholderImage };
