// Utility to handle API errors and display proper messages
import { toast } from 'react-toastify';

export const handleApiError = (error: any, defaultMessage: string = 'Có lỗi xảy ra') => {
  console.error('❌ Backend error:', error);
  console.error('📦 Response data:', error.response?.data);
  
  const errorMessage = error.response?.data?.message || defaultMessage;
  
  console.error('💬 Displaying error:', errorMessage);
  
  // Split multiple errors by comma and display each separately
  const errors = errorMessage.split(',').map((err: string) => err.trim()).filter((err: string) => err);
  
  if (errors.length > 1) {
    // Multiple errors - display each as separate toast
    errors.forEach((err: string, index: number) => {
      setTimeout(() => {
        toast.error(err, { autoClose: 4000 });
      }, index * 100); // Stagger slightly so they don't overlap
    });
  } else {
    // Single error - display normally
    toast.error(errorMessage, { autoClose: 4000 });
  }
};

