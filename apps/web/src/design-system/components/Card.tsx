import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

// Card variant configurations
const cardVariants = cva(
  'bg-white rounded-lg border border-neutral-200 shadow-sm transition-all duration-200',
  {
    variants: {
      variant: {
        default: 'hover:shadow-md',
        elevated: 'shadow-lg hover:shadow-xl',
        outlined: 'border-2 shadow-none hover:border-primary-200',
        ghost: 'border-none shadow-none bg-transparent',
        gradient: 'bg-gradient-to-br from-white to-neutral-50 border-none shadow-md',
      },
      padding: {
        none: 'p-0',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
      },
      interactive: {
        true: 'cursor-pointer hover:bg-neutral-50 active:bg-neutral-100',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md',
      interactive: false,
    },
  }
);

// Base Card Component
export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  children: React.ReactNode;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, interactive, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant, padding, interactive }), className)}
      {...props}
    >
      {children}
    </div>
  )
);

Card.displayName = 'Card';

// Card Header Component
export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  border?: boolean;
}

export const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, children, border = false, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex flex-col space-y-1.5',
        border && 'pb-4 border-b border-neutral-200',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);

CardHeader.displayName = 'CardHeader';

// Card Title Component
export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, children, as: Component = 'h3', ...props }, ref) => (
    <Component
      ref={ref}
      className={cn('text-lg font-semibold leading-none tracking-tight text-neutral-900', className)}
      {...props}
    >
      {children}
    </Component>
  )
);

CardTitle.displayName = 'CardTitle';

// Card Description Component
export interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

export const CardDescription = React.forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className, children, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('text-sm text-neutral-600 leading-relaxed', className)}
      {...props}
    >
      {children}
    </p>
  )
);

CardDescription.displayName = 'CardDescription';

// Card Content Component
export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn('', className)} {...props}>
      {children}
    </div>
  )
);

CardContent.displayName = 'CardContent';

// Card Footer Component
export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  border?: boolean;
}

export const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, children, border = false, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex items-center',
        border && 'pt-4 border-t border-neutral-200',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);

CardFooter.displayName = 'CardFooter';

// Stats Card Component
export interface StatsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
  };
  icon?: React.ReactNode;
  className?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  change,
  icon,
  className,
}) => {
  return (
    <Card variant="default" className={className}>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <CardDescription>{title}</CardDescription>
            <div className="text-2xl font-bold text-neutral-900">{value}</div>
            {change && (
              <div
                className={cn(
                  'flex items-center text-sm font-medium',
                  change.type === 'increase' ? 'text-success-600' : 'text-error-600'
                )}
              >
                <span className="mr-1">
                  {change.type === 'increase' ? '↗️' : '↘️'}
                </span>
                {Math.abs(change.value)}%
              </div>
            )}
          </div>
          {icon && (
            <div className="text-neutral-400">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Feature Card Component
export interface FeatureCardProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  action,
  className,
}) => {
  return (
    <Card variant="default" className={className}>
      <CardContent>
        {icon && (
          <div className="mb-4 text-primary-600">
            {icon}
          </div>
        )}
        <CardTitle className="mb-2">{title}</CardTitle>
        <CardDescription className="mb-4">{description}</CardDescription>
        {action && <div>{action}</div>}
      </CardContent>
    </Card>
  );
};

// Pricing Card Component
export interface PricingCardProps {
  title: string;
  price: {
    amount: number;
    currency?: string;
    period?: string;
  };
  features: string[];
  popular?: boolean;
  action?: React.ReactNode;
  className?: string;
}

export const PricingCard: React.FC<PricingCardProps> = ({
  title,
  price,
  features,
  popular = false,
  action,
  className,
}) => {
  return (
    <Card
      variant={popular ? 'elevated' : 'default'}
      className={cn(
        'relative',
        popular && 'border-primary-200 ring-2 ring-primary-200',
        className
      )}
    >
      {popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-primary-600 text-white px-3 py-1 rounded-full text-xs font-medium">
            Popular
          </span>
        </div>
      )}
      <CardHeader border>
        <CardTitle>{title}</CardTitle>
        <div className="text-3xl font-bold text-neutral-900">
          {price.currency || '$'}{price.amount}
          {price.period && (
            <span className="text-sm text-neutral-500 font-normal">
              /{price.period}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center text-sm text-neutral-600">
              <span className="mr-2 text-success-600">✓</span>
              {feature}
            </li>
          ))}
        </ul>
      </CardContent>
      {action && (
        <CardFooter>
          {action}
        </CardFooter>
      )}
    </Card>
  );
};

export default Card;