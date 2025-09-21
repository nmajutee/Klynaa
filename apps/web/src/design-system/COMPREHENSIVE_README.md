# Klynaa Design System

A comprehensive, production-ready design system built for the Klynaa waste management platform. This system provides a complete set of components, patterns, and utilities for building consistent, accessible, and beautiful user interfaces.

## 🎯 Philosophy

- **Modularity First**: Every component is self-contained and reusable
- **Accessibility by Default**: WCAG 2.1 AA compliance built into every component
- **Developer Experience**: TypeScript-first with excellent IntelliSense support
- **Performance Optimized**: Tree-shaking friendly with minimal runtime overhead
- **Consistent Design Language**: Cohesive visual system across all components

## 📦 Installation

```bash
# Install the design system
npm install @klynaa/design-system

# Install peer dependencies
npm install react react-dom class-variance-authority clsx
```

## 🚀 Quick Start

```tsx
import { Button, Card, Text } from '@klynaa/design-system';

function App() {
  return (
    <Card>
      <Text variant="h2">Welcome to Klynaa</Text>
      <Button variant="primary" size="lg">
        Get Started
      </Button>
    </Card>
  );
}
```

## 🧱 Component Architecture

### Core Components (11 components)
Foundational building blocks for any application:

- **Typography** - Text styles, headings, and semantic markup
- **Button** - Interactive buttons with multiple variants and states
- **Form** - Complete form controls and input components
- **Card** - Content containers with consistent styling
- **Navigation** - Navigation components and patterns
- **Icons** - Comprehensive icon system with 50+ icons
- **Filter** - Data filtering and search interfaces
- **Widget** - Dashboard and metric display components
- **Layout** - Grid systems, containers, and spacing utilities

### Advanced UI Components (8 components)
Sophisticated interaction patterns:

- **Modal** - Dialog system with compound components
- **Toast** - Global notification system with context
- **Dropdown** - Positioning-aware dropdown menus
- **Loading** - Loading states and skeleton components
- **FormValidation** - Advanced form validation and multi-step forms
- **DateTimePickers** - Date range and time selection components
- **DataTable** - Full-featured data tables with sorting/filtering
- **Charts** - Data visualization components

### Animation & Layout (2 components)
Advanced layout and motion:

- **Animations** - Comprehensive animation system
- **Layouts** - Advanced layout patterns and responsive design

## 📋 Component Catalog

### 🔤 Typography Components
```tsx
// Headings and text
<Text variant="h1">Main Heading</Text>
<Text variant="body" color="muted">Body text</Text>
<Text variant="caption" weight="semibold">Caption</Text>

// Semantic components
<Heading level={2}>Semantic heading</Heading>
<Paragraph>Paragraph with proper spacing</Paragraph>
<Code>inline code</Code>
<CodeBlock language="javascript">console.log('hello');</CodeBlock>
```

### 🎛️ Button Components
```tsx
// Primary actions
<Button variant="primary" size="lg">Primary Action</Button>
<Button variant="secondary" loading>Secondary</Button>
<Button variant="ghost" leftIcon={<Icons.Plus />}>Add Item</Button>

// Icon buttons
<IconButton icon={<Icons.Settings />} />
<IconButton variant="danger" icon={<Icons.Trash />} />

// Button groups
<ButtonGroup>
  <Button>Option 1</Button>
  <Button>Option 2</Button>
  <Button>Option 3</Button>
</ButtonGroup>
```

### 📝 Form Components
```tsx
// Basic inputs
<Input
  label="Email"
  type="email"
  placeholder="Enter your email"
  error="Please enter a valid email"
/>

// Select and multi-select
<Select
  label="Category"
  options={categories}
  multiple
  searchable
/>

// Checkbox and radio groups
<CheckboxGroup
  label="Preferences"
  options={preferences}
  value={selected}
  onChange={setSelected}
/>

// Form layouts
<FormSection title="Personal Information">
  <FormRow>
    <Input label="First Name" />
    <Input label="Last Name" />
  </FormRow>
</FormSection>
```

