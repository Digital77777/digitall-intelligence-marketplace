# Architecture Documentation

## Overview

Digital Intelligence Marketplace is a full-stack React application built with modern web technologies, providing AI tools, learning paths, marketplace, and community features.

## Technology Stack

### Frontend
- **React 18.3.1** - UI library with hooks and concurrent features
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **React Router v6** - Client-side routing with lazy loading
- **TanStack Query v5** - Server state management with aggressive caching
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - Accessible component library built on Radix UI

### Backend (Supabase/Lovable Cloud)
- **Supabase** - PostgreSQL database with real-time capabilities
- **Row Level Security (RLS)** - Database-level access control
- **Edge Functions** - Serverless functions for backend logic
- **Supabase Auth** - User authentication and session management

### Design System
- **HSL Color System** - Semantic color tokens for theming
- **CSS Custom Properties** - Design tokens in `index.css`
- **Tailwind Config** - Extended with semantic tokens
- **Responsive Design** - Mobile-first with breakpoints

## Application Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Browser                              │
├─────────────────────────────────────────────────────────────┤
│  React App (SPA)                                            │
│  ├── React Router (Client-side routing)                     │
│  ├── TanStack Query (State & caching)                       │
│  ├── Auth Context (User session)                            │
│  ├── Tier Context (Subscription tiers)                      │
│  └── Components (UI + Business logic)                       │
├─────────────────────────────────────────────────────────────┤
│  Supabase Client                                            │
│  ├── Auth (JWT tokens)                                      │
│  ├── Database (PostgreSQL queries)                          │
│  ├── Realtime (WebSocket subscriptions)                     │
│  └── Storage (File uploads)                                 │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Supabase Backend                          │
├─────────────────────────────────────────────────────────────┤
│  PostgreSQL Database                                        │
│  ├── Tables (with RLS policies)                            │
│  ├── Views                                                  │
│  ├── Functions (PL/pgSQL)                                   │
│  └── Triggers                                               │
├─────────────────────────────────────────────────────────────┤
│  Edge Functions (Deno)                                      │
│  ├── hugging-face-proxy                                     │
│  └── imagga-proxy                                           │
├─────────────────────────────────────────────────────────────┤
│  Auth Service                                               │
│  └── JWT token validation                                   │
└─────────────────────────────────────────────────────────────┘
```

### Directory Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base Shadcn components
│   ├── tier/           # Tier/subscription components
│   ├── marketplace/    # Marketplace-specific components
│   ├── community/      # Community features
│   ├── media/          # Media handling components
│   └── ...             # Feature-specific components
├── pages/              # Route pages (lazy loaded where possible)
│   ├── tools/          # AI tool pages
│   ├── course/         # Learning path pages
│   └── community/      # Community pages
├── hooks/              # Custom React hooks
├── contexts/           # React context providers
├── lib/                # Utility functions and services
├── integrations/       # External service integrations
│   └── supabase/       # Supabase client and types
├── types/              # TypeScript type definitions
└── utils/              # Helper utilities

docs/
├── ARCHITECTURE.md     # This file
├── COMPONENTS.md       # Component patterns
├── DATABASE.md         # Database schema
└── DEPLOYMENT.md       # Deployment guide
```

## Core Architectural Patterns

### 1. Code Splitting & Lazy Loading

**Strategy**: Eager load critical pages, lazy load secondary pages

```typescript
// Eager loaded (instant navigation)
import DashboardPage from "./pages/DashboardPage";
import AIToolsPage from "./pages/AIToolsPage";

// Lazy loaded (on-demand)
const AnalyticsPage = lazy(() => import("./pages/AnalyticsPage"));
const SupportPage = lazy(() => import("./pages/SupportPage"));
```

**Benefits**:
- Faster initial load time
- Reduced bundle size
- Better performance on mobile

### 2. Route Prefetching

**Implementation**: `usePrefetch` hook with hover/touch events

```typescript
const { handleMouseEnter, handleTouchStart } = usePrefetch();

<Link 
  to="/marketplace"
  onMouseEnter={() => handleMouseEnter('/marketplace')}
  onTouchStart={() => handleTouchStart('/marketplace')}
>
```

**Benefits**:
- Instant page transitions
- Improved perceived performance
- Better mobile UX

### 3. Server State Management

**TanStack Query Configuration**:

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,      // 5 min fresh data
      gcTime: 10 * 60 * 1000,         // 10 min cache persistence
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  },
});
```

**Benefits**:
- Reduced API calls
- Instant data access from cache
- Automatic background refetching

### 4. Authentication Flow

```
User → Auth Page → Supabase Auth → JWT Token → Auth Context
                                         ↓
                                   Store in localStorage
                                         ↓
                                   Validate on mount
                                         ↓
                                   Protected Routes
```

**Implementation**:
- `AuthProvider` context wraps entire app
- `useAuth()` hook provides user state
- `PrivateRoute` wrapper protects authenticated routes
- JWT tokens stored in localStorage
- Automatic session refresh

### 5. Subscription Tier System

**Architecture**:
```
TierProvider (Context)
    ↓
useTier() hook
    ↓
TierGate component (Access control)
    ↓
