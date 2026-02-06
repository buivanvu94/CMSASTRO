import { AxiosError } from 'axios';

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  statusCode?: number;
}

export function handleApiError(error: unknown): ApiError {
  if (error instanceof AxiosError) {
    const statusCode = error.response?.status;
    const data = error.response?.data;

    // Handle specific status codes
    if (statusCode === 401) {
      return {
        message: 'Your session has expired. Please login again.',
        statusCode,
      };
    }

    if (statusCode === 403) {
      return {
        message: 'You do not have permission to perform this action.',
        statusCode,
      };
    }

    if (statusCode === 404) {
      return {
        message: 'The requested resource was not found.',
        statusCode,
      };
    }

    if (statusCode === 422 && data?.errors) {
      return {
        message: data.message || 'Validation failed',
        errors: data.errors,
        statusCode,
      };
    }

    if (statusCode === 500) {
      return {
        message: 'An internal server error occurred. Please try again later.',
        statusCode,
      };
    }

    // Generic error from API
    if (data?.message) {
      return {
        message: data.message,
        errors: data.errors,
        statusCode,
      };
    }

    // Network error
    if (error.message === 'Network Error') {
      return {
        message: 'Unable to connect to the server. Please check your internet connection.',
      };
    }

    // Request timeout
    if (error.code === 'ECONNABORTED') {
      return {
        message: 'The request took too long. Please try again.',
      };
    }
  }

  // Unknown error
  if (error instanceof Error) {
    return {
      message: error.message,
    };
  }

  return {
    message: 'An unexpected error occurred. Please try again.',
  };
}

export function getErrorMessage(error: unknown): string {
  const apiError = handleApiError(error);
  return apiError.message;
}

export function getValidationErrors(error: unknown): Record<string, string[]> | undefined {
  const apiError = handleApiError(error);
  return apiError.errors;
}

export function showErrorToast(error: unknown) {
  const message = getErrorMessage(error);
  // You can integrate with a toast library here
  alert(message);
}
