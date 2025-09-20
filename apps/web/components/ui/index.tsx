/**
 * Klynaa (TrashBee) UI Component Library
 * Enterprise-grade component system following Uber × Fiverr design philosophy
 */

import React, { ButtonHTMLAttributes, InputHTMLAttributes, SelectHTMLAttributes } from 'react';
import Link from 'next/link';

// =============================================================================
// BUTTON COMPONENTS
// =============================================================================

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    href?: string;
    children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    size = 'md',
    href,
    children,
    className = '',
    ...props
}) => {
    const baseClasses = 'btn';
    const variantClasses = {
        primary: 'btn-primary',
        secondary: 'btn-secondary',
        ghost: 'btn-ghost'
    };
    const sizeClasses = {
        sm: 'btn-sm',
        md: '',
        lg: 'btn-lg'
    };

    const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`.trim();

    if (href) {
        return (
            <Link href={href} className={classes}>
                {children}
            </Link>
        );
    }

    return (
        <button className={classes} {...props}>
            {children}
        </button>
    );
};

// =============================================================================
// CARD COMPONENTS
// =============================================================================

interface CardProps {
    children: React.ReactNode;
    interactive?: boolean;
    className?: string;
}

export const Card: React.FC<CardProps> = ({
    children,
    interactive = false,
    className = ''
}) => {
    const classes = `card ${interactive ? 'card-interactive' : ''} ${className}`.trim();

    return (
        <div className={classes}>
            {children}
        </div>
    );
};

// =============================================================================
// FORM COMPONENTS
// =============================================================================

interface FormGroupProps {
    children: React.ReactNode;
    className?: string;
}

export const FormGroup: React.FC<FormGroupProps> = ({ children, className = '' }) => (
    <div className={`form-group ${className}`}>
        {children}
    </div>
);

interface FormLabelProps {
    children: React.ReactNode;
    htmlFor?: string;
    required?: boolean;
}

export const FormLabel: React.FC<FormLabelProps> = ({ children, htmlFor, required }) => (
    <label htmlFor={htmlFor} className="form-label">
        {children}
        {required && <span style={{ color: 'var(--color-error)' }}>*</span>}
    </label>
);

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
    error?: string;
}

export const FormInput: React.FC<FormInputProps> = ({ error, className = '', ...props }) => (
    <div>
        <input
            className={`form-input ${error ? 'form-input-error' : ''} ${className}`}
            {...props}
        />
        {error && <p className="form-error">{error}</p>}
    </div>
);

interface FormSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    options: { value: string; label: string }[];
    error?: string;
}

export const FormSelect: React.FC<FormSelectProps> = ({
    options,
    error,
    className = '',
    ...props
}) => (
    <div>
        <select className={`form-input form-select ${error ? 'form-input-error' : ''} ${className}`} {...props}>
            {options.map(option => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
        {error && <p className="form-error">{error}</p>}
    </div>
);

// =============================================================================
// BADGE COMPONENTS
// =============================================================================

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'success' | 'warning' | 'error' | 'info';
    className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
    children,
    variant = 'info',
    className = ''
}) => {
    const variantClasses = {
        success: 'badge-success',
        warning: 'badge-warning',
        error: 'badge-error',
        info: 'badge-info'
    };

    return (
        <span className={`badge ${variantClasses[variant]} ${className}`}>
            {children}
        </span>
    );
};

// =============================================================================
// MODAL COMPONENTS
// =============================================================================

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    title?: string;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                {title && (
                    <div style={{
                        padding: 'var(--space-6)',
                        borderBottom: '1px solid var(--color-gray-200)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <h2 style={{
                            fontSize: 'var(--text-xl)',
                            fontWeight: '600',
                            color: 'var(--color-gray-900)'
                        }}>
                            {title}
                        </h2>
                        <button
                            onClick={onClose}
                            style={{
                                padding: 'var(--space-2)',
                                borderRadius: 'var(--radius-md)',
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                color: 'var(--color-gray-500)'
                            }}
                        >
                            ✕
                        </button>
                    </div>
                )}
                <div style={{ padding: 'var(--space-6)' }}>
                    {children}
                </div>
            </div>
        </div>
    );
};

// =============================================================================
// TOAST NOTIFICATIONS
// =============================================================================

interface ToastProps {
    message: string;
    type?: 'success' | 'error' | 'warning' | 'info';
    isVisible: boolean;
    onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({
    message,
    type = 'info',
    isVisible,
    onClose
}) => {
    const typeStyles = {
        success: { borderColor: 'var(--color-success)', color: 'var(--color-success)' },
        error: { borderColor: 'var(--color-error)', color: 'var(--color-error)' },
        warning: { borderColor: 'var(--color-warning)', color: 'var(--color-warning)' },
        info: { borderColor: 'var(--color-info)', color: 'var(--color-info)' }
    };

    if (!isVisible) return null;

    return (
        <div className="toast" style={typeStyles[type]}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{message}</span>
                <button
                    onClick={onClose}
                    style={{
                        marginLeft: 'var(--space-4)',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'inherit'
                    }}
                >
                    ✕
                </button>
            </div>
        </div>
    );
};

// =============================================================================
// LAYOUT COMPONENTS
// =============================================================================

interface ContainerProps {
    children: React.ReactNode;
    className?: string;
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export const Container: React.FC<ContainerProps> = ({
    children,
    className = '',
    maxWidth = 'xl'
}) => {
    const maxWidthClasses = {
        sm: 'max-w-screen-sm',
        md: 'max-w-screen-md',
        lg: 'max-w-screen-lg',
        xl: 'max-w-screen-xl',
        '2xl': 'max-w-screen-2xl'
    };

    return (
        <div className={`${maxWidthClasses[maxWidth]} mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>
            {children}
        </div>
    );
};

interface SectionProps {
    children: React.ReactNode;
    className?: string;
    background?: 'white' | 'gray' | 'primary';
    padding?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Section: React.FC<SectionProps> = ({
    children,
    className = '',
    background = 'white',
    padding = 'lg'
}) => {
    const backgroundClasses = {
        white: 'bg-white',
        gray: 'bg-gray-50',
        primary: 'bg-primary-50'
    };

    const paddingClasses = {
        sm: 'py-8',
        md: 'py-12',
        lg: 'py-16',
        xl: 'py-24'
    };

    return (
        <section className={`${backgroundClasses[background]} ${paddingClasses[padding]} ${className}`}>
            {children}
        </section>
    );
};

// =============================================================================
// NAVIGATION COMPONENTS
// =============================================================================

interface NavLinkProps {
    href: string;
    children: React.ReactNode;
    active?: boolean;
    mobile?: boolean;
}

export const NavLink: React.FC<NavLinkProps> = ({
    href,
    children,
    active = false,
    mobile = false
}) => {
    const className = mobile
        ? `mobile-menu-link ${active ? 'active' : ''}`
        : `navbar-link ${active ? 'active' : ''}`;

    return (
        <Link href={href} className={className}>
            {children}
        </Link>
    );
};

// =============================================================================
// UTILITY EXPORTS
// =============================================================================

export const UI = {
    Button,
    Card,
    FormGroup,
    FormLabel,
    FormInput,
    FormSelect,
    Badge,
    Modal,
    Toast,
    Container,
    Section,
    NavLink
};

export default UI;
