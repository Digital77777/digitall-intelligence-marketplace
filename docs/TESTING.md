# Testing Guide

This project uses **Vitest** and **React Testing Library** for automated testing.

## Table of Contents

- [Running Tests](#running-tests)
- [Writing Tests](#writing-tests)
- [Testing Utilities](#testing-utilities)
- [Testing Best Practices](#testing-best-practices)
- [Coverage](#coverage)
- [Troubleshooting](#troubleshooting)

## Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

**Note:** You need to add these scripts to your `package.json`:

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage"
  }
}
```

## Writing Tests

### Component Tests

Component tests should be placed in a `__tests__` folder next to the component:

```
src/
  components/
    Button.tsx
    __tests__/
      Button.test.tsx
```

Example component test:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';
import { Button } from '../Button';

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('handles click events', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    
    render(<Button onClick={handleClick}>Click me</Button>);
    await user.click(screen.getByRole('button'));
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('can be disabled', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

### Utility Function Tests

Utility function tests should be placed in a `__tests__` folder next to the utility:

```
src/
  lib/
    utils.ts
    __tests__/
      utils.test.ts
```

Example utility test:

```tsx
import { describe, it, expect } from 'vitest';
import { cn } from '../utils';

describe('cn utility', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('handles conditional classes', () => {
    expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz');
  });
});
```

### Hook Tests

For testing custom hooks, use `@testing-library/react-hooks` patterns:

```tsx
import { renderHook, waitFor } from '@testing-library/react';
import { useAuth } from '../useAuth';

describe('useAuth', () => {
  it('returns user data when authenticated', async () => {
    const { result } = renderHook(() => useAuth());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(result.current.user).toBeDefined();
  });
});
```

## Testing Utilities

### Custom Render Function

Use the custom `render` function from `@/test/test-utils` to automatically wrap components with necessary providers:

```tsx
import { render, screen } from '@/test/test-utils';

// This automatically wraps your component with:
// - QueryClientProvider
// - BrowserRouter
render(<MyComponent />);
```

### Mocking

#### Mocking Modules

```tsx
import { vi } from 'vitest';

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: '1', email: 'test@example.com' },
    loading: false,
    signOut: vi.fn(),
  }),
}));
```

#### Mocking Supabase

```tsx
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }),
      signOut: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: mockData }),
    })),
  },
}));
```

## Testing Best Practices

### 1. Use Semantic Queries

Prefer queries that match how users interact with your app:

```tsx
// ✅ Good - accessible and semantic
screen.getByRole('button', { name: /submit/i });
screen.getByLabelText('Email address');
screen.getByText('Welcome back');

// ❌ Avoid - implementation details
screen.getByTestId('submit-button');
screen.getByClassName('btn-primary');
```

### 2. Test User Behavior, Not Implementation

```tsx
// ✅ Good - tests user interaction
it('submits form with valid data', async () => {
  const user = userEvent.setup();
  render(<LoginForm />);
  
  await user.type(screen.getByLabelText(/email/i), 'test@example.com');
  await user.type(screen.getByLabelText(/password/i), 'password123');
  await user.click(screen.getByRole('button', { name: /sign in/i }));
  
  expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
});

// ❌ Avoid - tests implementation details
it('calls handleSubmit when form is submitted', () => {
  const handleSubmit = vi.fn();
  render(<LoginForm onSubmit={handleSubmit} />);
  // ...
});
```

### 3. Use `userEvent` Over `fireEvent`

`userEvent` more closely simulates real user interactions:

```tsx
import userEvent from '@testing-library/user-event';

// ✅ Good
const user = userEvent.setup();
await user.click(button);
await user.type(input, 'Hello');

// ❌ Avoid
fireEvent.click(button);
fireEvent.change(input, { target: { value: 'Hello' } });
```

### 4. Wait for Async Operations

```tsx
import { waitFor } from '@testing-library/react';

// ✅ Good
await waitFor(() => {
  expect(screen.getByText(/loaded/i)).toBeInTheDocument();
});

// Also good for queries that wait automatically
expect(await screen.findByText(/loaded/i)).toBeInTheDocument();
```

### 5. Clean Up After Tests

Tests should be independent and not affect each other. The test setup file automatically runs `cleanup()` after each test.

### 6. Test Accessibility

```tsx
it('has accessible form labels', () => {
  render(<LoginForm />);
  
  expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
});

it('announces errors to screen readers', () => {
  render(<Form />);
  
  const alert = screen.getByRole('alert');
  expect(alert).toHaveTextContent('Please fix the following errors');
});
```

## Coverage

Generate a coverage report:

```bash
npm run test:coverage
```

Coverage thresholds can be configured in `vitest.config.ts`:

```ts
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
});
```

## Troubleshooting

### Tests Failing Due to Missing Mocks

If you see errors about missing browser APIs, add mocks to `src/test/setup.ts`:

```ts
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
} as any;
```

### Async Tests Timing Out

Increase the timeout in your test:

```tsx
it('loads data', async () => {
  // Test code
}, 10000); // 10 second timeout
```

### Module Resolution Issues

Ensure your `vitest.config.ts` has the correct path alias configuration:

```ts
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
  },
},
```

### Tests Pass Locally But Fail in CI

- Check for timezone issues with date mocking
- Ensure all dependencies are properly mocked
- Look for race conditions in async tests
- Verify environment variables are set correctly

## Additional Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library Documentation](https://testing-library.com/react)
- [Testing Library Queries Cheatsheet](https://testing-library.com/docs/queries/about)
- [Common Testing Mistakes](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
