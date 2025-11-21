# Component Patterns & Best Practices

## Overview

This document outlines the component patterns, conventions, and best practices used throughout the Digital Intelligence Marketplace application.

## Component Organization

### File Structure

```
src/components/
├── ui/                     # Base shadcn/ui components
│   ├── button.tsx         # Reusable Button with variants
│   ├── card.tsx           # Card container components
│   └── ...
├── tier/                   # Tier/subscription components
│   ├── TierGate.tsx       # Access control wrapper
│   ├── StarterDashboard.tsx
│   └── shared/            # Shared tier components
│       ├── TierHero.tsx
│       ├── QuickStats.tsx
│       └── BenefitsList.tsx
├── marketplace/            # Marketplace feature components
├── community/              # Community feature components
└── [feature]/              # Other feature-specific components
```

### Naming Conventions

- **PascalCase** for component files: `TierGate.tsx`
- **camelCase** for utility files: `validationSchemas.ts`
- **kebab-case** for CSS files: `app.css`
- Descriptive names: `ListingDetailsModal` not `Modal2`

## Component Patterns

### 1. Composition Pattern

**Principle**: Build complex UIs from small, focused components

```tsx
// ❌ BAD: Monolithic component
export const Dashboard = () => {
  return (
    <div>
      <div className="hero">...</div>
      <div className="stats">...</div>
      <div className="features">...</div>
      <div className="cta">...</div>
    </div>
  );
};

// ✅ GOOD: Composed from smaller components
export const Dashboard = () => {
  return (
    <>
      <TierHero title="Welcome" subtitle="..." />
      <QuickStats stats={statsData} />
      <FeaturesList features={features} />
      <CallToAction />
    </>
  );
};
```

**Benefits**:
- Easier to test individual pieces
- Better code reusability
- Clear separation of concerns
- Easier to maintain

### 2. Shared Component Pattern

**Location**: `src/components/tier/shared/`

**Purpose**: Components used across multiple tier dashboards

```tsx
// QuickStats.tsx - Reusable stats display
interface QuickStatsProps {
  stats: Stat[];
}

export const QuickStats = ({ stats }: QuickStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((stat, index) => (
        <Card key={index}>
          <div className="text-3xl font-bold text-primary">
            {stat.value}
          </div>
          <div className="text-sm text-muted-foreground">
            {stat.label}
          </div>
        </Card>
      ))}
    </div>
  );
};
```

**Usage**:
```tsx
// In StarterDashboard.tsx
import { QuickStats } from './shared/QuickStats';

const stats = [
  { value: "10", label: "Active Listings" },
  { value: "$1,234", label: "Total Earnings" }
];

<QuickStats stats={stats} />
```

### 3. Container/Presentational Pattern

**Container** (Smart Component):
- Manages state and logic
- Fetches data
- Handles events
- Passes data to presentational components

**Presentational** (Dumb Component):
- Receives data via props
- No state management
- Pure display logic
- Highly reusable

```tsx
// Container Component
const MarketplaceContainer = () => {
  const { listings, loading } = useMarketplace();
  const handleFavorite = (id: string) => {...};
  
  return (
    <ListingGrid 
      listings={listings} 
      loading={loading}
      onFavorite={handleFavorite}
    />
  );
};

// Presentational Component
interface ListingGridProps {
  listings: Listing[];
  loading: boolean;
  onFavorite: (id: string) => void;
}

const ListingGrid = ({ listings, loading, onFavorite }: ListingGridProps) => {
  if (loading) return <LoadingState />;
  
  return (
    <div className="grid gap-4">
      {listings.map(listing => (
        <ListingCard 
          key={listing.id}
          listing={listing}
          onFavorite={onFavorite}
        />
      ))}
    </div>
  );
};
```

### 4. Access Control Pattern (TierGate)

**Purpose**: Restrict features based on subscription tier

