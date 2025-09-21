import * as React from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../../../apps/web/src/design-system/components/Card';

export default {
  title: 'Design System/Components/Card',
  component: Card,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Card component for displaying content in a structured, visually distinct container.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'elevated', 'outlined'],
      description: 'Card visual style',
    },
    padding: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg'],
      description: 'Card padding size',
    },
    interactive: {
      control: 'boolean',
      description: 'Interactive hover effects',
    },
  },
};

// Basic card
export const Default = {
  args: {
    children: (
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2">Card Title</h3>
        <p className="text-neutral-600">This is a basic card with some content inside.</p>
      </div>
    ),
  },
};

// Elevated card
export const Elevated = {
  args: {
    variant: 'elevated',
    children: (
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2">Elevated Card</h3>
        <p className="text-neutral-600">This card has an elevated appearance with more shadow.</p>
      </div>
    ),
  },
};

// Outlined card
export const Outlined = {
  args: {
    variant: 'outlined',
    children: (
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2">Outlined Card</h3>
        <p className="text-neutral-600">This card has a border outline style.</p>
      </div>
    ),
  },
};

// Interactive card
export const Interactive = {
  args: {
    interactive: true,
    children: (
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2">Interactive Card</h3>
        <p className="text-neutral-600">Hover over this card to see the interactive effects.</p>
      </div>
    ),
  },
};

// Card with header and content
export const WithHeaderAndContent = {
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>Card with Header</CardTitle>
        <CardDescription>This is a card description</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-neutral-600">
          This is the main content area of the card. It can contain any type of content
          including text, images, buttons, and other components.
        </p>
      </CardContent>
    </Card>
  ),
  parameters: {
    layout: 'centered',
  },
};

// All variants showcase
export const AllVariants = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
      <Card variant="default">
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-2">Default Card</h3>
          <p className="text-neutral-600">Standard card appearance</p>
        </div>
      </Card>

      <Card variant="elevated">
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-2">Elevated Card</h3>
          <p className="text-neutral-600">Card with elevated shadow</p>
        </div>
      </Card>

      <Card variant="outlined">
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-2">Outlined Card</h3>
          <p className="text-neutral-600">Card with border outline</p>
        </div>
      </Card>

      <Card interactive>
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-2">Interactive Card</h3>
          <p className="text-neutral-600">Hover for interaction effect</p>
        </div>
      </Card>
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
  },
};