import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../utils/cn';
import { Button } from '../atoms/Button';
import { Icon } from '../atoms/Icon';

export interface DropdownOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface DropdownProps {
  options: DropdownOption[];
  value?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
  className?: string;
  disabled?: boolean;
}

export const Dropdown: React.FC<DropdownProps> = ({
  options,
  value,
  placeholder = 'Select an option',
  onChange,
  className,
  disabled
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(option => option.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionValue: string) => {
    onChange?.(optionValue);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className={cn('relative', className)}>
      <Button
        type="button"
        variant="outline"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className="w-full justify-between text-left"
      >
        <span className={cn(!selectedOption && 'text-gray-500')}>
          {selectedOption?.label || placeholder}
        </span>
        <Icon
          name={isOpen ? 'close' : 'menu'}
          size="sm"
          className={cn(
            'ml-2 transition-transform',
            isOpen && 'rotate-180'
          )}
        />
      </Button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              className={cn(
                'w-full px-4 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none',
                option.disabled && 'opacity-50 cursor-not-allowed',
                value === option.value && 'bg-blue-50 text-blue-600'
              )}
              onClick={() => !option.disabled && handleSelect(option.value)}
              disabled={option.disabled}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};