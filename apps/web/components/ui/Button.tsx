import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
    size?: 'sm' | 'md' | 'lg';
    icon?: LucideIcon;
    iconPosition?: 'start' | 'end';
    loading?: boolean;
    fullWidth?: boolean;
    children: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({
        variant = 'primary',
        size = 'md',
        icon: Icon,
        iconPosition = 'start',
        loading = false,
        fullWidth = false,
        disabled,
        className = '',
        children,
        ...props
    }, ref) => {
        // Base classes for all buttons
        const baseClasses = [
            'inline-flex',
            'items-center',
            'justify-center',
            'font-semibold',
            'transition-all',
            'duration-200',
            'ease-in-out',
            'focus:outline-none',
            'focus:ring-2',
            'focus:ring-blue-600',
            'focus:ring-offset-2',
            'disabled:opacity-60',
            'disabled:cursor-not-allowed',
            'rounded-xl',
            'border',
            'select-none',
            'relative',
            'overflow-hidden'
        ].join(' ');

        // Size variants
        const sizeClasses = {
            sm: 'h-10 px-3 text-sm gap-2',
            md: 'h-12 px-4 text-base gap-2',
            lg: 'h-14 px-5 text-lg gap-3'
        };

        // Color variants
        const variantClasses = {
            primary: [
                'bg-green-600',
                'text-white',
                'border-green-600',
                'shadow-sm',
                'hover:bg-green-700',
                'hover:border-green-700',
                'hover:shadow-md',
                'active:scale-[0.98]',
                'active:bg-green-800'
            ].join(' '),

            secondary: [
                'bg-emerald-50',
                'text-emerald-700',
                'border-emerald-200',
                'hover:bg-emerald-100',
                'hover:border-emerald-300',
                'active:scale-[0.98]',
                'active:bg-emerald-200'
            ].join(' '),

            outline: [
                'bg-transparent',
                'text-emerald-700',
                'border-emerald-600',
                'hover:bg-emerald-50',
                'hover:border-emerald-700',
                'active:scale-[0.98]',
                'active:bg-emerald-100'
            ].join(' '),

            ghost: [
                'bg-transparent',
                'text-emerald-700',
                'border-transparent',
                'hover:bg-emerald-50',
                'hover:border-emerald-200',
                'active:scale-[0.98]',
                'active:bg-emerald-100'
            ].join(' '),

            destructive: [
                'bg-red-600',
                'text-white',
                'border-red-600',
                'shadow-sm',
                'hover:bg-red-700',
                'hover:border-red-700',
                'hover:shadow-md',
                'active:scale-[0.98]',
                'active:bg-red-800'
            ].join(' ')
        };

        // Icon sizes based on button size
        const iconSizes = {
            sm: 16,
            md: 20,
            lg: 24
        };

        // Full width class
        const widthClass = fullWidth ? 'w-full' : '';

        // Combine all classes
        const combinedClasses = [
            baseClasses,
            sizeClasses[size],
            variantClasses[variant],
            widthClass,
            className
        ].filter(Boolean).join(' ');

        // Render icon or loading spinner
        const renderIcon = () => {
            if (loading) {
                return (
                    <Loader2
                        size={iconSizes[size]}
                        className="animate-spin shrink-0"
                    />
                );
            }

            if (Icon) {
                return (
                    <Icon
                        size={iconSizes[size]}
                        className="shrink-0"
                    />
                );
            }

            return null;
        };

        return (
            <button
                ref={ref}
                className={combinedClasses}
                disabled={disabled || loading}
                {...props}
            >
                {iconPosition === 'start' && renderIcon()}
                <span className={loading ? 'opacity-70' : ''}>{children}</span>
                {iconPosition === 'end' && renderIcon()}
            </button>
        );
    }
);

Button.displayName = 'Button';

export default Button;
