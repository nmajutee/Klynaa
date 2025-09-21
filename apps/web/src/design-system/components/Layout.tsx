import React, { ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

// Container Component
const containerVariants = cva('mx-auto px-4 sm:px-6 lg:px-8', {
  variants: {
    size: {
      xs: 'max-w-xs',
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-lg',
      xl: 'max-w-xl',
      '2xl': 'max-w-2xl',
      '3xl': 'max-w-3xl',
      '4xl': 'max-w-4xl',
      '5xl': 'max-w-5xl',
      '6xl': 'max-w-6xl',
      '7xl': 'max-w-7xl',
      full: 'max-w-full',
    },
  },
  defaultVariants: {
    size: '7xl',
  },
});

export interface ContainerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof containerVariants> {}

export const Container: React.FC<ContainerProps> = ({
  size,
  className,
  children,
  ...props
}) => {
  return (
    <div className={cn(containerVariants({ size }), className)} {...props}>
      {children}
    </div>
  );
};

// Grid Component
const gridVariants = cva('grid', {
  variants: {
    cols: {
      1: 'grid-cols-1',
      2: 'grid-cols-2',
      3: 'grid-cols-3',
      4: 'grid-cols-4',
      5: 'grid-cols-5',
      6: 'grid-cols-6',
      12: 'grid-cols-12',
    },
    gap: {
      0: 'gap-0',
      1: 'gap-1',
      2: 'gap-2',
      3: 'gap-3',
      4: 'gap-4',
      6: 'gap-6',
      8: 'gap-8',
      12: 'gap-12',
    },
    responsive: {
      true: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
      false: '',
    },
  },
  defaultVariants: {
    cols: 1,
    gap: 4,
    responsive: false,
  },
});

export interface GridProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof gridVariants> {}

export const Grid: React.FC<GridProps> = ({
  cols,
  gap,
  responsive,
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        gridVariants({ cols: responsive ? undefined : cols, gap, responsive }),
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

// Flex Component
const flexVariants = cva('flex', {
  variants: {
    direction: {
      row: 'flex-row',
      'row-reverse': 'flex-row-reverse',
      col: 'flex-col',
      'col-reverse': 'flex-col-reverse',
    },
    align: {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      stretch: 'items-stretch',
      baseline: 'items-baseline',
    },
    justify: {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
      around: 'justify-around',
      evenly: 'justify-evenly',
    },
    wrap: {
      wrap: 'flex-wrap',
      'wrap-reverse': 'flex-wrap-reverse',
      nowrap: 'flex-nowrap',
    },
    gap: {
      0: 'gap-0',
      1: 'gap-1',
      2: 'gap-2',
      3: 'gap-3',
      4: 'gap-4',
      6: 'gap-6',
      8: 'gap-8',
      12: 'gap-12',
    },
  },
  defaultVariants: {
    direction: 'row',
    align: 'start',
    justify: 'start',
    wrap: 'nowrap',
    gap: 0,
  },
});

export interface FlexProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof flexVariants> {}

export const Flex: React.FC<FlexProps> = ({
  direction,
  align,
  justify,
  wrap,
  gap,
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={cn(flexVariants({ direction, align, justify, wrap, gap }), className)}
      {...props}
    >
      {children}
    </div>
  );
};

// Stack Component (Vertical Flex)
export interface StackProps extends Omit<FlexProps, 'direction'> {
  spacing?: number;
}

export const Stack: React.FC<StackProps> = ({
  spacing,
  gap,
  className,
  children,
  ...props
}) => {
  const stackGap = spacing !== undefined ?
    (spacing === 0 ? 'gap-0' :
     spacing === 1 ? 'gap-1' :
     spacing === 2 ? 'gap-2' :
     spacing === 3 ? 'gap-3' :
     spacing === 4 ? 'gap-4' :
     spacing === 6 ? 'gap-6' :
     spacing === 8 ? 'gap-8' :
     'gap-12') : undefined;

  return (
    <Flex
      direction="col"
      gap={gap}
      className={cn(stackGap, className)}
      {...props}
    >
      {children}
    </Flex>
  );
};

// Divider Component
const dividerVariants = cva('', {
  variants: {
    orientation: {
      horizontal: 'w-full h-px',
      vertical: 'h-full w-px',
    },
    variant: {
      solid: 'bg-neutral-200',
      dashed: 'border-neutral-200 border-dashed',
      dotted: 'border-neutral-200 border-dotted',
    },
    size: {
      sm: '',
      md: '',
      lg: '',
    },
  },
  compoundVariants: [
    {
      orientation: 'horizontal',
      variant: 'dashed',
      className: 'border-t',
    },
    {
      orientation: 'horizontal',
      variant: 'dotted',
      className: 'border-t',
    },
    {
      orientation: 'vertical',
      variant: 'dashed',
      className: 'border-l',
    },
    {
      orientation: 'vertical',
      variant: 'dotted',
      className: 'border-l',
    },
    {
      size: 'lg',
      orientation: 'horizontal',
      className: 'h-0.5',
    },
    {
      size: 'lg',
      orientation: 'vertical',
      className: 'w-0.5',
    },
  ],
  defaultVariants: {
    orientation: 'horizontal',
    variant: 'solid',
    size: 'md',
  },
});

export interface DividerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof dividerVariants> {
  label?: string;
}

export const Divider: React.FC<DividerProps> = ({
  orientation,
  variant,
  size,
  label,
  className,
  ...props
}) => {
  if (label && orientation === 'horizontal') {
    return (
      <div className={cn('relative flex items-center', className)} {...props}>
        <div className={cn(dividerVariants({ orientation, variant, size }), 'flex-1')} />
        <span className="px-4 text-sm text-neutral-500 bg-white">{label}</span>
        <div className={cn(dividerVariants({ orientation, variant, size }), 'flex-1')} />
      </div>
    );
  }

  return (
    <div
      className={cn(dividerVariants({ orientation, variant, size }), className)}
      role="separator"
      {...props}
    />
  );
};

// Spacer Component
export interface SpacerProps {
  size?: number | string;
  axis?: 'x' | 'y' | 'both';
}

export const Spacer: React.FC<SpacerProps> = ({ size = 4, axis = 'y' }) => {
  const sizeClass = typeof size === 'number' ?
    (size === 1 ? '1' :
     size === 2 ? '2' :
     size === 3 ? '3' :
     size === 4 ? '4' :
     size === 6 ? '6' :
     size === 8 ? '8' :
     size === 12 ? '12' :
     size === 16 ? '16' :
     size === 20 ? '20' :
     size === 24 ? '24' :
     '4') : size;

  const className = axis === 'x' ? `w-${sizeClass}` :
                   axis === 'y' ? `h-${sizeClass}` :
                   `w-${sizeClass} h-${sizeClass}`;

  return <div className={className} />;
};

// Section Component
const sectionVariants = cva('', {
  variants: {
    size: {
      sm: 'py-8',
      md: 'py-12',
      lg: 'py-16',
      xl: 'py-20',
    },
    variant: {
      default: '',
      filled: 'bg-neutral-50',
      bordered: 'border-t border-b border-neutral-200',
    },
  },
  defaultVariants: {
    size: 'md',
    variant: 'default',
  },
});

export interface SectionProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof sectionVariants> {}

export const Section: React.FC<SectionProps> = ({
  size,
  variant,
  className,
  children,
  ...props
}) => {
  return (
    <section className={cn(sectionVariants({ size, variant }), className)} {...props}>
      {children}
    </section>
  );
};

// Aspect Ratio Component
export interface AspectRatioProps extends React.HTMLAttributes<HTMLDivElement> {
  ratio?: number; // width/height ratio
  children: ReactNode;
}

export const AspectRatio: React.FC<AspectRatioProps> = ({
  ratio = 16/9,
  className,
  children,
  ...props
}) => {
  return (
    <div className={cn('relative w-full', className)} {...props}>
      <div
        className="w-full"
        style={{ paddingBottom: `${(1 / ratio) * 100}%` }}
      />
      <div className="absolute inset-0">
        {children}
      </div>
    </div>
  );
};

// Center Component
export interface CenterProps extends React.HTMLAttributes<HTMLDivElement> {
  axis?: 'x' | 'y' | 'both';
  inline?: boolean;
}

export const Center: React.FC<CenterProps> = ({
  axis = 'both',
  inline = false,
  className,
  children,
  ...props
}) => {
  const Component = inline ? 'span' : 'div';
  const baseClasses = inline ? 'inline-flex' : 'flex';

  const axisClasses = {
    x: 'justify-center',
    y: 'items-center',
    both: 'justify-center items-center',
  };

  return (
    <Component
      className={cn(baseClasses, axisClasses[axis], className)}
      {...props}
    >
      {children}
    </Component>
  );
};

// Box Component (Generic container with common styling props)
const boxVariants = cva('', {
  variants: {
    p: {
      0: 'p-0',
      1: 'p-1',
      2: 'p-2',
      3: 'p-3',
      4: 'p-4',
      6: 'p-6',
      8: 'p-8',
      12: 'p-12',
    },
    m: {
      0: 'm-0',
      1: 'm-1',
      2: 'm-2',
      3: 'm-3',
      4: 'm-4',
      6: 'm-6',
      8: 'm-8',
      12: 'm-12',
      auto: 'm-auto',
    },
    bg: {
      transparent: 'bg-transparent',
      white: 'bg-white',
      neutral: 'bg-neutral-50',
      primary: 'bg-primary-50',
      secondary: 'bg-secondary-50',
      success: 'bg-success-50',
      warning: 'bg-warning-50',
      error: 'bg-error-50',
    },
    rounded: {
      none: 'rounded-none',
      sm: 'rounded-sm',
      md: 'rounded-md',
      lg: 'rounded-lg',
      xl: 'rounded-xl',
      full: 'rounded-full',
    },
    shadow: {
      none: 'shadow-none',
      sm: 'shadow-sm',
      md: 'shadow-md',
      lg: 'shadow-lg',
      xl: 'shadow-xl',
    },
    border: {
      none: 'border-0',
      sm: 'border',
      md: 'border-2',
      lg: 'border-4',
    },
  },
});

export interface BoxProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof boxVariants> {
  as?: React.ElementType;
}

export const Box: React.FC<BoxProps> = ({
  as: Component = 'div',
  p,
  m,
  bg,
  rounded,
  shadow,
  border,
  className,
  children,
  ...props
}) => {
  return (
    <Component
      className={cn(boxVariants({ p, m, bg, rounded, shadow, border }), className)}
      {...props}
    >
      {children}
    </Component>
  );
};

// Responsive utilities
export const useBreakpoint = () => {
  const [breakpoint, setBreakpoint] = React.useState<'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'>('xs');

  React.useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      if (width >= 1536) setBreakpoint('2xl');
      else if (width >= 1280) setBreakpoint('xl');
      else if (width >= 1024) setBreakpoint('lg');
      else if (width >= 768) setBreakpoint('md');
      else if (width >= 640) setBreakpoint('sm');
      else setBreakpoint('xs');
    };

    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);

  return breakpoint;
};

// Show/Hide components based on breakpoints
export interface ResponsiveProps {
  children: ReactNode;
  above?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  below?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  only?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export const Show: React.FC<ResponsiveProps> = ({ children, above, below, only }) => {
  let className = '';

  if (above) {
    const breakpoints = { xs: '', sm: 'sm:', md: 'md:', lg: 'lg:', xl: 'xl:' };
    className = `hidden ${breakpoints[above]}block`;
  } else if (below) {
    const breakpoints = { sm: 'sm:', md: 'md:', lg: 'lg:', xl: 'xl:', '2xl': '2xl:' };
    className = `block ${breakpoints[below]}hidden`;
  } else if (only) {
    const ranges = {
      xs: 'block sm:hidden',
      sm: 'hidden sm:block md:hidden',
      md: 'hidden md:block lg:hidden',
      lg: 'hidden lg:block xl:hidden',
      xl: 'hidden xl:block 2xl:hidden',
      '2xl': 'hidden 2xl:block',
    };
    className = ranges[only];
  }

  return <div className={className}>{children}</div>;
};

export const Hide: React.FC<ResponsiveProps> = ({ children, above, below, only }) => {
  let className = '';

  if (above) {
    const breakpoints = { xs: '', sm: 'sm:', md: 'md:', lg: 'lg:', xl: 'xl:' };
    className = `block ${breakpoints[above]}hidden`;
  } else if (below) {
    const breakpoints = { sm: 'sm:', md: 'md:', lg: 'lg:', xl: 'xl:', '2xl': '2xl:' };
    className = `hidden ${breakpoints[below]}block`;
  } else if (only) {
    const ranges = {
      xs: 'hidden sm:block',
      sm: 'block sm:hidden md:block',
      md: 'block md:hidden lg:block',
      lg: 'block lg:hidden xl:block',
      xl: 'block xl:hidden 2xl:block',
      '2xl': 'block 2xl:hidden',
    };
    className = ranges[only];
  }

  return <div className={className}>{children}</div>;
};

export default Container;