import toast from 'react-hot-toast';

const baseStyle = {
  borderRadius: '8px',
  boxShadow: '0 16px 40px rgba(15, 23, 42, 0.16)',
  fontSize: '14px',
  fontWeight: 600,
  padding: '12px 14px',
};

const toastStyles = {
  error: {
    ...baseStyle,
    background: '#fef2f2',
    border: '1px solid #fecaca',
    color: '#991b1b',
  },
  info: {
    ...baseStyle,
    background: '#eff6ff',
    border: '1px solid #bfdbfe',
    color: '#1d4ed8',
  },
  loading: {
    ...baseStyle,
    background: '#f8fafc',
    border: '1px solid #cbd5e1',
    color: '#334155',
  },
  success: {
    ...baseStyle,
    background: '#f0fdf4',
    border: '1px solid #bbf7d0',
    color: '#166534',
  },
  warning: {
    ...baseStyle,
    background: '#fffbeb',
    border: '1px solid #fde68a',
    color: '#92400e',
  },
};

export const showSuccess = (message, options = {}) => {
  console.log('[toast success]', message);
  return toast.success(message, {
    duration: 3000,
    icon: options.icon || '✓',
    style: toastStyles.success,
    ...options,
  });
};

export const showError = (message, options = {}) => {
  console.log('[toast error]', message);
  return toast.error(message, {
    duration: 5000,
    icon: options.icon || '!',
    style: toastStyles.error,
    ...options,
  });
};

export const showWarning = (message, options = {}) => {
  console.log('[toast warning]', message);
  return toast(message, {
    duration: 4000,
    icon: options.icon || '⚠',
    style: toastStyles.warning,
    ...options,
  });
};

export const showInfo = (message, options = {}) => {
  console.log('[toast info]', message);
  return toast(message, {
    duration: 3500,
    icon: options.icon || 'i',
    style: toastStyles.info,
    ...options,
  });
};

export const showLoading = (message, options = {}) => {
  console.log('[toast loading]', message);
  return toast.loading(message, {
    icon: options.icon,
    style: toastStyles.loading,
    ...options,
  });
};

export const dismissToast = (toastId) => {
  if (toastId) {
    toast.dismiss(toastId);
  }
};

export const showApiError = (error, fallback = 'Something went wrong.') => {
  if (!error.response) {
    showError('Network failure. Please check your connection.');
    return;
  }

  if (error.response.status === 401) {
    showError('Unauthorized. Please sign in again.');
    return;
  }

  if (error.response.status >= 500) {
    showError('Server error. Please try again shortly.');
    return;
  }

  if (error.config?.showValidationToast) {
    showError(error.response.data?.message || fallback);
  }
};

export const toastOptions = {
  containerStyle: {
    maxWidth: 'min(420px, calc(100vw - 24px))',
  },
  gutter: 10,
  position: 'top-right',
};
