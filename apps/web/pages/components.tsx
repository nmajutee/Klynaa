import React from 'react';
import { Button } from '../src/design-system/components/Button';
import { Card } from '../src/design-system/components/Card';
import { Heading, Text } from '../src/design-system/components/Typography';

export default function ComponentsPage() {
  return (
    <div className="min-h-screen bg-neutral-50 p-8">
      <div className="container mx-auto max-w-4xl">
        <Heading level={1} className="text-center mb-8 text-neutral-900">
          Klynaa Design System Components
        </Heading>

        <div className="grid gap-8">
          {/* Test basic components */}
          <Card className="p-6">
            <Heading level={2} className="mb-4">Buttons</Heading>
            <div className="flex gap-4 flex-wrap">
              <Button variant="primary">Primary Button</Button>
              <Button variant="secondary">Secondary Button</Button>
              <Button variant="outline">Outline Button</Button>
              <Button variant="ghost">Ghost Button</Button>
            </div>
          </Card>

          <Card className="p-6">
            <Heading level={2} className="mb-4">Typography</Heading>
            <div className="space-y-2">
              <Heading level={1}>Heading 1</Heading>
              <Heading level={2}>Heading 2</Heading>
              <Heading level={3}>Heading 3</Heading>
              <Text variant="body">This is body text</Text>
              <Text variant="bodySmall">This is small body text</Text>
            </div>
          </Card>

          <Card className="p-6 bg-green-50">
            <Text variant="body" className="text-green-800">
              ✅ If you can see this styled card with green background, Tailwind is working!
            </Text>
          </Card>
        </div>
      </div>
    </div>
  );
}