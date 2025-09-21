# Klynaa Design System

A comprehensive, accessible, and scalable design system built with React, TypeScript, and Tailwind CSS for the Klynaa waste management platform.

## Overview

This design system provides a complete set of reusable components, design tokens, and utilities to ensure consistency and efficiency across all Klynaa applications.

## Features

### 🎨 Design Tokens
- **Colors**: Primary (green), secondary (cyan), semantic colors (success, warning, error)
- **Typography**: Comprehensive text styles with semantic variants
- **Spacing**: Consistent spacing scale based on 4px grid
- **Shadows**: Layered shadow system for depth hierarchy
- **Border Radius**: Consistent corner radius values

### 🧩 Components

#### Core Components
- **Typography** (`Heading`, `Text`) - Semantic text components with proper hierarchy
- **Button** (`Button`, `IconButton`, `ButtonGroup`, `FAB`) - Comprehensive button system
- **Form** (`Input`, `TextArea`, `Select`, `Checkbox`, `Radio`, `Switch`, `FormField`) - Complete form components
- **Card** (`Card`, `StatsCard`, `FeatureCard`, `PricingCard`) - Flexible card system

#### Navigation
- **Header** - Application header with logo, navigation, and actions
- **Sidebar** - Collapsible sidebar navigation
- **Breadcrumb** - Hierarchical navigation
- **Tabs** - Tab navigation with multiple variants
- **NavLink** - Styled navigation links

#### Data & Interaction
- **Icons** - Comprehensive icon library with waste management specific icons
- **SearchBar** - Advanced search with suggestions and filtering
- **Filter** - Complete filtering system with multiple input types
- **Sort** - Sorting controls and options

#### Widgets & Display
- **Widget** - Base widget container with title, actions, and collapsible state
- **StatsWidget** - Statistical data display with trends
- **ChartWidget** - Chart container (ready for chart library integration)
- **ActivityFeedWidget** - Activity timeline and notifications
- **QuickActionsWidget** - Action shortcuts and buttons
- **ProgressWidget** - Progress indicators and status displays
- **NotificationWidget** - Notification center and alerts

#### Layout
- **Container** - Responsive container with size variants
- **Grid** - CSS Grid system with responsive breakpoints
- **Flex** - Flexbox utilities with alignment options
- **Stack** - Vertical flex container with spacing
- **Divider** - Visual separators with variants
- **Section** - Page sections with consistent spacing
- **AspectRatio** - Maintain aspect ratios for media
- **Center** - Center content horizontally and/or vertically
- **Box** - Generic container with styling props

## Architecture

### Component Structure
```
src/design-system/
├── tokens.ts                    # Design tokens and CSS variables
├── components/
│   ├── Typography.tsx          # Text and heading components
│   ├── Button.tsx              # Button variations and groups
│   ├── Form.tsx                # Form inputs and controls
│   ├── Card.tsx                # Card containers and variants
│   ├── Navigation.tsx          # Navigation components
│   ├── Icons.tsx               # Icon system and library
│   ├── Filter.tsx              # Search and filtering
│   ├── Widget.tsx              # Widget containers and types
│   └── Layout.tsx              # Layout and spacing utilities
├── index.ts                    # Main exports
└── ComponentShowcase.tsx       # Documentation and examples
```

### Technology Stack
- **React** - Component library framework
- **TypeScript** - Type safety and better developer experience
- **Tailwind CSS** - Utility-first styling approach
- **Class Variance Authority (CVA)** - Component variant management
- **clsx/tailwind-merge** - Conditional className utilities

## Usage

### Basic Import
```tsx
import { Button, Card, Heading, Icons } from '@/design-system';

function MyComponent() {
  return (
    <Card>
      <Heading level={2}>Welcome to Klynaa</Heading>
      <Button variant="primary">
        <Icons.Recycle size="sm" />
        Start Recycling
      </Button>
    </Card>
  );
}
```

