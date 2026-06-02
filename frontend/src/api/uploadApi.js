import api from './axios';

export const uploadDonationImage = (file, onProgress) => {
  const formData = new window.FormData();
  formData.append('image', file);

  return api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (event) => {
      const progress = event.total ? Math.round((event.loaded * 100) / event.total) : 0;
      console.log('[upload api] progress', { file: file.name, progress });
      onProgress?.(progress);
    },
  });
};
