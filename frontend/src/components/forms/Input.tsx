import React, { useState } from 'react';
import { InputProps } from '@/types';
import styles from './Input.module.css';

/**
 * Input Component
 *
 * A styled input field with label, error state, and various configurations.
 * Supports all standard HTML input types and accessibility features.
 *
 * @example
 * <Input
 *   label="Email Address"
 *   type="email"
 *   value={email}
 *   onChange={setEmail}
 *   placeholder="Enter your email"
 *   required
 * />
 */
const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  type = 'text',
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  className = '',
}) => {
  const [focused, setFocused] = useState(false);
  const inputId = React.useId();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const inputClasses = [
    styles.input,
    error && styles.error,
    focused && styles.focused,
    disabled && styles.disabled,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const containerClasses = [
    styles.container,
    error && styles.containerError,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={containerClasses}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
          {required && <span className={styles.required} aria-label="required">*</span>}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        value={value}
        onChange={handleChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={inputClasses}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : undefined}
      />
      {error && (
        <div id={`${inputId}-error`} className={styles.errorMessage} role="alert">
          {error}
        </div>
      )}
    </div>
  );
};

export default Input;