### 🃏 Card Components
```tsx
// Basic card
<Card>
  <Card.Header>
    <Card.Title>Card Title</Card.Title>
  </Card.Header>
  <Card.Content>
    Card content goes here
  </Card.Content>
</Card>

// Specialized cards
<MetricCard
  title="Total Pickups"
  value="1,234"
  change={{ value: 12, type: 'increase' }}
  icon={Icons.TrendingUp}
/>

<FeatureCard
  icon={<Icons.Recycle />}
  title="Smart Routing"
  description="AI-powered route optimization"
/>
```

### 🧭 Navigation Components
```tsx
// Main navigation
<Navbar>
  <NavbarBrand>Klynaa</NavbarBrand>
  <NavbarContent>
    <NavItem href="/dashboard">Dashboard</NavItem>
    <NavItem href="/pickups">Pickups</NavItem>
  </NavbarContent>
</Navbar>

// Breadcrumbs and pagination
<Breadcrumbs>
  <BreadcrumbItem href="/">Home</BreadcrumbItem>
  <BreadcrumbItem>Pickups</BreadcrumbItem>
</Breadcrumbs>

<Pagination
  currentPage={1}
  totalPages={10}
  onPageChange={handlePageChange}
/>

// Tab navigation
<Tabs>
  <Tab id="overview">Overview</Tab>
  <Tab id="details">Details</Tab>
</Tabs>
```

### ⚡ Advanced Components

#### Modal System
```tsx
// Basic modal
<Modal open={isOpen} onClose={() => setIsOpen(false)}>
  <Modal.Header>
    <Modal.Title>Confirm Action</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    Are you sure you want to proceed?
  </Modal.Body>
  <Modal.Footer>
    <Button variant="ghost" onClick={() => setIsOpen(false)}>
      Cancel
    </Button>
    <Button variant="danger" onClick={handleConfirm}>
      Confirm
    </Button>
  </Modal.Footer>
</Modal>

// Specialized modals
<ConfirmationModal
  open={isOpen}
  title="Delete Item"
  message="This action cannot be undone."
  onConfirm={handleDelete}
  onCancel={() => setIsOpen(false)}
/>
```

#### Toast Notifications
```tsx
// Toast provider setup
function App() {
  return (
    <ToastProvider>
      <YourApp />
    </ToastProvider>
  );
}

// Using toasts
function Component() {
  const { addToast } = useToast();

  const showSuccess = () => {
    addToast({
      title: 'Success!',
      message: 'Operation completed successfully',
      type: 'success'
    });
  };
}
```

#### Data Tables
```tsx
const columns = [
  { key: 'name', header: 'Name', sortable: true },
  { key: 'email', header: 'Email', filterable: true },
  { key: 'status', header: 'Status', render: (status) => <Badge>{status}</Badge> }
];

<DataTable
  data={users}
  columns={columns}
  sortable
  filterable
  pagination={{
    page: 1,
    pageSize: 10,
    total: 100
  }}
  onSort={handleSort}
  onFilter={handleFilter}
/>
```

#### Form Validation
```tsx
// Advanced form with validation
const { fields, isValid, validateAllFields } = useFormValidation(
  { email: '', password: '' },
  {
    email: { required: true, email: true },
    password: { required: true, minLength: 8 }
  }
);

// Multi-step forms
const { currentStep, next, previous } = useMultiStepForm([
  'Personal Info',
  'Preferences',
  'Review'
]);

<FormStepper
  steps={steps}
  currentStep={currentStep}
  onStepClick={goToStep}
/>
```

### 🎨 Animation System
```tsx
// Basic animations
<AnimatedContainer animation="fade" duration="normal">
  <div>Animated content</div>
</AnimatedContainer>

// Staggered animations
<StaggeredAnimation animation="slide-up" staggerDelay={100}>
  {items.map(item => <div key={item.id}>{item.name}</div>)}
</StaggeredAnimation>

// Scroll-triggered animations
<ScrollAnimation animation="scale" threshold={0.3}>
  <FeatureSection />
</ScrollAnimation>

// Advanced effects
<Typewriter
  words={['Efficient', 'Smart', 'Sustainable']}
  typeSpeed={100}
  loop
/>

<MorphingNumber value={1234} duration={2000} />
```