```tsx
import { TierGate } from '@/components/tier/TierGate';

// Wrap feature in TierGate
<TierGate feature="advanced_analytics">
  <AnalyticsDashboard />
</TierGate>

// With custom fallback
<TierGate 
  feature="ai_tools" 
  fallback={<UpgradePrompt />}
>
  <AIToolsPanel />
</TierGate>
```

**Implementation**:
```tsx
export const TierGate = ({ feature, children, fallback }: TierGateProps) => {
  const { canAccessFeature, loading } = useTier();
  
  if (loading) return <LoadingState />;
  if (!canAccessFeature(feature)) {
    return fallback || <DefaultUpgradePrompt />;
  }
  
  return <>{children}</>;
};
```

### 5. Modal Pattern

**Controlled Modal**:
```tsx
const [isOpen, setIsOpen] = useState(false);

<Button onClick={() => setIsOpen(true)}>
  Open Details
</Button>

<ListingDetailsModal
  listing={selectedListing}
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
/>
```

**Modal Component Structure**:
```tsx
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  // ... other props
}

export const Modal = ({ isOpen, onClose, ...props }: ModalProps) => {
  if (!isOpen) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        {/* Modal content */}
      </DialogContent>
    </Dialog>
  );
};
```

### 6. Form Pattern with Validation

**Using React Hook Form + Zod**:

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { consultationSchema } from '@/lib/validationSchemas';

