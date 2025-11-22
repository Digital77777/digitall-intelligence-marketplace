import { onCLS, onINP, onFCP, onLCP, onTTFB, type Metric } from 'web-vitals';
import { captureMessage } from './monitoring';

/**
 * Web Vitals thresholds
 */
const THRESHOLDS = {
  CLS: 0.1,   // Cumulative Layout Shift
  INP: 200,   // Interaction to Next Paint (ms)
  FCP: 1800,  // First Contentful Paint (ms)
  LCP: 2500,  // Largest Contentful Paint (ms)
  TTFB: 800,  // Time to First Byte (ms)
};

/**
 * Send metric to analytics
 */
const sendToAnalytics = (metric: Metric) => {
  const { name, value, rating } = metric;

  // Log to console in development
  if (import.meta.env.DEV) {
    console.log(`[Web Vitals] ${name}:`, {
      value: Math.round(name === 'CLS' ? value * 1000 : value),
      rating,
    });
  }

  // Send to Sentry if it's a poor rating
  if (rating === 'poor') {
    captureMessage(`Poor ${name}: ${value}`, 'warning');
  }

  // You can also send to Google Analytics or other analytics services
  if (window.gtag) {
    window.gtag('event', name, {
      value: Math.round(name === 'CLS' ? value * 1000 : value),
      event_category: 'Web Vitals',
      event_label: metric.id,
      non_interaction: true,
    });
  }
};

/**
 * Initialize Web Vitals tracking
 */
export const initWebVitals = () => {
  onCLS(sendToAnalytics);
  onINP(sendToAnalytics);
  onFCP(sendToAnalytics);
  onLCP(sendToAnalytics);
  onTTFB(sendToAnalytics);
};

/**
 * Get performance metrics summary
 */
export const getPerformanceMetrics = () => {
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  const paint = performance.getEntriesByType('paint');

  return {
    dns: Math.round(navigation.domainLookupEnd - navigation.domainLookupStart),
    tcp: Math.round(navigation.connectEnd - navigation.connectStart),
    ttfb: Math.round(navigation.responseStart - navigation.requestStart),
    download: Math.round(navigation.responseEnd - navigation.responseStart),
    domInteractive: Math.round(navigation.domInteractive - navigation.fetchStart),
    domComplete: Math.round(navigation.domComplete - navigation.fetchStart),
    loadComplete: Math.round(navigation.loadEventEnd - navigation.fetchStart),
    fcp: paint.find(p => p.name === 'first-contentful-paint')?.startTime,
  };
};

// Type augmentation for gtag
declare global {
  interface Window {
    gtag?: (
      command: string,
      eventName: string,
      params?: Record<string, any>
    ) => void;
  }
}
