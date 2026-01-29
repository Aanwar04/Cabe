// Toast utility placeholder
// Install: npm install react-native-toast-message
// Usage in App.tsx: import Toast from 'react-native-toast-message'; <Toast />

// This file provides type-safe toast functions once the package is installed
// For now, it provides a no-op implementation

type ToastType = 'success' | 'error' | 'info';

interface ToastParams {
  type: ToastType;
  text1: string;
  text2?: string;
  visibilityTime?: number;
  autoHide?: boolean;
  topOffset?: number;
}

const showToastInternal = (params: ToastParams): void => {
  console.log(`[Toast ${params.type}]: ${params.text1} ${params.text2 || ''}`);
};

// Export for use after package installation
export const showToast = (type: ToastType, text1: string, text2?: string): void => {
  showToastInternal({type, text1, text2, visibilityTime: 4000});
};

export const showSuccess = (text1: string, text2?: string): void => {
  showToast('success', text1, text2);
};

export const showError = (text1: string, text2?: string): void => {
  showToast('error', text1, text2);
};

export const showInfo = (text1: string, text2?: string): void => {
  showToast('info', text1, text2);
};

// Empty config - will be replaced after package installation
export const toastConfig = {};

export default {show: showToast, success: showSuccess, error: showError, info: showInfo};
