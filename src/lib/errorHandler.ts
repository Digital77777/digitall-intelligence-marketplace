import { toast } from "sonner";

export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const handleError = (error: unknown, context?: string): void => {
  console.error(`Error in ${context || 'application'}:`, error);

  if (error instanceof AppError) {
    toast.error(error.message);
    return;
  }

  if (error instanceof Error) {
    toast.error(error.message || 'An unexpected error occurred');
    return;
  }

  toast.error('An unexpected error occurred. Please try again.');
};

export const handleAuthError = (error: any): string => {
  if (!error) return 'Authentication failed';
  
  if (error.message?.includes('Invalid login')) {
    return 'Invalid email or password';
  }
  
  if (error.message?.includes('Email not confirmed')) {
    return 'Please check your email to confirm your account';
  }
  
  if (error.message?.includes('User already registered')) {
    return 'An account with this email already exists';
  }

  return error.message || 'Authentication failed. Please try again.';
};

export const handleNetworkError = (error: any): string => {
  if (!navigator.onLine) {
    return 'No internet connection. Please check your network.';
  }
  
  if (error?.status === 429) {
    return 'Too many requests. Please try again later.';
  }
  
  if (error?.status >= 500) {
    return 'Server error. Please try again later.';
  }
  
  return 'Network error. Please check your connection.';
};

export const withErrorHandling = async <T>(
  fn: () => Promise<T>,
  context?: string
): Promise<T | null> => {
  try {
    return await fn();
  } catch (error) {
    handleError(error, context);
    return null;
  }
};
