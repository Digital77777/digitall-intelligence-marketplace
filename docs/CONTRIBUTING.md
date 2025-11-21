# Contributing Guide

## Welcome

Thank you for considering contributing to the Digital Intelligence Marketplace! This document provides guidelines and best practices for contributing to the project.

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git
- A Supabase account (for backend features)
- Basic knowledge of React, TypeScript, and Tailwind CSS

### Local Setup

1. **Clone the repository** (if using GitHub integration):
```bash
git clone <repository-url>
cd digital-intelligence-marketplace
```

2. **Install dependencies**:
```bash
npm install
```

3. **Set up environment variables**:
```bash
cp .env.example .env
# Edit .env with your Supabase credentials
```

4. **Start development server**:
```bash
npm run dev
```

5. **Open in browser**:
```
http://localhost:5173
```

## Development Workflow

### Branch Strategy

```
main (production-ready code)
  ↓
feature/feature-name    # New features
bugfix/bug-name         # Bug fixes
hotfix/critical-fix     # Critical production fixes
```

### Workflow Steps

1. **Create a feature branch**:
```bash
git checkout -b feature/add-new-tool
```

2. **Make your changes**:
   - Write code following our patterns (see below)
   - Test your changes thoroughly
   - Update documentation if needed

3. **Commit your changes**:
```bash
git add .
git commit -m "feat: add new AI tool feature"
```

4. **Push to remote**:
```bash
git push origin feature/add-new-tool
```

5. **Create a pull request**:
   - Describe your changes
   - Link related issues
   - Request reviews

## Code Style & Standards

### TypeScript Guidelines

**Use explicit types**:
```typescript
// ✅ Good
interface UserProfile {
  id: string;
  name: string;
  email: string;
}

const fetchProfile = async (id: string): Promise<UserProfile> => {
  // ...
};

// ❌ Bad
const fetchProfile = async (id) => {
  // ...
};
```

**Prefer interfaces over types for objects**:
```typescript
// ✅ Good
interface CardProps {
  title: string;
  description?: string;
}

// ⚠️ Less preferred
type CardProps = {
  title: string;
  description?: string;
};
```

### Component Guidelines

**File organization**:
```typescript
// 1. Imports (grouped)
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

import { fetchData } from '@/lib/api';
import type { DataType } from '@/types';

// 2. Types/Interfaces
interface ComponentProps {
  data: DataType;
  onAction: () => void;
}

// 3. Component
export const Component = ({ data, onAction }: ComponentProps) => {
  // 4. Hooks
  const [state, setState] = useState();
  const { data: apiData } = useQuery();
  
  // 5. Effects
  useEffect(() => {
    // ...
  }, []);
  
  // 6. Handlers
  const handleClick = () => {
    // ...
  };
  
  // 7. Render
  return (
    <div>
      {/* ... */}
    </div>
  );
};
```

**Naming conventions**:
- Components: `PascalCase` (e.g., `UserProfile`)
- Files: `PascalCase.tsx` for components
- Hooks: `camelCase` starting with `use` (e.g., `useAuth`)
- Functions: `camelCase` (e.g., `fetchUserData`)
- Constants: `UPPER_SNAKE_CASE` (e.g., `MAX_RETRIES`)

### Design System Usage

**Always use semantic tokens**:
```tsx
// ✅ Good
<div className="bg-background text-foreground border-border">
  <Button variant="primary" className="bg-gradient-ai">
    Action
  </Button>
</div>

// ❌ Bad
<div className="bg-white text-black border-gray-300">
  <button className="bg-blue-500 hover:bg-blue-600">
    Action
  </button>
</div>
```

**Available design tokens**:
- Colors: `primary`, `secondary`, `accent`, `muted`, `destructive`
- Gradients: `bg-gradient-ai`, `bg-gradient-learning`, `bg-gradient-earn`
- Shadows: `shadow-soft`, `shadow-glow`, `shadow-elegant`
- Transitions: `transition-smooth`

### Accessibility Requirements

**All contributions must be accessible**:

1. **ARIA labels** for icon buttons:
```tsx
<Button aria-label="Delete item">
  <Trash className="h-4 w-4" aria-hidden="true" />
</Button>
```

2. **Keyboard navigation**:
```tsx
<div
  role="button"
  tabIndex={0}
  onKeyDown={(e) => {
    if (e.key === 'Enter') handleClick();
  }}
>
```

3. **Screen reader support**:
```tsx
<img alt="Descriptive text" />
<span className="sr-only">Hidden but announced</span>
```

4. **Focus management**:
```tsx
<input ref={inputRef} />
// Focus on mount
useEffect(() => {
  inputRef.current?.focus();
}, []);
```

### Error Handling

**Use centralized error handler**:
```typescript
import { handleError } from '@/lib/errorHandler';

try {
  await riskyOperation();
} catch (error) {
  handleError(error, 'Feature context');
}
```

**Provide user feedback**:
```typescript
import { toast } from 'sonner';

toast.success('Operation completed!');
toast.error('Something went wrong');
toast.loading('Processing...');
```

### Form Validation

**Use Zod schemas from validation library**:
```typescript
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { emailSchema } from '@/lib/validationSchemas';

const form = useForm({
  resolver: zodResolver(emailSchema),
});
```

## Database Changes

### Creating Migrations

**Location**: `supabase/migrations/`

**Naming**: `YYYYMMDDHHMMSS_description.sql`