### Form Example
```tsx
import { FormField, Input, Button, Stack } from '@/design-system';

function LoginForm() {
  return (
    <form>
      <Stack spacing={4}>
        <FormField label="Email" helperText="Enter your email address">
          <Input type="email" placeholder="you@example.com" />
        </FormField>

        <FormField label="Password">
          <Input type="password" placeholder="••••••••" />
        </FormField>

        <Button variant="primary" type="submit">
          Sign In
        </Button>
      </Stack>
    </form>
  );
}
```

### Layout Example
```tsx
import { Container, Grid, Stack, Widget } from '@/design-system';

function Dashboard() {
  return (
    <Container>
      <Stack spacing={8}>
        <Grid cols={3} gap={6} responsive>
          <Widget title="Statistics">
            {/* Widget content */}
          </Widget>
          <Widget title="Recent Activity">
            {/* Widget content */}
          </Widget>
          <Widget title="Quick Actions">
            {/* Widget content */}
          </Widget>
        </Grid>
      </Stack>
    </Container>
  );
}
```

## Design Principles

### Accessibility First
- All components follow WCAG 2.1 AA guidelines
- Proper ARIA labels and semantic HTML
- Keyboard navigation support
- Screen reader compatibility

### Consistency
- Unified design language across all components
- Consistent naming conventions
- Predictable component APIs
- Standard spacing and sizing scales

### Flexibility
- Extensive customization through props
- Multiple variants for different use cases
- Composable components that work together
- Theme customization support

### Performance
- Tree-shakable exports
- Optimized bundle sizes
- Minimal runtime overhead
- Efficient re-renders

## Waste Management Specific Features

### Specialized Icons
- Trash bins and waste containers
- Recycling symbols and materials
- Collection trucks and vehicles
- Environmental and eco-friendly icons
- Location and mapping icons

### Color Palette
- **Primary Green** (#059669): Eco-friendly, environmental focus
- **Secondary Cyan** (#0891b2): Clean, fresh, water-like
- **Success Green**: Completed pickups, successful recycling
- **Warning Orange**: Missed collections, attention needed
- **Error Red**: Failed processes, urgent issues

### Component Variants
- Status indicators for pickup stages
- Progress tracking for waste collection
- Environmental impact displays
- Route optimization visuals
- Sustainability metrics

## Browser Support

- **Modern browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile browsers**: iOS Safari 14+, Chrome Mobile 90+
- **Responsive design**: Mobile-first approach with breakpoints

## Contributing

### Adding New Components
1. Create component file in `src/design-system/components/`
2. Follow existing patterns and TypeScript interfaces
3. Include variants using CVA
4. Add comprehensive props documentation
5. Export from `index.ts`
6. Add examples to `ComponentShowcase.tsx`

### Design Token Updates
1. Update `tokens.ts` with new values
2. Ensure CSS variables are properly defined
3. Test across all components
4. Update documentation

## Roadmap

### Phase 1: Foundation (Completed ✅)
- [x] Design tokens and CSS variables
- [x] Core typography system
- [x] Button components and variants
- [x] Form input components
- [x] Card system and layouts
- [x] Navigation components
- [x] Icon library and system
- [x] Filter and search components
- [x] Widget system
- [x] Layout utilities

### Phase 2: Enhancement (Next)
- [ ] Theme switching (light/dark mode)
- [ ] Animation system and transitions
- [ ] Data visualization components
- [ ] Advanced table components
- [ ] Modal and dialog system
- [ ] Toast notification system
- [ ] File upload components
- [ ] Calendar and date picker

### Phase 3: Specialization
- [ ] Map integration components
- [ ] Route planning widgets
- [ ] Waste tracking components
- [ ] Environmental impact displays
- [ ] Customer portal components
- [ ] Worker mobile components
- [ ] Admin dashboard widgets
- [ ] Reporting and analytics

### Phase 4: Advanced Features
- [ ] Micro-interactions and animations
- [ ] Advanced accessibility features
- [ ] Performance optimizations
- [ ] Component testing suite
- [ ] Storybook integration
- [ ] Documentation site
- [ ] NPM package distribution

## License

This design system is part of the Klynaa platform and is proprietary software.

---

Built with ❤️ for sustainable waste management