### 📐 Layout System
```tsx
// Responsive grid
<Grid cols={{ base: 1, md: 2, lg: 3 }} gap={6}>
  <GridItem>Item 1</GridItem>
  <GridItem colSpan={2}>Item 2</GridItem>
</Grid>

// Flexible layouts
<Flex direction="column" align="center" justify="between">
  <Header />
  <MainContent />
  <Footer />
</Flex>

// Advanced layouts
<SidebarLayout
  sidebar={<Navigation />}
  sidebarWidth={250}
  collapsible
>
  <MainContent />
</SidebarLayout>

<ResizablePanels
  direction="horizontal"
  initialSizes={[30, 70]}
  minSizes={[20, 30]}
>
  <Sidebar />
  <MainArea />
</ResizablePanels>
```

## 🎨 Theming & Customization

### Design Tokens
The system uses a comprehensive set of design tokens:

```tsx
// Color system
colors: {
  primary: { 50: '#eff6ff', 500: '#3b82f6', 900: '#1e3a8a' },
  semantic: { success: '#10b981', warning: '#f59e0b', danger: '#ef4444' }
}

// Typography scale
typography: {
  fontSizes: { xs: '0.75rem', sm: '0.875rem', base: '1rem', lg: '1.125rem' },
  fontWeights: { normal: 400, medium: 500, semibold: 600, bold: 700 },
  lineHeights: { tight: 1.25, normal: 1.5, relaxed: 1.625 }
}

// Spacing system
spacing: { 1: '0.25rem', 2: '0.5rem', 4: '1rem', 8: '2rem', 16: '4rem' }
```

### Component Variants
Every component supports extensive customization through variants:

```tsx
// Button variants
<Button variant="primary" size="lg" loading disabled />

// Card variants
<Card variant="elevated" padding="lg" />

// Typography variants
<Text variant="h2" color="primary" weight="bold" />
```

## ♿ Accessibility Features

All components include comprehensive accessibility features:

- **Keyboard Navigation**: Full keyboard support with logical tab order
- **Screen Reader Support**: Proper ARIA labels and semantic markup
- **Focus Management**: Visible focus indicators and focus trapping
- **Color Contrast**: WCAG AA compliant color combinations
- **Reduced Motion**: Respects user's motion preferences

## 🔧 Development Tools

### Component Development
```bash
# Start component development
npm run dev:components

# Run component tests
npm run test:components

# Build component library
npm run build:components
```

### Storybook Integration
```bash
# Start Storybook
npm run storybook

# Build Storybook
npm run build-storybook
```

## 📖 Advanced Usage

### Custom Themes
```tsx
// Create custom theme
const customTheme = {
  colors: {
    primary: { ... },
    brand: { ... }
  },
  components: {
    Button: {
      variants: {
        custom: 'bg-brand-500 text-white hover:bg-brand-600'
      }
    }
  }
};

// Apply theme
<ThemeProvider theme={customTheme}>
  <App />
</ThemeProvider>
```

### Component Composition
```tsx
// Compound components
<DataTable>
  <DataTable.Header>
    <DataTable.Title>Users</DataTable.Title>
    <DataTable.Actions>
      <Button>Add User</Button>
    </DataTable.Actions>
  </DataTable.Header>
  <DataTable.Content>
    {/* Table content */}
  </DataTable.Content>
</DataTable>
```

### Performance Optimization
```tsx
// Tree-shaking friendly imports
import { Button } from '@klynaa/design-system/button';
import { Card } from '@klynaa/design-system/card';

// Lazy loading
const Modal = lazy(() => import('@klynaa/design-system/modal'));
```

## 🤝 Contributing

We welcome contributions! Please read our [Contributing Guide](./CONTRIBUTING.md) for details on our development process.

### Development Setup
```bash
git clone https://github.com/klynaa/design-system.git
cd design-system
npm install
npm run dev
```

## 📝 License

MIT License - see [LICENSE](./LICENSE) for details.

## 🆘 Support

- 📧 Email: design-system@klynaa.com
- 💬 Discord: [Klynaa Community](https://discord.gg/klynaa)
- 📚 Documentation: [docs.klynaa.com](https://docs.klynaa.com)

---

Built with ❤️ by the Klynaa team for sustainable waste management.