# Testing Setup Guide

## Installation

Install the required testing dependencies:

```bash
npm install -D vitest @vitest/ui @vitejs/plugin-react
npm install -D @testing-library/react @testing-library/jest-dom @testing-library/user-event
npm install -D jsdom
npm install -D fast-check
npm install -D @types/node
```

## Configuration Files

The following configuration files have been created:

- `vitest.config.ts` - Vitest configuration
- `src/test/setup.ts` - Test setup and global mocks
- `src/test/utils.tsx` - Custom render utilities
- `src/test/mockData.ts` - Mock data for tests

## Running Tests

Add these scripts to `package.json`:

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage"
  }
}
```

Then run:

```bash
# Run tests in watch mode
npm test

# Run tests once
npm run test:run

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

## Writing Tests

### Unit Test Example

```typescript
// src/components/ui/__tests__/Button.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@/test/utils';
import Button from '../Button';

describe('Button', () => {
  it('renders button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByText('Click me')).toBeDisabled();
  });
});
```

### Property-Based Test Example

```typescript
// src/lib/utils/__tests__/slug.property.test.ts
import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { generateSlug } from '../slug';

describe('Slug Generation Properties', () => {
  it('should always produce lowercase output', () => {
    fc.assert(
      fc.property(fc.string(), (input) => {
        const slug = generateSlug(input);
        expect(slug).toBe(slug.toLowerCase());
      }),
      { numRuns: 100 }
    );
  });

  it('should not contain spaces', () => {
    fc.assert(
      fc.property(fc.string(), (input) => {
        const slug = generateSlug(input);
        expect(slug).not.toContain(' ');
      }),
      { numRuns: 100 }
    );
  });

  it('should be idempotent', () => {
    fc.assert(
      fc.property(fc.string(), (input) => {
        const slug1 = generateSlug(input);
        const slug2 = generateSlug(slug1);
        expect(slug1).toBe(slug2);
      }),
      { numRuns: 100 }
    );
  });
});
```

### Component Test with API Mocking

```typescript
// src/components/islands/__tests__/PostTable.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/test/utils';
import { mockPost, mockPaginatedResponse } from '@/test/mockData';
import PostTable from '../PostTable';
import * as postsApi from '@/lib/api/posts';

vi.mock('@/lib/api/posts');

describe('PostTable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('displays loading state initially', () => {
    vi.mocked(postsApi.postsApi.getAll).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(<PostTable />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('displays posts after loading', async () => {
    vi.mocked(postsApi.postsApi.getAll).mockResolvedValue({
      data: mockPaginatedResponse([mockPost]),
    });

    render(<PostTable />);

    await waitFor(() => {
      expect(screen.getByText('Test Post')).toBeInTheDocument();
    });
  });

  it('displays error message on API failure', async () => {
    vi.mocked(postsApi.postsApi.getAll).mockRejectedValue(
      new Error('API Error')
    );

    render(<PostTable />);

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });
});
```

## Test Organization

```
src/
├── components/
│   ├── islands/
│   │   ├── PostTable.tsx
│   │   └── __tests__/
│   │       └── PostTable.test.tsx
│   └── ui/
│       ├── Button.tsx
│       └── __tests__/
│           └── Button.test.tsx
├── lib/
│   ├── api/
│   │   ├── posts.ts
│   │   └── __tests__/
│   │       └── posts.test.ts
│   └── utils/
│       ├── slug.ts
│       └── __tests__/
│           ├── slug.test.ts
│           └── slug.property.test.ts
└── test/
    ├── setup.ts
    ├── utils.tsx
    └── mockData.ts
```

## Best Practices

### 1. Test Naming
- Use descriptive test names that explain what is being tested
- Follow the pattern: "should [expected behavior] when [condition]"

### 2. Arrange-Act-Assert
```typescript
it('should update status when button is clicked', () => {
  // Arrange
  const handleUpdate = vi.fn();
  render(<StatusButton onUpdate={handleUpdate} />);
  
  // Act
  fireEvent.click(screen.getByRole('button'));
  
  // Assert
  expect(handleUpdate).toHaveBeenCalled();
});
```

### 3. Mock External Dependencies
- Mock API calls
- Mock localStorage
- Mock window methods (alert, confirm, etc.)

### 4. Test User Interactions
- Use `@testing-library/user-event` for realistic user interactions
- Test keyboard navigation
- Test form submissions

### 5. Property-Based Testing
- Use for utility functions
- Test invariants and properties
- Run at least 100 iterations

### 6. Coverage Goals
- Aim for 80%+ coverage on critical paths
- Focus on business logic
- Don't obsess over 100% coverage

## Common Testing Patterns

### Testing Forms
```typescript
it('submits form with valid data', async () => {
  const handleSubmit = vi.fn();
  render(<MyForm onSubmit={handleSubmit} />);
  
  await userEvent.type(screen.getByLabelText('Name'), 'John Doe');
  await userEvent.type(screen.getByLabelText('Email'), 'john@example.com');
  await userEvent.click(screen.getByRole('button', { name: /submit/i }));
  
  expect(handleSubmit).toHaveBeenCalledWith({
    name: 'John Doe',
    email: 'john@example.com',
  });
});
```

### Testing Async Operations
```typescript
it('loads and displays data', async () => {
  render(<DataComponent />);
  
  expect(screen.getByText(/loading/i)).toBeInTheDocument();
  
  await waitFor(() => {
    expect(screen.getByText('Data loaded')).toBeInTheDocument();
  });
});
```

### Testing Error States
```typescript
it('displays error message on failure', async () => {
  vi.mocked(api.getData).mockRejectedValue(new Error('Failed'));
  
  render(<DataComponent />);
  
  await waitFor(() => {
    expect(screen.getByText(/error/i)).toBeInTheDocument();
  });
});
```

## Troubleshooting

### Issue: "Cannot find module '@/...'"
**Solution**: Check that path aliases in `vitest.config.ts` match `tsconfig.json`

### Issue: "localStorage is not defined"
**Solution**: Ensure `src/test/setup.ts` is included in vitest config

### Issue: "window is not defined"
**Solution**: Set `environment: 'jsdom'` in vitest config

### Issue: Tests are slow
**Solution**: 
- Use `vi.mock()` to mock heavy dependencies
- Avoid unnecessary `waitFor()` calls
- Use `screen.getByRole()` instead of `waitFor()`

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [fast-check Documentation](https://fast-check.dev/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
