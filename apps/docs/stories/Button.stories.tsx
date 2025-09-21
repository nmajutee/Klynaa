import * as React from 'react';
import { Button } from '../../../apps/web/src/design-system/components/Button';
import { Icons } from '../../../apps/web/src/design-system/components/Icons';

export default {
  title: 'Design System/Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'The Button component is a fundamental interactive element that supports multiple variants, sizes, and states.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline', 'ghost', 'destructive'],
      description: 'Button variant style',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Button size',
    },
    loading: {
      control: 'boolean',
      description: 'Loading state',
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state',
    },
    fullWidth: {
      control: 'boolean',
      description: 'Full width button',
    },
  },
};

// Primary button
export const Primary = {
  args: {
    children: 'Primary Button',
    variant: 'primary',
  },
};

// Secondary button
export const Secondary = {
  args: {
    children: 'Secondary Button',
    variant: 'secondary',
  },
};

// Outline button
export const Outline = {
  args: {
    children: 'Outline Button',
    variant: 'outline',
  },
};

// Ghost button
export const Ghost = {
  args: {
    children: 'Ghost Button',
    variant: 'ghost',
  },
};

// Destructive button
export const Destructive = {
  args: {
    children: 'Delete Item',
    variant: 'destructive',
  },
};

// With icons
export const WithLeftIcon = {
  args: {
    children: 'Add Item',
    variant: 'primary',
    leftIcon: <Icons.Plus />,
  },
};

export const WithRightIcon = {
  args: {
    children: 'Settings',
    variant: 'secondary',
    rightIcon: <Icons.Settings />,
  },
};

// Different sizes
export const Small = {
  args: {
    children: 'Small Button',
    size: 'sm',
  },
};

export const Large = {
  args: {
    children: 'Large Button',
    size: 'lg',
  },
};

// States
export const Loading = {
  args: {
    children: 'Loading...',
    loading: true,
  },
};

export const Disabled = {
  args: {
    children: 'Disabled Button',
    disabled: true,
  },
};

export const FullWidth = {
  args: {
    children: 'Full Width Button',
    fullWidth: true,
  },
  parameters: {
    layout: 'padded',
  },
};

// All variants showcase
export const AllVariants = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 flex-wrap">
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="destructive">Destructive</Button>
      </div>
      <div className="flex gap-2 flex-wrap">
        <Button size="sm">Small</Button>
        <Button size="md">Medium</Button>
        <Button size="lg">Large</Button>
      </div>
      <div className="flex gap-2 flex-wrap">
        <Button leftIcon={<Icons.Plus />}>With Icon</Button>
        <Button loading>Loading</Button>
        <Button disabled>Disabled</Button>
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
};