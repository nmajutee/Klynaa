import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

// Button variant configurations using CVA
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        // Primary Actions
        primary: 'bg-primary-600 text-white shadow-sm hover:bg-primary-700 active:bg-primary-800',
        secondary: 'bg-neutral-100 text-neutral-900 shadow-sm hover:bg-neutral-200 active:bg-neutral-300',
        outline: 'border border-neutral-300 bg-transparent text-neutral-700 shadow-sm hover:bg-neutral-50 hover:border-neutral-400',
        ghost: 'bg-transparent text-neutral-700 hover:bg-neutral-100 active:bg-neutral-200',

        // Semantic Actions
        success: 'bg-success-600 text-white shadow-sm hover:bg-success-700 active:bg-success-800',
        warning: 'bg-warning-600 text-white shadow-sm hover:bg-warning-700 active:bg-warning-800',
        destructive: 'bg-error-600 text-white shadow-sm hover:bg-error-700 active:bg-error-800',

        // Special Actions
        link: 'text-primary-600 underline-offset-4 hover:underline hover:text-primary-700',
        gradient: 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg hover:from-primary-700 hover:to-primary-600',
      },
      size: {
        xs: 'h-7 px-2 text-xs',
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-sm',
        lg: 'h-11 px-6 text-base',
        xl: 'h-12 px-8 text-lg',
        icon: 'h-10 w-10',
        'icon-sm': 'h-8 w-8',
        'icon-lg': 'h-12 w-12',
      },
      fullWidth: {
        true: 'w-full',
        false: 'w-auto',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      loading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, fullWidth }), className)}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
        )}
        {!loading && leftIcon}
        {children}
        {!loading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';

// Icon Button Component
export interface IconButtonProps extends Omit<ButtonProps, 'leftIcon' | 'rightIcon'> {
  icon: React.ReactNode;
  'aria-label': string;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, size = 'icon', ...props }, ref) => {
    return (
      <Button size={size} ref={ref} {...props}>
        {icon}
      </Button>
    );
  }
);

IconButton.displayName = 'IconButton';

// Button Group Component
export interface ButtonGroupProps {
  children: React.ReactNode;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
  size?: VariantProps<typeof buttonVariants>['size'];
}

export const ButtonGroup: React.FC<ButtonGroupProps> = ({
  children,
  className,
  orientation = 'horizontal',
  size,
}) => {
  const groupClasses = cn(
    'inline-flex',
    orientation === 'horizontal' ? 'flex-row' : 'flex-col',
    '[&>button]:rounded-none [&>button:first-child]:rounded-l-lg [&>button:last-child]:rounded-r-lg',
    orientation === 'vertical' && '[&>button:first-child]:rounded-t-lg [&>button:first-child]:rounded-l-lg [&>button:last-child]:rounded-b-lg [&>button:last-child]:rounded-l-lg',
    '[&>button:not(:last-child)]:border-r-0',
    orientation === 'vertical' && '[&>button:not(:last-child)]:border-b-0 [&>button:not(:last-child)]:border-r',
    className
  );

  return (
    <div className={groupClasses}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          const childElement = child as React.ReactElement<any>;
          return React.cloneElement(childElement, {
            size,
            ...(childElement.props || {})
          });
        }
        return child;
      })}
    </div>
  );
};

// Floating Action Button (FAB)
export interface FABProps extends Omit<ButtonProps, 'variant' | 'size'> {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  size?: 'md' | 'lg';
}

export const FAB = React.forwardRef<HTMLButtonElement, FABProps>(
  ({ position = 'bottom-right', size = 'lg', className, ...props }, ref) => {
    const positionClasses = {
      'bottom-right': 'fixed bottom-6 right-6',
      'bottom-left': 'fixed bottom-6 left-6',
      'top-right': 'fixed top-6 right-6',
      'top-left': 'fixed top-6 left-6',
    };

    return (
      <Button
        variant="primary"
        size={size === 'lg' ? 'icon-lg' : 'icon'}
        className={cn(
          positionClasses[position],
          'rounded-full shadow-lg hover:shadow-xl z-50',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

FAB.displayName = 'FAB';

export default Button;