import { useCallback } from 'react';

// Route-to-component mapping for prefetching
const routeImports: Record<string, () => Promise<any>> = {
  '/': () => import('@/pages/Index'),
  '/dashboard': () => import('@/pages/DashboardPage'),
  '/learning-paths': () => import('@/pages/LearningPaths'),
  '/ai-tools': () => import('@/pages/AIToolsPage'),
  '/marketplace': () => import('@/pages/MarketplacePage'),
  '/marketplace/schedule-consultation': () => import('@/pages/ScheduleConsultationPage'),
  '/community': () => import('@/pages/CommunityPage'),
  '/referrals': () => import('@/pages/ReferralPage'),
  '/subscription': () => import('@/pages/SubscriptionPage'),
  '/analytics': () => import('@/pages/AnalyticsPage'),
  '/support': () => import('@/pages/SupportPage'),
  '/career-certification': () => import('@/pages/CareerCertificationPage'),
  '/job-placement': () => import('@/pages/JobPlacementPage'),
  '/strategy-sessions': () => import('@/pages/StrategySessionsPage'),
};

// Cache to track which routes have been prefetched
const prefetchedRoutes = new Set<string>();

export const usePrefetch = () => {
  const prefetchRoute = useCallback((path: string) => {
    // Skip if already prefetched
    if (prefetchedRoutes.has(path)) return;
    
    // Get the import function for this route
    const importFn = routeImports[path];
    if (!importFn) return;

    // Mark as prefetched immediately to avoid duplicate requests
    prefetchedRoutes.add(path);

    // Prefetch the route component
    importFn().catch((error) => {
      // Remove from cache if prefetch fails
      prefetchedRoutes.delete(path);
      console.warn(`Failed to prefetch route: ${path}`, error);
    });
  }, []);

  const handleMouseEnter = useCallback((path: string) => {
    prefetchRoute(path);
  }, [prefetchRoute]);

  const handleTouchStart = useCallback((path: string) => {
    // For mobile, prefetch on touch start for instant navigation
    prefetchRoute(path);
  }, [prefetchRoute]);

  return {
    prefetchRoute,
    handleMouseEnter,
    handleTouchStart,
  };
};
