import React from 'react';
import { Button } from '../src/design-system/components/Button';
import { Card } from '../src/design-system/components/Card';
import { Input, Label, Field } from '../src/design-system/components/Form';
import { Alert } from '../src/design-system/components/Alert';
import { Heading, Text } from '../src/design-system/components/Typography';
import { useTheme } from '../src/contexts/SimpleThemeContext';

export default function ComponentsPage() {
  const { theme } = useTheme();

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 p-8">
      <div className="container mx-auto max-w-4xl">
        <Heading level={1} className="text-center mb-4 text-neutral-900 dark:text-neutral-100">
          Klynaa Design System Components
        </Heading>

        {/* Theme Status Indicator */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
            <div className={`w-3 h-3 rounded-full ${theme === 'dark' ? 'bg-yellow-400' : 'bg-blue-500'}`}></div>
            <Text variant="caption" className="text-emerald-800 dark:text-emerald-200">
              Current theme: <strong>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</strong>
            </Text>
          </div>
        </div>

        <div className="grid gap-8">
          {/* Buttons */}
          <Card className="p-6">
            <Heading level={2} className="mb-4">Buttons</Heading>
            <div className="flex gap-4 flex-wrap mb-6">
              <Button variant="primary">Primary Button</Button>
              <Button variant="secondary">Secondary Button</Button>
              <Button variant="outline">Outline Button</Button>
              <Button variant="ghost">Ghost Button</Button>
              <Button variant="success">Success Button</Button>
              <Button variant="warning">Warning Button</Button>
              <Button variant="destructive">Destructive Button</Button>
            </div>
            <div className="flex gap-4 flex-wrap">
              <Button variant="primary" size="sm">Small</Button>
              <Button variant="primary" size="md">Medium</Button>
              <Button variant="primary" size="lg">Large</Button>
              <Button variant="primary" size="xl">Extra Large</Button>
            </div>
          </Card>

          {/* Forms */}
          <Card className="p-6">
            <Heading level={2} className="mb-4">Form Components</Heading>
            <div className="space-y-4 max-w-md">
              <Field label="Email" required>
                <Input type="email" placeholder="Enter your email" />
              </Field>
              <Field label="Password" required>
                <Input type="password" placeholder="Enter password" />
              </Field>
              <Field label="Success Input" error="">
                <Input variant="success" placeholder="Valid input" />
              </Field>
              <Field label="Error Input" error="This field is required">
                <Input variant="error" placeholder="Invalid input" />
              </Field>
            </div>
          </Card>

          {/* Alerts */}
          <Card className="p-6">
            <Heading level={2} className="mb-4">Alerts</Heading>
            <div className="space-y-4">
              <Alert variant="default">
                <div>
                  <h4 className="font-medium">Default Alert</h4>
                  <p className="text-sm">This is a default alert message.</p>
                </div>
              </Alert>
              <Alert variant="success">
                <div>
                  <h4 className="font-medium">Success Alert</h4>
                  <p className="text-sm">This is a success alert message.</p>
                </div>
              </Alert>
              <Alert variant="warning">
                <div>
                  <h4 className="font-medium">Warning Alert</h4>
                  <p className="text-sm">This is a warning alert message.</p>
                </div>
              </Alert>
              <Alert variant="danger">
                <div>
                  <h4 className="font-medium">Danger Alert</h4>
                  <p className="text-sm">This is a danger alert message.</p>
                </div>
              </Alert>
              <Alert variant="info">
                <div>
                  <h4 className="font-medium">Info Alert</h4>
                  <p className="text-sm">This is an info alert message.</p>
                </div>
              </Alert>
            </div>
          </Card>

          {/* Cards */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card variant="default" className="p-6">
              <Heading level={3} className="mb-2">Default Card</Heading>
              <Text variant="body">This is a default card with hover shadow effect.</Text>
            </Card>
            <Card variant="elevated" className="p-6">
              <Heading level={3} className="mb-2">Elevated Card</Heading>
              <Text variant="body">This is an elevated card with stronger shadow.</Text>
            </Card>
            <Card variant="outlined" className="p-6">
              <Heading level={3} className="mb-2">Outlined Card</Heading>
              <Text variant="body">This is an outlined card with border emphasis.</Text>
            </Card>
            <Card variant="ghost" className="p-6">
              <Heading level={3} className="mb-2">Ghost Card</Heading>
              <Text variant="body">This is a ghost card with no background or border.</Text>
            </Card>
          </div>

          {/* Dark Mode Test */}
          <Card className="p-6 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800">
            <Text variant="body" className="text-emerald-800 dark:text-emerald-200">
              🌙 Dark Mode Test: If you can see proper styling in both light and dark modes, the design system is working correctly!
            </Text>
            <div className="mt-4">
              <Button variant="primary">Test Dark Mode Button</Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}