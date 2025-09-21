import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

// Text variant configurations using CVA
const textVariants = cva('', {
  variants: {
    variant: {
      h1: 'text-4xl lg:text-5xl font-bold tracking-tight text-neutral-900',
      h2: 'text-3xl lg:text-4xl font-bold tracking-tight text-neutral-900',
      h3: 'text-2xl lg:text-3xl font-semibold tracking-tight text-neutral-900',
      h4: 'text-xl lg:text-2xl font-semibold tracking-tight text-neutral-900',
      h5: 'text-lg lg:text-xl font-semibold text-neutral-900',
      h6: 'text-base lg:text-lg font-semibold text-neutral-900',
      body: 'text-base text-neutral-700 leading-relaxed',
      bodyLarge: 'text-lg text-neutral-700 leading-relaxed',
      bodySmall: 'text-sm text-neutral-600 leading-relaxed',
      caption: 'text-xs text-neutral-500 leading-normal',
      label: 'text-sm font-medium text-neutral-700',
      code: 'text-sm font-mono bg-neutral-100 px-1.5 py-0.5 rounded text-neutral-800',
      link: 'text-primary-600 hover:text-primary-700 underline underline-offset-4 transition-colors',
      muted: 'text-neutral-500',
      error: 'text-error-600',
      success: 'text-success-600',
      warning: 'text-warning-600',
    },
    align: {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
      justify: 'text-justify',
    },
    weight: {
      normal: 'font-normal',
      medium: 'font-medium',
      semibold: 'font-semibold',
      bold: 'font-bold',
    },
  },
  defaultVariants: {
    variant: 'body',
    align: 'left',
  },
});

export interface TextProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof textVariants> {
  as?: React.ElementType;
  children: React.ReactNode;
}

export const Text: React.FC<TextProps> = ({
  variant,
  align,
  weight,
  as: Component = 'p',
  className,
  children,
  ...props
}) => {
  // Auto-detect semantic HTML elements for headings
  if (variant?.startsWith('h') && Component === 'p') {
    Component = variant as React.ElementType;
  }

  return React.createElement(
    Component,
    {
      className: cn(textVariants({ variant, align, weight }), className),
      ...props,
    },
    children
  );
};

// Convenient heading components
export const Heading: React.FC<Omit<TextProps, 'variant'> & { level: 1 | 2 | 3 | 4 | 5 | 6 }> = ({
  level,
  ...props
}) => {
  return <Text variant={`h${level}` as const} {...props} />;
};

// Display text for hero sections
export const Display: React.FC<Omit<TextProps, 'variant'>> = ({ className, ...props }) => {
  return (
    <Text
      variant="h1"
      className={cn('text-5xl lg:text-6xl xl:text-7xl font-extrabold', className)}
      {...props}
    />
  );
};

// Lead text for introductions
export const Lead: React.FC<Omit<TextProps, 'variant'>> = ({ className, ...props }) => {
  return (
    <Text
      variant="bodyLarge"
      className={cn('text-xl lg:text-2xl text-neutral-600 leading-8', className)}
      {...props}
    />
  );
};

// Code block component
export const CodeBlock: React.FC<{ children: string; language?: string; className?: string }> = ({
  children,
  language,
  className,
}) => {
  return (
    <pre className={cn(
      'bg-neutral-900 text-neutral-100 p-4 rounded-lg overflow-x-auto text-sm font-mono',
      className
    )}>
      {language && <div className="text-xs text-neutral-400 mb-2">{language}</div>}
      <code>{children}</code>
    </pre>
  );
};

export default Text;