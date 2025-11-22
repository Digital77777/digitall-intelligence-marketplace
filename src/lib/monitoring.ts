import * as Sentry from '@sentry/react';

/**
 * Initialize Sentry monitoring
 * Configure this in your environment variables
 */
export const initMonitoring = () => {
  // Only initialize in production or if explicitly enabled
  const sentryDsn = import.meta.env.VITE_SENTRY_DSN;
  const environment = import.meta.env.MODE;

  if (!sentryDsn) {
    console.log('Sentry DSN not configured. Skipping monitoring initialization.');
    return;
  }

  Sentry.init({
    dsn: sentryDsn,
    environment,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],

    // Performance Monitoring
    tracesSampleRate: environment === 'production' ? 0.1 : 1.0,

    // Session Replay
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,

    // Filter out common non-error events
    beforeSend(event, hint) {
      const error = hint.originalException;
      
      // Filter out cancelled requests
      if (error && typeof error === 'object' && 'message' in error) {
        const message = String(error.message);
        if (message.includes('cancelled') || message.includes('aborted')) {
          return null;
        }
      }

      return event;
    },
  });
};

/**
 * Manually capture an exception
 */
export const captureException = (error: Error, context?: Record<string, any>) => {
  if (context) {
    Sentry.setContext('additional_context', context);
  }
  Sentry.captureException(error);
};

/**
 * Manually capture a message
 */
export const captureMessage = (message: string, level: Sentry.SeverityLevel = 'info') => {
  Sentry.captureMessage(message, level);
};

/**
 * Set user context
 */
export const setUser = (user: { id: string; email?: string; username?: string }) => {
  Sentry.setUser(user);
};

/**
 * Clear user context
 */
export const clearUser = () => {
  Sentry.setUser(null);
};

/**
 * Add breadcrumb for debugging
 */
export const addBreadcrumb = (message: string, data?: Record<string, any>) => {
  Sentry.addBreadcrumb({
    message,
    data,
    level: 'info',
  });
};
