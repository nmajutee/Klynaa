import React, { useState } from 'react';
import {
  Container,
  Grid,
  Stack,
  Card,
  Button,
  Input,
  Field,
  Heading,
  Text,
  Icons,
  SearchBar,
  Widget,
  StatsWidget,
  FilterPanel,
  FilterGroup,
  Tabs,
  Header,
  NavItem,
  Divider,
  Flex,
} from './components';

const ComponentShowcase: React.FC = () => {
  const [activeTab, setActiveTab] = useState('components');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Record<string, any[]>>({});

  // Sample data
  const navItems: NavItem[] = [
    { label: 'Home', href: '/', active: true, icon: <Icons.Home size="sm" /> },
    { label: 'Components', href: '/components', icon: <Icons.Dashboard size="sm" /> },
    { label: 'Documentation', href: '/docs', icon: <Icons.Info size="sm" /> },
  ];

  const statsData = [
    {
      id: 'users',
      label: 'Total Users',
      value: '12,543',
      change: 12,
      changeLabel: 'this month',
      icon: Icons.Users,
      color: 'primary' as const,
    },
    {
      id: 'pickups',
      label: 'Completed Pickups',
      value: '1,847',
      change: -3,
      changeLabel: 'this week',
      icon: Icons.Truck,
      color: 'success' as const,
    },
    {
      id: 'waste',
      label: 'Waste Collected',
      value: '94.2 tons',
      change: 8,
      changeLabel: 'this month',
      icon: Icons.Recycle,
      color: 'secondary' as const,
    },
  ];

  const filterGroups: FilterGroup[] = [
    {
      id: 'category',
      label: 'Category',
      type: 'checkbox',
      options: [
        { id: 'organic', label: 'Organic Waste', value: 'organic', count: 45 },
        { id: 'recyclable', label: 'Recyclable', value: 'recyclable', count: 23 },
        { id: 'electronic', label: 'Electronic Waste', value: 'electronic', count: 12 },
        { id: 'hazardous', label: 'Hazardous', value: 'hazardous', count: 3 },
      ],
    },
    {
      id: 'status',
      label: 'Status',
      type: 'radio',
      options: [
        { id: 'pending', label: 'Pending', value: 'pending', count: 15 },
        { id: 'in-progress', label: 'In Progress', value: 'in-progress', count: 28 },
        { id: 'completed', label: 'Completed', value: 'completed', count: 157 },
      ],
    },
    {
      id: 'date',
      label: 'Date Range',
      type: 'date',
    },
  ];

  const tabs = [
    { id: 'components', label: 'Components', badge: '12' },
    { id: 'typography', label: 'Typography' },
    { id: 'layout', label: 'Layout' },
    { id: 'forms', label: 'Forms', badge: '8' },
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <Header
        logo={
          <div className="flex items-center space-x-2">
            <Icons.Recycle className="h-8 w-8 text-primary-600" />
            <span className="font-bold text-xl">Klynaa Design System</span>
          </div>
        }
        navigation={navItems}
        actions={
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm">
              <Icons.Bell size="sm" />
            </Button>
            <Button variant="primary" size="sm">
              Get Started
            </Button>
          </div>
        }
      />

      <Container className="py-8">
        <Stack spacing={8}>
          {/* Hero Section */}
          <div className="text-center">
            <Heading level={1} className="mb-4">
              Klynaa Design System
            </Heading>
            <Text variant="bodyLarge" color="muted" className="max-w-2xl mx-auto">
              A comprehensive design system for building beautiful, accessible, and consistent user interfaces
              for waste management applications.
            </Text>
          </div>

          {/* Stats Section */}
          <StatsWidget stats={statsData} layout="horizontal" />

          {/* Navigation Tabs */}
          <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

          <Divider />

          {/* Main Content Area */}
          <Grid cols={4} gap={6} responsive>
            {/* Sidebar */}
            <div className="col-span-1">
              <Stack spacing={6}>
                {/* Search */}
                <SearchBar
                  placeholder="Search components..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onSearch={(query) => console.log('Search:', query)}
                  suggestions={['Button', 'Card', 'Form', 'Typography', 'Widget']}
                />

                {/* Filters */}
                <FilterPanel
                  groups={filterGroups}
                  selectedFilters={filters}
                  onChange={setFilters}
                  onClear={() => setFilters({})}
                  collapsible
                />
              </Stack>
            </div>

            {/* Content */}
            <div className="col-span-3">
              {activeTab === 'components' && (
                <Stack spacing={6}>
                  {/* Buttons Section */}
                  <Card>
                    <Heading level={3} className="mb-4">
                      Buttons
                    </Heading>
                    <Flex wrap="wrap" gap={3}>
                      <Button variant="primary">Primary</Button>
                      <Button variant="secondary">Secondary</Button>
                      <Button variant="outline">Outline</Button>
                      <Button variant="ghost">Ghost</Button>
                      <Button variant="destructive">Destructive</Button>
                      <Button variant="primary" disabled>
                        Disabled
                      </Button>
                    </Flex>
                  </Card>

                  {/* Forms Section */}
                  <Card>
                    <Heading level={3} className="mb-4">
                      Form Components
                    </Heading>
                    <Stack spacing={4}>
                                            <Field label="Email" helperText="Enter your email address">
                        <Input type="email" placeholder="john@example.com" />
                      </Field>
                      <Field label="Password" helperText="Must be at least 8 characters">
                        <Input type="password" placeholder="••••••••" />
                      </Field>
                      <div className="grid grid-cols-2 gap-4">
                                                <Field label="First Name">
                          <Input placeholder="John" />
                        </Field>
                        <Field label="Last Name">
                          <Input placeholder="Doe" />
                        </Field>
                      </div>
                    </Stack>
                  </Card>

                  {/* Icons Section */}
                  <Card>
                    <Heading level={3} className="mb-4">
                      Icons
                    </Heading>
                    <Flex wrap="wrap" gap={4}>
                      <div className="text-center">
                        <Icons.Home className="mx-auto mb-2" />
                        <Text variant="caption">Home</Text>
                      </div>
                      <div className="text-center">
                        <Icons.Trash className="mx-auto mb-2" />
                        <Text variant="caption">Trash</Text>
                      </div>
                      <div className="text-center">
                        <Icons.Recycle className="mx-auto mb-2" />
                        <Text variant="caption">Recycle</Text>
                      </div>
                      <div className="text-center">
                        <Icons.Truck className="mx-auto mb-2" />
                        <Text variant="caption">Truck</Text>
                      </div>
                      <div className="text-center">
                        <Icons.MapPin className="mx-auto mb-2" />
                        <Text variant="caption">Map Pin</Text>
                      </div>
                      <div className="text-center">
                        <Icons.Bell className="mx-auto mb-2" />
                        <Text variant="caption">Bell</Text>
                      </div>
                    </Flex>
                  </Card>

                  {/* Widgets Section */}
                  <Card>
                    <Heading level={3} className="mb-4">
                      Widgets
                    </Heading>
                    <Grid cols={2} gap={4}>
                      <Widget
                        title="Recent Activity"
                        subtitle="Last 7 days"
                        icon={Icons.Dashboard}
                        actions={
                          <Button variant="ghost" size="sm">
                            <Icons.Settings size="sm" />
                          </Button>
                        }
                        collapsible
                      >
                        <Stack spacing={3}>
                          <Flex justify="between" align="center">
                            <Text variant="body">New pickup request</Text>
                            <span className="px-2 py-1 text-xs bg-success-100 text-success-700 rounded-full">
                              Completed
                            </span>
                          </Flex>
                          <Flex justify="between" align="center">
                            <Text variant="body">Route optimization</Text>
                            <span className="px-2 py-1 text-xs bg-warning-100 text-warning-700 rounded-full">
                              In Progress
                            </span>
                          </Flex>
                          <Flex justify="between" align="center">
                            <Text variant="body">Waste collection</Text>
                            <span className="px-2 py-1 text-xs bg-primary-100 text-primary-700 rounded-full">
                              Scheduled
                            </span>
                          </Flex>
                        </Stack>
                      </Widget>

                      <Widget
                        title="System Status"
                        subtitle="All systems operational"
                        icon={Icons.CheckCircle}
                      >
                        <Stack spacing={3}>
                          <Flex justify="between" align="center">
                            <Text variant="body">API Services</Text>
                            <div className="w-3 h-3 bg-success-500 rounded-full"></div>
                          </Flex>
                          <Flex justify="between" align="center">
                            <Text variant="body">Database</Text>
                            <div className="w-3 h-3 bg-success-500 rounded-full"></div>
                          </Flex>
                          <Flex justify="between" align="center">
                            <Text variant="body">GPS Tracking</Text>
                            <div className="w-3 h-3 bg-success-500 rounded-full"></div>
                          </Flex>
                        </Stack>
                      </Widget>
                    </Grid>
                  </Card>
                </Stack>
              )}

              {activeTab === 'typography' && (
                <Card>
                  <Stack spacing={6}>
                    <Heading level={1}>Heading 1</Heading>
                    <Heading level={2}>Heading 2</Heading>
                    <Heading level={3}>Heading 3</Heading>
                    <Heading level={4}>Heading 4</Heading>
                    <Text variant="h5">Heading 5</Text>
                    <Text variant="h6">Heading 6</Text>
                    <Text variant="bodyLarge">
                      Body Large: Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                      Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                    </Text>
                    <Text variant="body">
                      Body: Ut enim ad minim veniam, quis nostrud exercitation ullamco
                      laboris nisi ut aliquip ex ea commodo consequat.
                    </Text>
                    <Text variant="caption">Caption text</Text>
                    <Text variant="label">LABEL TEXT</Text>
                  </Stack>
                </Card>
              )}

              {activeTab === 'layout' && (
                <Stack spacing={6}>
                  <Card>
                    <Heading level={3} className="mb-4">
                      Grid System
                    </Heading>
                    <Grid cols={3} gap={4}>
                      <div className="bg-primary-100 p-4 rounded-md text-center">
                        <Text>Grid Item 1</Text>
                      </div>
                      <div className="bg-primary-100 p-4 rounded-md text-center">
                        <Text>Grid Item 2</Text>
                      </div>
                      <div className="bg-primary-100 p-4 rounded-md text-center">
                        <Text>Grid Item 3</Text>
                      </div>
                    </Grid>
                  </Card>

                  <Card>
                    <Heading level={3} className="mb-4">
                      Flex System
                    </Heading>
                    <Stack spacing={4}>
                      <Flex justify="between" align="center" className="bg-neutral-100 p-4 rounded-md">
                        <Text>Start</Text>
                        <Text>Center</Text>
                        <Text>End</Text>
                      </Flex>
                      <Flex justify="center" align="center" className="bg-neutral-100 p-4 rounded-md">
                        <Text>Centered Content</Text>
                      </Flex>
                    </Stack>
                  </Card>
                </Stack>
              )}
            </div>
          </Grid>
        </Stack>
      </Container>
    </div>
  );
};

export default ComponentShowcase;