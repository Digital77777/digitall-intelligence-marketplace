# Development Guide

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open browser
# http://localhost:5173
```

## Development Environment

### Required Tools

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Git**: For version control
- **VS Code** (recommended): With extensions below

### Recommended VS Code Extensions

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "styled-components.vscode-styled-components",
    "ms-vscode.vscode-typescript-next"
  ]
}
```

### Environment Variables

Create `.env` file in project root:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Optional: Development flags
VITE_DEV_MODE=true
VITE_ENABLE_ANALYTICS=false
```

## Project Structure

```
digital-intelligence-marketplace/
├── src/
│   ├── components/          # React components
│   │   ├── ui/             # Base UI components (shadcn)
│   │   ├── tier/           # Subscription tier components
│   │   ├── marketplace/    # Marketplace components
│   │   └── community/      # Community components
│   ├── pages/              # Route pages
│   │   ├── tools/          # AI tool pages
│   │   ├── course/         # Learning paths
│   │   └── community/      # Community pages
│   ├── hooks/              # Custom React hooks
│   ├── contexts/           # React contexts
│   ├── lib/                # Utilities and helpers
│   ├── integrations/       # External integrations
│   │   └── supabase/       # Supabase client
│   ├── types/              # TypeScript types
│   └── utils/              # Helper utilities
├── public/                 # Static assets
├── docs/                   # Documentation
├── supabase/               # Supabase configuration
│   ├── migrations/         # Database migrations
│   └── functions/          # Edge functions
└── [config files]          # Build and tooling config
```

## Development Scripts

```bash
# Development
npm run dev              # Start dev server with HMR
npm run build            # Production build
npm run preview          # Preview production build

# Code Quality
npm run lint             # Run ESLint
npm run type-check       # TypeScript type checking

# Supabase (if self-hosting)
npm run supabase:start   # Start local Supabase
npm run supabase:stop    # Stop local Supabase
npm run supabase:reset   # Reset database
```

## Common Development Tasks

### Creating a New Component

1. **Create component file**:
```bash
src/components/features/NewComponent.tsx
```

2. **Component template**:
```typescript
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface NewComponentProps {
  title: string;
  onAction?: () => void;
}

export const NewComponent = ({ title, onAction }: NewComponentProps) => {
  const [state, setState] = useState();
  
  return (
    <Card>
      <h2>{title}</h2>
      <Button onClick={onAction}>Action</Button>
    </Card>
  );
};
```

3. **Export from index** (if creating component library):
```typescript
// src/components/features/index.ts
export { NewComponent } from './NewComponent';
export { OtherComponent } from './OtherComponent';
```

### Creating a New Page

1. **Create page file**:
```bash
src/pages/NewFeaturePage.tsx
```

2. **Page template**:
```typescript
import { SEOHead } from '@/components/SEOHead';
import { NewComponent } from '@/components/features/NewComponent';

export default function NewFeaturePage() {
  return (
    <>
      <SEOHead 
        title="New Feature | Digital Intelligence"
        description="Description of new feature"
      />
      
      <div className="container mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold mb-8">New Feature</h1>
        <NewComponent />
      </div>
    </>
  );
}
```

3. **Add route** in `src/App.tsx`:
```typescript
// Import (lazy load if not critical)
const NewFeaturePage = lazy(() => import('./pages/NewFeaturePage'));

