import * as React from 'react';
import { Heading, Text } from '../../../apps/web/src/design-system/components/Typography';

export default {
  title: 'Design System/Components/Typography',
  component: Heading,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Typography components for headings and text with consistent styling and hierarchy.',
      },
    },
  },
  tags: ['autodocs'],
};

// Headings
export const Headings = {
  render: () => (
    <div className="space-y-4">
      <Heading level={1}>Heading 1 - Main Title</Heading>
      <Heading level={2}>Heading 2 - Section Title</Heading>
      <Heading level={3}>Heading 3 - Subsection Title</Heading>
      <Heading level={4}>Heading 4 - Component Title</Heading>
      <Heading level={5}>Heading 5 - Small Title</Heading>
      <Heading level={6}>Heading 6 - Smallest Title</Heading>
    </div>
  ),
};

// Text variants
export const TextVariants = {
  render: () => (
    <div className="space-y-4">
      <Text variant="body">Body Text - This is the default body text variant used for most content.</Text>
      <Text variant="bodyLarge">Body Large - This is larger text used for introductions or important content.</Text>
      <Text variant="bodySmall">Body Small - This is smaller text used for captions or less important information.</Text>
      <Text variant="caption">Caption - This is very small text for image captions or metadata.</Text>
      <Text variant="label">Label - This is text used for form labels and UI elements.</Text>
      <Text variant="muted">Muted Text - This is text with reduced opacity for secondary information.</Text>
    </div>
  ),
};

// Text colors
export const TextColors = {
  render: () => (
    <div className="space-y-2">
      <Text>Default text color</Text>
      <Text className="text-primary-600">Primary color text</Text>
      <Text className="text-klynaa-primary">Klynaa green text</Text>
      <Text className="text-neutral-600">Neutral text</Text>
      <Text className="text-red-600">Error/danger text</Text>
      <Text className="text-yellow-600">Warning text</Text>
      <Text className="text-green-600">Success text</Text>
    </div>
  ),
};

// Font weights
export const FontWeights = {
  render: () => (
    <div className="space-y-2">
      <Text className="font-light">Light weight text (300)</Text>
      <Text className="font-normal">Normal weight text (400)</Text>
      <Text className="font-medium">Medium weight text (500)</Text>
      <Text className="font-semibold">Semi-bold weight text (600)</Text>
      <Text className="font-bold">Bold weight text (700)</Text>
    </div>
  ),
};

// Typography hierarchy example
export const TypographyHierarchy = {
  render: () => (
    <article className="max-w-2xl space-y-6">
      <Heading level={1}>Article Title</Heading>
      <Text variant="bodyLarge">
        This is a lead paragraph that introduces the article with larger, more prominent text
        to capture the reader's attention and provide a brief overview.
      </Text>

      <Heading level={2}>Section Title</Heading>
      <Text variant="body">
        This is regular body text that makes up the main content. It should be easy to read
        and have good contrast. The Manrope font provides excellent readability at various sizes.
      </Text>

      <Heading level={3}>Subsection Title</Heading>
      <Text variant="body">
        Another paragraph of body text demonstrating the hierarchy. The spacing and sizing
        create a clear visual hierarchy that guides the reader through the content.
      </Text>

      <Text variant="caption" className="text-neutral-600">
        This is small text used for captions, footnotes, or less important information.
      </Text>
    </article>
  ),
  parameters: {
    layout: 'padded',
  },
};

// Responsive typography
export const ResponsiveText = {
  render: () => (
    <div className="space-y-4">
      <Heading level={1} className="text-2xl md:text-4xl lg:text-5xl">
        Responsive Heading
      </Heading>
      <Text className="text-sm md:text-base lg:text-lg">
        This text scales responsively across different screen sizes using Tailwind's
        responsive utilities.
      </Text>
    </div>
  ),
};