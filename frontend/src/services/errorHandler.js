/**
 * Centralized API error handler.
 * Maps backend error codes to user-friendly messages.
 */

const ERROR_MESSAGES = {
  // Auth errors
  'INVALID_CREDENTIALS': 'Invalid username or password.',
  'INVALID_PIN': 'Incorrect PIN. Please try again.',
  'PIN_NOT_SET': 'Please set up your transaction PIN first.',
  'TOKEN_EXPIRED': 'Your session has expired. Please log in again.',
  'UNAUTHORIZED': 'You are not authorized to perform this action.',

  // Wallet errors
  'INSUFFICIENT_BALANCE': 'Insufficient balance for this transaction.',
  'WALLET_NOT_FOUND': 'Wallet not found. Please contact support.',

  // Transaction errors
  'DUPLICATE_TRANSACTION': 'This transaction has already been processed.',
  'TRANSACTION_FAILED': 'Transaction failed. Please try again.',
  'INVALID_AMOUNT': 'Please enter a valid amount.',

  // Rate limiting
  'RATE_LIMIT_EXCEEDED': 'Too many attempts. Please wait a moment and try again.',

  // Resource errors
  'RESOURCE_ALREADY_EXISTS': 'This resource already exists.',
  'RESOURCE_NOT_FOUND': 'The requested resource was not found.',

  // Server errors
  'INTERNAL_ERROR': 'Something went wrong on our end. Please try again later.',
  'SERVICE_UNAVAILABLE': 'Service is temporarily unavailable. Please try again later.',
  'GATEWAY_TIMEOUT': 'Payment gateway is taking too long. Please try again.',
}

/**
 * Extract a user-friendly message from an API error response.
 * @param {Error} error - Axios error object
 * @returns {string} User-friendly error message
 */
export function getErrorMessage(error) {
  if (!error) {
    return 'An unexpected error occurred.'
  }

  // Network error (no response from server)
  if (!error.response) {
    if (error.code === 'ECONNABORTED') {
      return 'Request timed out. Please check your connection and try again.'
    }
    return 'Unable to connect to the server. Please check your internet connection.'
  }

  const { status, data } = error.response

  // Try to extract message from our standard error response envelope
  if (data?.message) {
    return data.message
  }

  // Try error code mapping
  if (data?.errorCode && ERROR_MESSAGES[data.errorCode]) {
    return ERROR_MESSAGES[data.errorCode]
  }

  // HTTP status-based fallbacks
  switch (status) {
    case 400:
      return 'Invalid request. Please check your input.'
    case 401:
      return 'Your session has expired. Please log in again.'
    case 403:
      return 'You do not have permission to perform this action.'
    case 404:
      return 'The requested resource was not found.'
    case 409:
      return 'This action conflicts with the current state. Please try again.'
    case 422:
      return 'Invalid data provided. Please check your input.'
    case 429:
      return 'Too many requests. Please wait a moment and try again.'
    case 500:
      return 'Something went wrong on our end. Please try again later.'
    case 502:
      return 'Payment service is temporarily unavailable. Please try again.'
    case 503:
      return 'Service is temporarily unavailable. Please try again later.'
    case 504:
      return 'Payment gateway timed out. Please try again.'
    default:
      return 'An unexpected error occurred. Please try again.'
  }
}

/**
 * Check if an error is retryable.
 * @param {Error} error - Axios error object
 * @returns {boolean}
 */
export function isRetryableError(error) {
  if (!error?.response) return true // Network errors are retryable
  const status = error.response.status
  return status >= 500 || status === 408 || status === 429
}

export default { getErrorMessage, isRetryableError }