// Add to routeGroups
{ 
  path: "/new-feature", 
  component: NewFeaturePage, 
  protected: false 
}
```

### Creating a Custom Hook

1. **Create hook file**:
```bash
src/hooks/useNewFeature.tsx
```

2. **Hook template**:
```typescript
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useNewFeature = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    fetchData();
  }, []);
  
  const fetchData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('table_name')
        .select('*');
      
      if (error) throw error;
      setData(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };
  
  return { data, loading, error, refetch: fetchData };
};
```

### Adding a Database Table

1. **Create migration file**:
```bash
supabase/migrations/20241121000000_add_new_table.sql
```

2. **Migration template**:
```sql
-- Create table
CREATE TABLE IF NOT EXISTS new_table (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users,
  title TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE new_table ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own data"
  ON new_table FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own data"
  ON new_table FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_new_table_user_id ON new_table(user_id);
CREATE INDEX idx_new_table_created_at ON new_table(created_at);

-- Create trigger for updated_at
CREATE TRIGGER update_new_table_updated_at
  BEFORE UPDATE ON new_table
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

3. **Update TypeScript types** (auto-generated in production):
```bash
# If self-hosting
supabase gen types typescript --local > src/integrations/supabase/types.ts
```

### Styling Components

**Use semantic tokens**:
```tsx
// Colors
<div className="bg-background text-foreground">
<div className="bg-primary text-primary-foreground">
<div className="bg-muted text-muted-foreground">

// Gradients
<div className="bg-gradient-ai">
<div className="bg-gradient-learning">

// Shadows
<Card className="shadow-soft">
<Button className="shadow-glow">

// Transitions
<div className="transition-smooth">
```

**Responsive design**:
```tsx
<div className="
  grid 
  grid-cols-1        /* Mobile: 1 column */
  md:grid-cols-2     /* Tablet: 2 columns */
  lg:grid-cols-3     /* Desktop: 3 columns */
  gap-4              /* Spacing between items */
">
```

**Dark mode support**:
```tsx
<div className="
  bg-white dark:bg-gray-900
  text-black dark:text-white
">
```

## Debugging

### Browser DevTools

**React DevTools**:
- Install React DevTools extension
- Inspect component tree
- View props and state
- Profile performance

**Console Debugging**:
```typescript
// Development only
if (import.meta.env.DEV) {
  console.log('Debug info:', data);
}
```

### Network Debugging

**Supabase queries**:
```typescript
const { data, error } = await supabase
  .from('table')
  .select('*')
  .limit(10);

console.log('Query result:', { data, error });
```

**API calls**:
```typescript
// Monitor in Network tab
// Filter by 'Fetch/XHR'
// Check request/response details
```

### Common Errors

**"Module not found"**:
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**"Supabase connection failed"**:
```bash
# Check environment variables
cat .env

# Verify Supabase project is running
# Check Supabase dashboard
```

**"Type error"**:
```bash
# Run type checking
npm run type-check

# Check for missing type definitions
npm install -D @types/package-name
```

## Performance Optimization

### Bundle Analysis

```bash
# Analyze bundle size
npm run build
npx vite-bundle-visualizer
```

### Lazy Loading

```typescript
// Route-level code splitting
const HeavyPage = lazy(() => import('./pages/HeavyPage'));

// Component-level lazy loading
const HeavyChart = lazy(() => import('./components/HeavyChart'));

// Usage with Suspense
<Suspense fallback={<Skeleton />}>
  <HeavyChart data={data} />
</Suspense>
```

### Memoization

```typescript
// Expensive calculations
const memoizedValue = useMemo(() => {
  return expensiveFunction(data);
}, [data]);

// Callback stability
const handleClick = useCallback(() => {
  doSomething(value);
}, [value]);
```

### Image Optimization

```tsx
// Use appropriate formats
<img 
  src="/images/hero.webp"
  alt="Hero image"
  loading="lazy"
  width="1920"
  height="1080"
/>

// Responsive images
<picture>
  <source 
    srcSet="/images/hero-mobile.webp" 
    media="(max-width: 768px)" 
  />
  <img src="/images/hero.webp" alt="Hero" />
</picture>
```

## Testing Strategies

### Manual Testing Checklist

**Functionality**:
- ✅ Feature works as intended
- ✅ Edge cases handled
- ✅ Error states display correctly
- ✅ Loading states show

**Responsiveness**:
- ✅ Mobile (375px): Layout intact
- ✅ Tablet (768px): Layout adapts
- ✅ Desktop (1024px+): Full features

**Accessibility**:
- ✅ Keyboard navigation works
- ✅ Screen reader announces correctly
- ✅ Focus indicators visible
- ✅ ARIA labels present

**Performance**:
- ✅ No console errors
- ✅ Network requests optimized
- ✅ Page load under 3s
- ✅ Smooth animations

### Browser Testing

Test in:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile Safari (iOS)
- Chrome Mobile (Android)

## Git Workflow

### Daily Workflow

```bash
# Start of day: Update local repo
git checkout main
git pull origin main

# Create feature branch
git checkout -b feature/new-feature

# Make changes and commit frequently
git add .
git commit -m "feat: add new component"

# Push to remote
git push origin feature/new-feature

# Create PR when ready
# Via GitHub interface
```

### Commit Best Practices

```bash
# Atomic commits (one logical change)
git add src/components/NewComponent.tsx
git commit -m "feat: add NewComponent"

# Descriptive messages
git commit -m "fix: resolve auth token refresh issue"

# Reference issues
git commit -m "feat: add search feature (closes #123)"
```

## Troubleshooting

### Development Server Issues

**Port already in use**:
```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9

# Or use different port
npm run dev -- --port 3000
```

**Hot reload not working**:
```bash
# Restart dev server
Ctrl+C
npm run dev

# Clear Vite cache
rm -rf node_modules/.vite
```

### Build Issues

**Build fails**:
```bash
# Check for TypeScript errors
npm run type-check

# Check for linting errors
npm run lint

# Clear cache and rebuild
rm -rf dist node_modules/.vite
npm run build
```

### Database Issues

**Migration fails**:
```sql
-- Check current migrations
SELECT * FROM supabase_migrations.schema_migrations;

-- Rollback if needed (manually in Supabase SQL editor)
-- Then fix migration and rerun
```

**RLS policy errors**:
```sql
-- Test policy as specific user
SET LOCAL "request.jwt.claims" TO '{"sub": "user-id-here"}';
SELECT * FROM protected_table;
```

## Resources

### Documentation
- [React Docs](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [TanStack Query](https://tanstack.com/query/latest/docs/react/overview)

### Internal Docs
- [Architecture Guide](./ARCHITECTURE.md)
- [Component Patterns](./COMPONENTS.md)
- [Database Schema](./DATABASE.md)
- [Contributing Guide](./CONTRIBUTING.md)

### Tools
- [VS Code](https://code.visualstudio.com/)
- [React DevTools](https://react.dev/learn/react-developer-tools)
- [Supabase Studio](https://supabase.com/docs/guides/platform)

## Getting Help

1. **Check documentation** in `docs/` folder
2. **Search existing issues** on GitHub
3. **Create new issue** with reproduction steps
4. **Ask in discussions** for general questions

Happy coding! 🚀