**Example migration**:
```sql
-- Migration: Add tags to marketplace listings
-- Created: 2024-11-21

ALTER TABLE marketplace_listings 
ADD COLUMN IF NOT EXISTS tags TEXT[];

-- Create index for search
CREATE INDEX IF NOT EXISTS idx_listings_tags 
ON marketplace_listings USING GIN(tags);

-- Add RLS policy
CREATE POLICY "Anyone can view listing tags"
ON marketplace_listings FOR SELECT
USING (true);
```

**Always include**:
- RLS policies for new tables
- Indexes for commonly queried columns
- Constraints for data integrity
- Triggers for auto-updated timestamps

### Testing Database Changes

1. **Test in development**:
```bash
# Apply migration locally
supabase db push
```

2. **Verify RLS policies**:
```sql
-- Test as specific user
SET LOCAL "request.jwt.claims" TO '{"sub": "user-id"}';
SELECT * FROM new_table;  -- Should only return user's data
```

3. **Check performance**:
```sql
EXPLAIN ANALYZE
SELECT * FROM new_table WHERE condition;
```

## Testing Guidelines

### Manual Testing Checklist

Before submitting a PR, test:

- ✅ Feature works as expected
- ✅ No console errors
- ✅ Mobile responsive (test at 375px, 768px, 1024px)
- ✅ Keyboard navigation works
- ✅ Screen reader compatible
- ✅ Loading states display correctly
- ✅ Error states handled gracefully
- ✅ Works in both light/dark mode (if applicable)

### Future: Automated Testing

```typescript
// Example unit test
describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
  
  it('handles clicks', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    userEvent.click(screen.getByText('Click'));
    expect(handleClick).toHaveBeenCalled();
  });
});
```

## Documentation Requirements

### Code Documentation

**Component documentation**:
```typescript
/**
 * TierGate - Restricts access to features based on subscription tier
 * 
 * @param feature - The feature to gate access to
 * @param children - Content to show when access is granted
 * @param fallback - Optional fallback for denied access
 * 
 * @example
 * <TierGate feature="advanced_analytics">
 *   <AnalyticsDashboard />
 * </TierGate>
 */
export const TierGate = ({ feature, children, fallback }: TierGateProps) => {
  // ...
};
```

**Complex function documentation**:
```typescript
/**
 * Calculates user's total earnings from marketplace sales
 * 
 * @param userId - The user's unique identifier
 * @param dateRange - Optional date range for filtering
 * @returns Promise resolving to total earnings in USD
 * 
 * @throws {Error} If user is not found or has no seller profile
 */
export const calculateEarnings = async (
  userId: string,
  dateRange?: DateRange
): Promise<number> => {
  // ...
};
```

### README Updates

When adding new features, update relevant READMEs:

- Main `README.md` - High-level overview
- Feature-specific docs in `docs/`
- Component README if creating new component library

## Commit Message Guidelines

Follow conventional commits:

```
type(scope): subject

body (optional)

footer (optional)
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding/updating tests
- `chore`: Maintenance tasks

**Examples**:
```bash
feat(marketplace): add listing favorites feature

fix(auth): resolve token refresh issue

docs(api): update database schema documentation

refactor(components): extract shared tier components
```

## Pull Request Process

### PR Title Format

```
[Type] Brief description
```

Examples:
- `[Feature] Add AI tool marketplace filtering`
- `[Fix] Resolve navigation mobile menu issue`
- `[Docs] Add component patterns documentation`

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] New feature
- [ ] Bug fix
- [ ] Documentation
- [ ] Refactoring
- [ ] Performance improvement

## Testing
- [ ] Tested on desktop
- [ ] Tested on mobile
- [ ] Tested keyboard navigation
- [ ] Tested with screen reader
- [ ] No console errors

## Screenshots
(if applicable)

## Related Issues
Closes #123
Related to #456

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-reviewed code
- [ ] Commented complex logic
- [ ] Updated documentation
- [ ] No breaking changes (or documented if necessary)
```

### Review Process

1. **Self-review** your changes first
2. **Request reviews** from maintainers
3. **Address feedback** promptly
4. **Resolve conflicts** if any
5. **Wait for approval** before merging

## Common Issues & Solutions

### Issue: "Module not found"
**Solution**: Check import paths use `@/` alias
```typescript
// ✅ Good
import { Button } from '@/components/ui/button';

// ❌ Bad
import { Button } from '../../../components/ui/button';
```

### Issue: "Type error in component"
**Solution**: Ensure proper TypeScript types
```typescript
// Define prop types
interface Props {
  title: string;
  onAction?: () => void;
}

export const Component = ({ title, onAction }: Props) => {
  // ...
};
```

### Issue: "Supabase connection error"
**Solution**: Check environment variables
```bash
# Verify .env file has correct values
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx
```

### Issue: "Build fails in production"
**Solution**: Check for:
- Unused imports
- Console.log statements
- Missing types
- Dynamic requires

## Getting Help

### Resources
- **Documentation**: Check `docs/` folder
- **Component Examples**: Browse existing components
- **Design System**: See `src/index.css` and `tailwind.config.ts`

### Communication
- Create an issue for bugs
- Discuss features before implementing
- Ask questions in PRs

## Code of Conduct

### Our Standards

**Be respectful**:
- Use welcoming and inclusive language
- Respect differing viewpoints
- Accept constructive criticism gracefully

**Be collaborative**:
- Help others when possible
- Share knowledge and best practices
- Provide helpful code reviews

**Be professional**:
- Keep discussions focused on technical merit
- Avoid personal attacks or harassment
- Assume good intentions

## Recognition

Contributors will be recognized in:
- Project README
- Release notes
- Community acknowledgments

Thank you for contributing! 🎉
