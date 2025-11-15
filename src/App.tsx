import React, { useEffect, lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { TierProvider } from "@/contexts/TierContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Navigation from "./components/Navigation";
import MobileFooter from "./components/MobileFooter";
import { DeploymentDiagnostics } from "./components/DeploymentDiagnostics";

// Eager-loaded pages for instant navigation
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import DashboardPage from "./pages/DashboardPage";
import AIToolsPage from "./pages/AIToolsPage";
import MarketplacePage from "./pages/MarketplacePage";
import CommunityPage from "./pages/CommunityPage";
import ReferralPage from "./pages/ReferralPage";
import SubscriptionPage from "./pages/SubscriptionPage";

// Learning - Lazy loaded
const LearningPaths = lazy(() => import("./pages/LearningPaths"));
const FoundationPath = lazy(() => import("./pages/course/FoundationPath"));
const PracticalSkills = lazy(() => import("./pages/course/PracticalSkills"));
const TechnicalDeveloper = lazy(() => import("./pages/course/TechnicalDeveloper"));
const BusinessCareers = lazy(() => import("./pages/course/BusinessCareers"));

// AI Tools - Lazy loaded
const AICodeAssistant = lazy(() => import("./pages/tools/AICodeAssistant"));
const NeuralImageGenerator = lazy(() => import("./pages/tools/NeuralImageGenerator"));
const SmartAnalytics = lazy(() => import("./pages/tools/SmartAnalytics"));
const ConversationalAI = lazy(() => import("./pages/tools/ConversationalAI"));

// Marketplace - Lazy loaded
const BrowseMarketplacePage = lazy(() => import("./pages/BrowseMarketplacePage"));
const SellProductsPage = lazy(() => import("./pages/SellProductsPage"));
const MyListingsPage = lazy(() => import("./pages/MyListingsPage"));
const CreateListingPage = lazy(() => import("./pages/CreateListingPage"));
const ScheduleConsultationPage = lazy(() => import("./pages/ScheduleConsultationPage"));

// Community - Lazy loaded
const MyActivityPage = lazy(() => import("./pages/MyActivityPage"));
const TopicDetailPage = lazy(() => import("./pages/community/TopicDetailPage"));
const BrowseEventsPage = lazy(() => import("./pages/community/BrowseEventsPage"));
const FindMembersPage = lazy(() => import("./pages/community/FindMembersPage"));
const HostEventPage = lazy(() => import("./pages/community/HostEventPage"));
const InboxPage = lazy(() => import("./pages/community/InboxPage"));
const ShareInsightPage = lazy(() => import("./pages/community/ShareInsightPage"));
const StartTopicPage = lazy(() => import("./pages/community/StartTopicPage"));

// Career & Professional - Lazy loaded
const CareerCertificationPage = lazy(() => import("./pages/CareerCertificationPage"));
const JobPlacementPage = lazy(() => import("./pages/JobPlacementPage"));
const StrategySessionsPage = lazy(() => import("./pages/StrategySessionsPage"));

// Misc / Support - Lazy loaded
const AnalyticsPage = lazy(() => import("./pages/AnalyticsPage"));
const SupportPage = lazy(() => import("./pages/SupportPage"));

// Optimized QueryClient with aggressive caching for instant data access
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes - data stays fresh longer
      gcTime: 10 * 60 * 1000, // 10 minutes - cache persists longer
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  },
});

// PrivateRoute wrapper - minimal loading state
const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen" />;
  return user ? children : <Navigate to="/auth" replace />;
};

// Scroll + volume key handling
const ScrollToTop = () => {
  const location = useLocation();
  useEffect(() => window.scrollTo(0, 0), [location.pathname]);
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["VolumeUp", "VolumeDown", "VolumeMute"].includes(e.key)) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    document.addEventListener("keydown", handleKeyDown, { capture: true });
    return () => document.removeEventListener("keydown", handleKeyDown, { capture: true });
  }, []);
  return null;
};

// Grouped route configuration
interface AppRoute {
  path: string;
  component: React.LazyExoticComponent<() => JSX.Element> | React.FC;
  protected?: boolean;
  children?: AppRoute[]; // for nested routes if needed
}

const routeGroups: AppRoute[] = [
  { path: "/", component: Index },
  { path: "/auth", component: Auth },
  { path: "/dashboard", component: DashboardPage, protected: true },

  // Learning
  { path: "/learning-paths", component: LearningPaths, protected: true },
  { path: "/course/foundation-path", component: FoundationPath, protected: true },
  { path: "/course/practical-skills", component: PracticalSkills, protected: true },
  { path: "/course/technical-developer", component: TechnicalDeveloper, protected: true },
  { path: "/course/business-careers", component: BusinessCareers, protected: true },

  // AI Tools
  { path: "/ai-tools", component: AIToolsPage, protected: true },
  { path: "/tools/ai-code-assistant", component: AICodeAssistant, protected: true },
  { path: "/tools/neural-image-generator", component: NeuralImageGenerator, protected: true },
  { path: "/tools/smart-analytics", component: SmartAnalytics, protected: true },
  { path: "/tools/conversational-ai", component: ConversationalAI, protected: true },

  // Marketplace
  { path: "/marketplace", component: MarketplacePage, protected: true },
  { path: "/marketplace/browse", component: BrowseMarketplacePage, protected: true },
  { path: "/marketplace/sell-products", component: SellProductsPage, protected: true },
  { path: "/marketplace/schedule-consultation", component: ScheduleConsultationPage, protected: true },
  { path: "/marketplace/my-listings", component: MyListingsPage, protected: true },
  { path: "/marketplace/create", component: CreateListingPage, protected: true },

  // Community
  { path: "/community", component: CommunityPage, protected: true },
  { path: "/community/my-activity", component: MyActivityPage, protected: true },
  { path: "/community/topic/:topicId", component: TopicDetailPage, protected: true },
  { path: "/community/browse-events", component: BrowseEventsPage, protected: true },
  { path: "/community/find-members", component: FindMembersPage, protected: true },
  { path: "/community/host-event", component: HostEventPage, protected: true },
  { path: "/community/inbox", component: InboxPage, protected: true },
  { path: "/community/share-insight", component: ShareInsightPage, protected: true },
  { path: "/community/start-topic", component: StartTopicPage, protected: true },

  // Career & Professional
  { path: "/career-certification", component: CareerCertificationPage, protected: true },
  { path: "/job-placement", component: JobPlacementPage, protected: true },
  { path: "/strategy-sessions", component: StrategySessionsPage, protected: true },

  // Misc
  { path: "/analytics", component: AnalyticsPage, protected: true },
  { path: "/support", component: SupportPage, protected: true },
  { path: "/subscription", component: SubscriptionPage, protected: true },
  { path: "/referrals", component: ReferralPage, protected: true },
];

const App = () => {
  const renderRoute = ({ path, component: Component, protected: isProtected }: AppRoute) => (
    <Route
      key={path}
      path={path}
      element={isProtected ? <PrivateRoute><Component /></PrivateRoute> : <Component />}
    />
  );

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TierProvider>
            <TooltipProvider>
              <DeploymentDiagnostics />
              <Toaster position="top-right" />
              <BrowserRouter>
                <div className="min-h-screen bg-background">
                  <ScrollToTop />
                  <Navigation />
                  <main className="pb-20 md:pb-0">
                    <Suspense fallback={<div className="min-h-screen" />}>
                      <Routes>
                        {routeGroups.map(renderRoute)}
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </Suspense>
                  </main>
                  <MobileFooter />
                </div>
              </BrowserRouter>
            </TooltipProvider>
          </TierProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;