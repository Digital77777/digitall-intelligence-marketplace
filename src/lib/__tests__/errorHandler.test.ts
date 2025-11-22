import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AppError, handleAuthError, handleNetworkError } from '../errorHandler';

describe('errorHandler', () => {
  describe('AppError', () => {
    it('creates error with message and code', () => {
      const error = new AppError('Test error', 'TEST_CODE', 400);
      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_CODE');
      expect(error.statusCode).toBe(400);
      expect(error.name).toBe('AppError');
    });
  });

  describe('handleAuthError', () => {
    it('handles invalid login error', () => {
      const error = { message: 'Invalid login credentials' };
      expect(handleAuthError(error)).toBe('Invalid email or password');
    });

    it('handles email not confirmed error', () => {
      const error = { message: 'Email not confirmed' };
      expect(handleAuthError(error)).toBe('Please check your email to confirm your account');
    });

    it('handles user already registered error', () => {
      const error = { message: 'User already registered' };
      expect(handleAuthError(error)).toBe('An account with this email already exists');
    });

    it('returns generic message for unknown errors', () => {
      const error = { message: 'Unknown error' };
      expect(handleAuthError(error)).toBe('Unknown error');
    });

    it('handles null error', () => {
      expect(handleAuthError(null)).toBe('Authentication failed');
    });
  });

  describe('handleNetworkError', () => {
    beforeEach(() => {
      vi.stubGlobal('navigator', { onLine: true });
    });

    it('detects offline status', () => {
      vi.stubGlobal('navigator', { onLine: false });
      expect(handleNetworkError({})).toBe('No internet connection. Please check your network.');
    });

    it('handles rate limit errors', () => {
      expect(handleNetworkError({ status: 429 })).toBe('Too many requests. Please try again later.');
    });

    it('handles server errors', () => {
      expect(handleNetworkError({ status: 500 })).toBe('Server error. Please try again later.');
      expect(handleNetworkError({ status: 503 })).toBe('Server error. Please try again later.');
    });

    it('returns generic network error message', () => {
      expect(handleNetworkError({ status: 400 })).toBe('Network error. Please check your connection.');
    });
  });
});
