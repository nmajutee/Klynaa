# Klynaa Frontend - Enterprise Architecture

> **🚀 Enterprise-grade React/Next.js architecture with TypeScript, CSS Modules, and modular design**

This document outlines the new enterprise-standard architecture for the Klynaa waste management platform frontend. The codebase has been refactored from a flat structure to a modular, scalable architecture following industry best practices.

## 📋 Table of Contents

- [Architecture Overview](#architecture-overview)
- [Folder Structure](#folder-structure)
- [Design System](#design-system)
- [Component Architecture](#component-architecture)
- [Service Layer](#service-layer)
- [State Management](#state-management)
- [Development Guide](#development-guide)
- [Migration Guide](#migration-guide)
- [Testing](#testing)
- [Best Practices](#best-practices)

## 🏗️ Architecture Overview

### Core Principles

- **Modular Design**: Features organized by domain with clear separation of concerns
- **Type Safety**: Strict TypeScript with comprehensive type definitions
- **Component Isolation**: CSS Modules prevent style conflicts and enable reusability
- **Service Layer**: Centralized API communication with proper error handling
- **Custom Hooks**: Reusable logic extraction for clean, maintainable components
- **Accessibility First**: WCAG 2.1 compliant components with proper ARIA support

### Technology Stack

- **Framework**: Next.js 15.5.3 with React 18
- **Language**: TypeScript with strict configuration
- **Styling**: CSS Modules + CSS Custom Properties (Design Tokens)
- **HTTP Client**: Axios with interceptors for auth and error handling
- **State Management**: React hooks with custom abstractions
- **Testing**: Jest + React Testing Library (planned)

## 📁 Folder Structure

```
frontend/src/
├── components/           # Reusable UI components
│   ├── buttons/         # Button variants and controls
│   ├── cards/           # Card containers and layouts
│   ├── forms/           # Form inputs and validation
│   ├── layout/          # Layout components (Header, Sidebar, etc.)
│   └── index.ts         # Component exports
├── features/            # Domain-specific features
│   ├── auth/            # Authentication flows
│   ├── dashboard/       # Dashboard implementations
│   │   ├── admin/       # Admin dashboard components
│   │   ├── customer/    # Customer dashboard components
│   │   └── worker/      # Worker dashboard components
│   └── maps/            # Map and location features
├── hooks/               # Custom React hooks
│   ├── useAuth.ts       # Authentication state management
│   ├── useApi.ts        # API call abstractions
│   ├── useLocalStorage.ts # Browser storage management
│   └── index.ts         # Hook exports
├── lib/                 # Utility libraries and configurations
│   ├── http-client.ts   # Axios HTTP client with interceptors
│   └── utils.ts         # Helper functions and utilities
├── services/            # API service layer
│   ├── auth.service.ts  # Authentication API calls
│   ├── bins.service.ts  # Bin management API calls
│   ├── pickups.service.ts # Pickup management API calls
│   └── index.ts         # Service exports
├── styles/              # Global styles and design system
│   ├── base/            # Foundation styles
│   │   ├── _variables.css # CSS custom properties (design tokens)
│   │   ├── _reset.css     # CSS reset and normalization
│   │   ├── _typography.css # Font scales and text utilities
│   │   └── _layout.css    # Layout utilities and grid system
│   └── index.css        # Main stylesheet entry point
├── types/               # TypeScript type definitions
│   └── index.ts         # All application types
└── tests/               # Test utilities and configurations
    ├── __mocks__/       # Mock implementations
    ├── setup.ts         # Test environment setup
    └── utils.ts         # Test helper functions
```

## 🎨 Design System

### CSS Custom Properties (Design Tokens)

The design system is built on CSS custom properties for consistency and maintainability:

```css
/* Brand Colors */
--klynaa-primary: #0fa6a6;
--klynaa-primary-light: #4dd4d4;
--klynaa-primary-dark: #0d8a8a;

/* Typography Scale */
--font-size-xs: 0.75rem;   /* 12px */
--font-size-sm: 0.875rem;  /* 14px */
--font-size-base: 1rem;    /* 16px */
--font-size-lg: 1.125rem;  /* 18px */

/* Spacing System */
--spacing-1: 0.25rem;  /* 4px */
--spacing-2: 0.5rem;   /* 8px */
--spacing-4: 1rem;     /* 16px */
--spacing-6: 1.5rem;   /* 24px */
```

### Typography System

Responsive typography with consistent scaling:

```css
.klynaa-text-h1 { font-size: clamp(1.75rem, 4vw, 2.5rem); }
.klynaa-text-h2 { font-size: clamp(1.5rem, 3vw, 2rem); }
.klynaa-text-body { font-size: var(--font-size-base); }
```

### Layout Utilities

CSS Modules provide utility classes for consistent layouts:

```css
.container { max-width: var(--max-width-7xl); margin: 0 auto; }
.grid { display: grid; gap: var(--spacing-4); }
.flex { display: flex; align-items: center; }
```

## 🧩 Component Architecture

### Component Structure

Every component follows this structure:

```typescript
// Component.tsx
import React from 'react';
import { ComponentProps } from '@/types';
import styles from './Component.module.css';

const Component: React.FC<ComponentProps> = ({ prop1, prop2 }) => {
  return (
    <div className={styles.component}>
      {/* Component JSX */}
    </div>
  );
};

export default Component;
```

### CSS Modules Pattern

Each component has its own stylesheet:

```css
/* Component.module.css */
.component {
  padding: var(--spacing-4);
  border-radius: var(--border-radius-md);
  background: var(--color-white);
}

.variant {
  background: var(--klynaa-primary);
  color: var(--color-white);
}
```

### Example: Button Component

```typescript
// Usage
import { Button } from '@/components';

<Button variant="primary" size="lg" onClick={handleSubmit}>
  Save Changes
</Button>
```

## 🔧 Service Layer

### HTTP Client

Centralized Axios instance with authentication and error handling:

```typescript
// lib/http-client.ts
export class HttpClient {
  private client: AxiosInstance;

  async get<T>(url: string): Promise<ApiResponse<T>> {
    // Automatic token attachment and error transformation
  }
}

export const httpClient = new HttpClient();
```

### Service Classes

Domain-specific services with consistent interfaces:

```typescript
// services/auth.service.ts
export class AuthService {
  async login(credentials: LoginForm) {
    const response = await httpClient.post('/auth/login/', credentials);
    httpClient.setTokens(response.data.access, response.data.refresh);
    return response.data;
  }
}

export const authService = new AuthService();
```

### Usage Example

```typescript
// In components
import { authService } from '@/services';

const handleLogin = async (credentials: LoginForm) => {
  try {
    const result = await authService.login(credentials);
    // Handle success
  } catch (error) {
    // Handle error
  }
};
```

## 🎣 Custom Hooks

### useAuth Hook

Complete authentication state management:

```typescript
const { user, login, logout, isLoading, error } = useAuth();
```

### useApi Hook

Generic API call management:

```typescript
const { data, loading, execute } = useApi(
  () => binsService.getBins(),
  { immediate: true }
);
```

### useLocalStorage Hook

Persistent browser storage:

```typescript
const [theme, setTheme] = useLocalStorage('theme', 'light');
```

## 🚀 Development Guide

### Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Build for Production**
   ```bash
   npm run build
   ```

### Adding New Components

1. Create component folder in appropriate directory
2. Add TypeScript interface to `/src/types/index.ts`
3. Implement component with CSS modules
4. Export from component index file
5. Write tests (planned)

### Creating New Services

1. Define service class in `/src/services/`
2. Use httpClient for API communication
3. Add proper TypeScript types
4. Export from service index
5. Write integration tests (planned)

## 📝 Migration Guide

### From Old Structure

#### Component Migration

**Before:**
```typescript
// components/ui/Button.tsx
export default function Button({ ... }) {
  return <button className="bg-green-600 ...">
}
```

**After:**
```typescript
// src/components/buttons/Button.tsx
import styles from './Button.module.css';

const Button: React.FC<ButtonProps> = ({ variant, ...props }) => {
  return <button className={styles[variant]}>
}
```

#### Service Migration

**Before:**
```typescript
// services/api.ts
export const loginUser = async (data) => {
  return axios.post('/api/auth/login/', data);
}
```

**After:**
```typescript
// src/services/auth.service.ts
export class AuthService {
  async login(credentials: LoginForm) {
    return httpClient.post('/auth/login/', credentials);
  }
}
```

### Import Updates

Update imports to use new structure:

```typescript
// Old imports
import Button from '../components/ui/Button';
import { loginUser } from '../services/api';

// New imports
import { Button } from '@/components';
import { authService } from '@/services';
```

## 🧪 Testing

### Test Structure

```
src/tests/
├── components/          # Component tests
├── hooks/              # Hook tests
├── services/           # Service tests
├── utils/              # Test utilities
└── setup.ts            # Test configuration
```

### Component Testing

```typescript
import { render, screen } from '@testing-library/react';
import { Button } from '@/components';

test('renders button with correct text', () => {
  render(<Button>Click me</Button>);
  expect(screen.getByText('Click me')).toBeInTheDocument();
});
```

## 📚 Best Practices

### TypeScript

- Use strict TypeScript configuration
- Define interfaces for all props and data structures
- Avoid `any` type - prefer `unknown` for flexibility
- Use utility types for transformations

### CSS Modules

- Use semantic class names (`.submitButton` not `.greenBtn`)
- Follow BEM-like conventions within modules
- Leverage CSS custom properties for consistency
- Keep styles close to components

### Component Design

- Single Responsibility Principle - one component, one purpose
- Composition over inheritance - use children and render props
- Prop drilling avoidance - use appropriate state management
- Accessibility considerations - ARIA labels, keyboard navigation

### Performance

- Use React.memo() for expensive components
- Implement proper loading states
- Optimize images and assets
- Code splitting for large features

## 🔄 Future Enhancements

### Planned Additions

- [ ] Storybook integration for component documentation
- [ ] End-to-end testing with Playwright
- [ ] Performance monitoring and analytics
- [ ] Progressive Web App features
- [ ] Internationalization (i18n) support
- [ ] Dark mode theming
- [ ] Component library publishing

### Architecture Evolution

- **Micro-frontends**: Potential split into domain-specific applications
- **State Management**: Introduction of Zustand or Redux Toolkit if complexity increases
- **Build Optimization**: Module federation for better code sharing
- **Testing**: Visual regression testing with Chromatic

## 📞 Support

For questions about the new architecture:

1. **Documentation**: Check this README and inline code comments
2. **Type Definitions**: Review `/src/types/index.ts` for data structures
3. **Examples**: Look at existing components for implementation patterns
4. **Code Review**: Ensure all changes follow established patterns

---

**🌟 This architecture provides a solid foundation for scaling the Klynaa platform while maintaining code quality, developer experience, and user accessibility.**