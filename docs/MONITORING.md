# Monitoring & Performance

This document covers the monitoring and performance tracking setup in the application.

## Overview

The application uses:
- **Sentry** for error tracking and performance monitoring
- **Web Vitals** for Core Web Vitals tracking
- **Custom performance metrics** for detailed insights

## Setup

### 1. Configure Sentry

Add your Sentry DSN to the environment variables:

```bash
VITE_SENTRY_DSN=your_sentry_dsn_here
```

Get your DSN from [Sentry](https://sentry.io/):
1. Create a new project (or use existing)
2. Go to Settings > Projects > [Your Project] > Client Keys (DSN)
3. Copy the DSN

### 2. Environment Configuration

The monitoring is automatically disabled in development unless you provide a Sentry DSN. In production:

- **Traces Sample Rate**: 10% (to reduce costs)
- **Session Replay**: 10% of sessions, 100% on errors
- **Error Filtering**: Filters out cancelled/aborted requests

## Features

### Error Tracking

All unhandled errors are automatically sent to Sentry:

```typescript
import { captureException } from '@/lib/monitoring';

try {
  // Your code
} catch (error) {
  captureException(error, { additionalContext: 'value' });
}
```

### Performance Monitoring

#### Web Vitals

Tracks Core Web Vitals automatically:
- **LCP** (Largest Contentful Paint) - Loading performance
- **FID** (First Input Delay) - Interactivity
- **CLS** (Cumulative Layout Shift) - Visual stability
- **FCP** (First Contentful Paint) - Initial render
- **TTFB** (Time to First Byte) - Server response time

Poor metrics are automatically reported to Sentry.

#### Custom Metrics

Get detailed performance metrics:

```typescript
import { getPerformanceMetrics } from '@/lib/webVitals';

const metrics = getPerformanceMetrics();
console.log('DNS lookup:', metrics.dns, 'ms');
console.log('TTFB:', metrics.ttfb, 'ms');
```

### User Context

Track user information in errors:

```typescript
import { setUser, clearUser } from '@/lib/monitoring';

// After login
setUser({
  id: user.id,
  email: user.email,
  username: user.username,
});

// After logout
clearUser();
```

### Breadcrumbs

Add debugging breadcrumbs:

```typescript
import { addBreadcrumb } from '@/lib/monitoring';

addBreadcrumb('User clicked button', {
  buttonId: 'submit-form',
  formData: { /* sanitized data */ },
});
```

### Messages

Capture informational messages:

```typescript
import { captureMessage } from '@/lib/monitoring';

captureMessage('Important event occurred', 'info');
captureMessage('Warning: unusual behavior', 'warning');
```

## Error Boundary

All React errors are caught by `ErrorBoundary` and sent to Sentry automatically with component stack traces.

## Google Analytics Integration

Web Vitals can be sent to Google Analytics (if configured):

```html
<!-- Add to index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

## Best Practices

### 1. Don't Over-Report

- Filter out expected errors (e.g., cancelled requests)
- Use appropriate severity levels
- Add context to make errors actionable

### 2. Protect User Privacy

- Mask sensitive data in session replays
- Don't send PII (Personally Identifiable Information)
- Use user IDs instead of emails when possible

### 3. Monitor Performance Budget

Set performance budgets and alert on violations:
- LCP < 2.5s
- FID < 100ms
- CLS < 0.1

### 4. Sample Rates

Adjust sample rates based on traffic:
- **High traffic**: Lower rates (5-10%)
- **Low traffic**: Higher rates (50-100%)
- **Errors**: Always 100%

## Debugging

### View Errors in Sentry

1. Go to Sentry dashboard
2. Select your project
3. View Issues > Error details
4. Check breadcrumbs, stack traces, and session replays

### View Performance in Sentry

1. Go to Performance tab
2. View transaction details
3. Analyze slow transactions
4. Check Web Vitals

### Local Testing

Set `VITE_SENTRY_DSN` in development to test error reporting:

```bash
VITE_SENTRY_DSN=your_test_dsn npm run dev
```

## Cost Optimization

- Use sampling to reduce event volume
- Set up alert rules for critical errors only
- Archive old issues regularly
- Use performance budgets to prevent regressions

## Additional Resources

- [Sentry React Documentation](https://docs.sentry.io/platforms/javascript/guides/react/)
- [Web Vitals Documentation](https://web.dev/vitals/)
- [Chrome DevTools Performance](https://developer.chrome.com/docs/devtools/performance/)