const ConsultationForm = () => {
  const form = useForm({
    resolver: zodResolver(consultationSchema),
    defaultValues: {
      name: '',
      email: '',
      message: ''
    }
  });
  
  const onSubmit = async (data: FormData) => {
    try {
      await submitConsultation(data);
      toast.success('Form submitted!');
    } catch (error) {
      handleError(error, 'Consultation form');
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
};
```

### 7. Loading States Pattern

**Skeleton Loading**:
```tsx
const Component = () => {
  const { data, loading } = useQuery();
  
  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }
  
  return <ActualContent data={data} />;
};
```

**Suspense Boundary**:
```tsx
<Suspense fallback={<LoadingSpinner />}>
  <LazyComponent />
</Suspense>
```

### 8. Error Boundary Pattern

**Usage**:
```tsx
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

**Implementation**:
```tsx
class ErrorBoundary extends React.Component {
  state = { hasError: false };
  
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  
  componentDidCatch(error, errorInfo) {
    handleError(error, 'Error Boundary');
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    return this.props.children;
  }
}
```

## Design System Usage

### Using Semantic Tokens

```tsx
// ❌ BAD: Direct colors
<div className="bg-white text-black border-gray-300">

// ✅ GOOD: Semantic tokens
<div className="bg-background text-foreground border-border">

// ❌ BAD: Direct color values
<Button className="bg-blue-500 hover:bg-blue-600">

// ✅ GOOD: Design system variants
<Button variant="ai" className="bg-gradient-ai">
```

### Available Semantic Tokens

**Colors**:
- `background` / `foreground` - Base background and text
- `primary` / `primary-foreground` - Brand colors
- `secondary` / `secondary-foreground` - Secondary UI
- `muted` / `muted-foreground` - Muted/disabled states
- `accent` / `accent-foreground` - Accent highlights
- `destructive` / `destructive-foreground` - Error/danger
- `warning` / `warning-foreground` - Warning states
- `info` / `info-foreground` - Info states

**Gradients**:
- `bg-gradient-ai` - AI feature gradient
- `bg-gradient-learning` - Learning gradient
- `bg-gradient-earn` - Earnings gradient
- `bg-gradient-subtle` - Subtle background

**Shadows**:
- `shadow-soft` - Soft elevation
- `shadow-glow` - Glowing effect
- `shadow-elegant` - Elegant depth

### Button Variants

```tsx
// Available variants
<Button variant="default" />      // Primary action
<Button variant="destructive" />  // Dangerous action
<Button variant="outline" />      // Secondary action
<Button variant="secondary" />    // Tertiary action
<Button variant="ghost" />        // Minimal action
<Button variant="link" />         // Link-style
<Button variant="ai" />           // AI feature CTA

// Available sizes
<Button size="default" />
<Button size="sm" />
<Button size="lg" />
<Button size="icon" />
```

## Accessibility Patterns

### ARIA Labels

```tsx
// Navigation
<nav aria-label="Main navigation">
  <Button aria-label="Open menu">
    <Menu aria-hidden="true" />
  </Button>
</nav>

// Icons
<Button aria-label="Delete item">
  <Trash className="h-4 w-4" aria-hidden="true" />
</Button>

// Status
<div role="status" aria-live="polite">
  Loading...
</div>
```

### Keyboard Navigation

```tsx
// Ensure focusable elements
<Button tabIndex={0}>Accessible</Button>

// Skip to content link
<a href="#main-content" className="skip-link">
  Skip to content
</a>

// Keyboard handlers
<div
  role="button"
  tabIndex={0}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick();
    }
  }}
>
```

### Screen Reader Support

```tsx
// Descriptive text
<img alt="User avatar showing profile picture" />

// Loading states
<div role="status" aria-label="Loading content">
  <Spinner aria-hidden="true" />
  <span className="sr-only">Loading...</span>
</div>

// Current page indicator
<Link 
  to="/dashboard" 
  aria-current={isActive ? "page" : undefined}
>
```

## Performance Patterns

### Memoization

```tsx
// Expensive computation
const memoizedValue = useMemo(() => {
  return expensiveCalculation(data);
}, [data]);

// Callback stability
const handleClick = useCallback(() => {
  doSomething(value);
}, [value]);

// Component memoization
export const ExpensiveComponent = React.memo(({ data }) => {
  return <div>{/* ... */}</div>;
});
```

### Lazy Loading

```tsx
// Route-level code splitting
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));

// Component-level lazy loading
const HeavyChart = lazy(() => import('./components/HeavyChart'));

// Usage with Suspense
<Suspense fallback={<Skeleton />}>
  <HeavyChart data={data} />
</Suspense>
```

### Virtual Scrolling

```tsx
// For long lists (future implementation)
import { useVirtualizer } from '@tanstack/react-virtual';

const VirtualList = ({ items }) => {
  const parentRef = useRef();
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100,
  });
  
  return (
    <div ref={parentRef}>
      {virtualizer.getVirtualItems().map(virtualItem => (
        <div key={virtualItem.key}>
          {items[virtualItem.index]}
        </div>
      ))}
    </div>
  );
};
```

## Testing Patterns

### Component Testing (Future)

```tsx
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
  
  it('handles click events', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    screen.getByText('Click me').click();
    expect(handleClick).toHaveBeenCalledOnce();
  });
});
```

## Common Pitfalls to Avoid

### ❌ Don't: Direct DOM Manipulation
```tsx
// Bad
document.getElementById('element').style.display = 'none';

// Good
const [isVisible, setIsVisible] = useState(true);
{isVisible && <Component />}
```

### ❌ Don't: Inline Functions in Props
```tsx
// Bad (creates new function on every render)
<Button onClick={() => handleClick(id)}>

// Good
const handleButtonClick = useCallback(() => {
  handleClick(id);
}, [id]);
<Button onClick={handleButtonClick}>
```

### ❌ Don't: Prop Drilling
```tsx
// Bad
<Parent data={data}>
  <Child1 data={data}>
    <Child2 data={data}>
      <Child3 data={data} />

// Good - Use Context
const DataContext = createContext();
<DataContext.Provider value={data}>
  <Parent>
    <Child1>
      <Child2>
        <Child3 />
```

### ❌ Don't: Mutate State Directly
```tsx
// Bad
items.push(newItem);
setItems(items);

// Good
setItems([...items, newItem]);
```

### ❌ Don't: Use Index as Key
```tsx
// Bad
{items.map((item, index) => (
  <div key={index}>{item}</div>
))}

// Good
{items.map((item) => (
  <div key={item.id}>{item}</div>
))}
```

## Related Documentation

- [Architecture Overview](./ARCHITECTURE.md)
- [Database Schema](./DATABASE.md)
- [Styling Guide](./STYLING.md)