Feature-specific checks
```

**Tiers**:
- Starter: Basic access
- Career: Advanced features
- Creator: Full marketplace access

### 6. Error Handling Strategy

**Centralized Error Handler** (`lib/errorHandler.ts`):

```typescript
handleError(error, context?) → {
  - Log to console (dev)
  - Display user-friendly toast
  - Log to error_log table (production)
  - Return safe error object
}
```

**Usage Pattern**:
```typescript
try {
  await operation();
} catch (error) {
  handleError(error, 'Feature context');
}
```

### 7. Form Validation

**Centralized Schemas** (`lib/validationSchemas.ts`):

```typescript
export const emailSchema = z.string().email();
export const consultationSchema = z.object({...});
```

**Benefits**:
- Single source of truth
- Consistent validation
- Type-safe forms
- XSS prevention

### 8. Design System Architecture

**Three-Layer System**:

1. **Base Tokens** (`index.css`):
   ```css
   :root {
     --primary: 222.2 47.4% 11.2%;
     --gradient-ai: linear-gradient(...);
   }
   ```

2. **Tailwind Extension** (`tailwind.config.ts`):
   ```typescript
   backgroundImage: {
     'gradient-ai': 'var(--gradient-ai)',
   }
   ```

3. **Component Usage**:
   ```tsx
   <Button className="bg-gradient-ai" />
   ```

### 9. Database Access Pattern

**Row Level Security (RLS)**:
- All tables have RLS enabled
- Policies based on `auth.uid()`
- User can only access their own data
- Admin roles for privileged access

**Query Pattern**:
```typescript
const { data, error } = await supabase
  .from('table_name')
  .select('*')
  .eq('user_id', userId);
```

### 10. Component Composition

**Pattern**: Small, focused, reusable components

```
Page Component
  ├── Hero Component
  ├── Features Section
  │   └── Feature Card (repeated)
  ├── Stats Section
  │   └── Stat Card (repeated)
  └── CTA Section
```

**Benefits**:
- Easy to test
- Easy to maintain
- Promotes reusability
- Clear separation of concerns

## Performance Optimizations

### Bundle Optimization
- Route-based code splitting
- Lazy loading non-critical routes
- Tree shaking unused code
- Dynamic imports for large libraries

### Caching Strategy
- Aggressive TanStack Query caching
- Route prefetching on hover/touch
- Service Worker (PWA) for offline access
- Static asset caching

### Rendering Optimization
- Minimal re-renders with proper hooks
- Memoization where appropriate
- Virtual scrolling for long lists
- Skeleton loading states

### Network Optimization
- GraphQL-like query selection with Supabase
- Reduced API calls via caching
- Parallel data fetching
- Request deduplication

## Security Architecture

### Authentication Security
- JWT tokens with expiration
- Secure token storage (httpOnly cookies in production)
- Session refresh mechanism
- CSRF protection

### Database Security
- Row Level Security (RLS) on all tables
- User isolation via policies
- SQL injection prevention
- Encrypted sensitive fields

### Input Validation
- Client-side validation with Zod
- Server-side validation in Edge Functions
- XSS prevention via sanitization
- CORS configuration

### Access Control
- Role-based access (admin, moderator, user)
- Feature gating via TierProvider
- Protected routes via PrivateRoute
- API endpoint authentication

## Scalability Considerations

### Frontend Scalability
- Code splitting reduces initial bundle
- CDN for static assets
- Service Worker for offline capabilities
- Progressive Web App (PWA) features

### Backend Scalability
- Supabase handles DB scaling
- Edge Functions auto-scale
- Connection pooling
- Read replicas for heavy loads

### Data Scalability
- Indexed columns for performance
- Efficient query patterns
- Pagination for large datasets
- Soft deletes for audit trails

## Monitoring & Observability

### Error Logging
- Client-side error boundary
- Centralized error handler
- Database error log table
- Console logging in development

### Performance Monitoring
- Web Vitals tracking (future)
- Query performance monitoring
- Route transition timing
- API response times

### User Analytics
- Analytics page (in-app)
- User activity tracking
- Feature usage metrics
- Conversion funnels

## Development Workflow

### Local Development
```bash
npm install
npm run dev          # Start dev server
npm run build        # Production build
npm run preview      # Preview production build
```

### Testing Strategy
- Manual testing in preview
- Type checking with TypeScript
- Linting with ESLint
- Future: Unit tests with Vitest

### Deployment
- Automatic via Lovable platform
- GitHub integration for version control
- Environment variables via Supabase
- Preview deployments for testing

## Future Architectural Improvements

### Planned Enhancements
1. **Testing**: Unit tests, E2E tests with Playwright
2. **Monitoring**: Web Vitals, error tracking service
3. **Performance**: Further bundle optimization
4. **Documentation**: Auto-generated API docs
5. **CI/CD**: Automated testing pipeline

### Migration Path
- Document breaking changes
- Gradual migration approach
- Backward compatibility where possible
- Feature flags for new features

## Related Documentation

- [Component Patterns](./COMPONENTS.md)
- [Database Schema](./DATABASE.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [Contributing Guide](./CONTRIBUTING.md)
