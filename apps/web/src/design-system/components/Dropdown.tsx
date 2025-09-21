import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { Icons } from './Icons';
import { Button } from './Button';

// Tooltip Component
const tooltipVariants = cva(
  'absolute z-50 px-3 py-2 text-sm text-white bg-neutral-900 rounded-md shadow-lg pointer-events-none transition-all duration-200',
  {
    variants: {
      placement: {
        top: '-translate-x-1/2 -translate-y-full mb-2',
        bottom: '-translate-x-1/2 translate-y-full mt-2',
        left: '-translate-y-1/2 -translate-x-full mr-2',
        right: '-translate-y-1/2 translate-x-full ml-2',
        'top-start': '-translate-y-full mb-2',
        'top-end': '-translate-y-full mb-2 -translate-x-full',
        'bottom-start': 'translate-y-full mt-2',
        'bottom-end': 'translate-y-full mt-2 -translate-x-full',
      },
      variant: {
        default: 'bg-neutral-900 text-white',
        light: 'bg-white text-neutral-900 border border-neutral-200 shadow-md',
        error: 'bg-error-600 text-white',
        success: 'bg-success-600 text-white',
        warning: 'bg-warning-600 text-white',
      },
    },
    defaultVariants: {
      placement: 'top',
      variant: 'default',
    },
  }
);

export interface TooltipProps extends VariantProps<typeof tooltipVariants> {
  children: React.ReactNode;
  content: React.ReactNode;
  disabled?: boolean;
  delay?: number;
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  children,
  content,
  placement = 'top',
  variant = 'default',
  disabled = false,
  delay = 500,
  className,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const showTooltip = () => {
    if (disabled) return;

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
        const scrollY = window.pageYOffset || document.documentElement.scrollTop;

        let x = rect.left + scrollX;
        let y = rect.top + scrollY;

        // Adjust position based on placement
        switch (placement) {
          case 'top':
          case 'top-start':
          case 'top-end':
            y = rect.top + scrollY;
            break;
          case 'bottom':
          case 'bottom-start':
          case 'bottom-end':
            y = rect.bottom + scrollY;
            break;
          case 'left':
            x = rect.left + scrollX;
            y = rect.top + rect.height / 2 + scrollY;
            break;
          case 'right':
            x = rect.right + scrollX;
            y = rect.top + rect.height / 2 + scrollY;
            break;
        }

        if (placement === 'top' || placement === 'bottom') {
          x = rect.left + rect.width / 2 + scrollX;
        }

        setPosition({ x, y });
        setIsVisible(true);
      }
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const tooltipElement = isVisible && (
    <div
      className={cn(tooltipVariants({ placement, variant }), className)}
      style={{
        left: position.x,
        top: position.y,
      }}
    >
      {content}
      {/* Arrow */}
      <div
        className={cn(
          'absolute w-2 h-2 rotate-45',
          variant === 'light' ? 'bg-white border-l border-t border-neutral-200' : 'bg-neutral-900',
          {
            'top-full left-1/2 -translate-x-1/2 -translate-y-1/2': placement === 'top',
            'bottom-full left-1/2 -translate-x-1/2 translate-y-1/2': placement === 'bottom',
            'top-1/2 left-full -translate-y-1/2 -translate-x-1/2': placement === 'left',
            'top-1/2 right-full -translate-y-1/2 translate-x-1/2': placement === 'right',
            'top-full left-4 -translate-y-1/2': placement === 'top-start',
            'top-full right-4 -translate-y-1/2': placement === 'top-end',
            'bottom-full left-4 translate-y-1/2': placement === 'bottom-start',
            'bottom-full right-4 translate-y-1/2': placement === 'bottom-end',
          }
        )}
      />
    </div>
  );

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        className="inline-block"
      >
        {children}
      </div>
      {tooltipElement && createPortal(tooltipElement, document.body)}
    </>
  );
};

// Dropdown Component
const dropdownVariants = cva(
  'absolute z-50 min-w-[160px] bg-white border border-neutral-200 rounded-md shadow-lg py-1 transition-all duration-200',
  {
    variants: {
      size: {
        sm: 'min-w-[120px] text-sm',
        md: 'min-w-[160px]',
        lg: 'min-w-[200px]',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

export interface DropdownItem {
  id: string;
  label: React.ReactNode;
  value?: any;
  disabled?: boolean;
  destructive?: boolean;
  icon?: React.ComponentType<any>;
  onClick?: () => void;
  divider?: boolean;
}

export interface DropdownProps extends VariantProps<typeof dropdownVariants> {
  trigger: React.ReactNode;
  items: DropdownItem[];
  placement?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';
  disabled?: boolean;
  className?: string;
  onSelect?: (item: DropdownItem) => void;
}

export const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  items,
  size = 'md',
  placement = 'bottom-start',
  disabled = false,
  className,
  onSelect,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const calculatePosition = () => {
    if (!triggerRef.current) return;

    const rect = triggerRef.current.getBoundingClientRect();
    const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;

    let x = rect.left + scrollX;
    let y = rect.bottom + scrollY;

    switch (placement) {
      case 'bottom-start':
        x = rect.left + scrollX;
        y = rect.bottom + scrollY + 4;
        break;
      case 'bottom-end':
        x = rect.right + scrollX;
        y = rect.bottom + scrollY + 4;
        break;
      case 'top-start':
        x = rect.left + scrollX;
        y = rect.top + scrollY - 4;
        break;
      case 'top-end':
        x = rect.right + scrollX;
        y = rect.top + scrollY - 4;
        break;
    }

    setPosition({ x, y });
  };

  const toggleDropdown = () => {
    if (disabled) return;

    if (!isOpen) {
      calculatePosition();
    }
    setIsOpen(!isOpen);
  };

  const handleItemClick = (item: DropdownItem) => {
    if (item.disabled) return;

    item.onClick?.();
    onSelect?.(item);
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close dropdown on escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const dropdownElement = isOpen && (
    <div
      ref={dropdownRef}
      className={cn(
        dropdownVariants({ size }),
        {
          'origin-top-left': placement.includes('start'),
          'origin-top-right': placement.includes('end'),
          'origin-bottom-left': placement.startsWith('top') && placement.includes('start'),
          'origin-bottom-right': placement.startsWith('top') && placement.includes('end'),
        },
        className
      )}
      style={{
        left: placement.includes('end') ? position.x - (dropdownRef.current?.offsetWidth || 0) : position.x,
        top: placement.startsWith('top') ? position.y - (dropdownRef.current?.offsetHeight || 0) : position.y,
      }}
    >
      {items.map((item, index) => (
        <React.Fragment key={item.id}>
          {item.divider && index > 0 && (
            <div className="border-t border-neutral-200 my-1" />
          )}
          <button
            className={cn(
              'w-full px-4 py-2 text-left text-sm transition-colors flex items-center space-x-2',
              item.disabled
                ? 'text-neutral-400 cursor-not-allowed'
                : item.destructive
                ? 'text-error-600 hover:bg-error-50'
                : 'text-neutral-700 hover:bg-neutral-100'
            )}
            onClick={() => handleItemClick(item)}
            disabled={item.disabled}
          >
            {item.icon && (
              <item.icon
                className={cn(
                  'h-4 w-4',
                  item.destructive && 'text-error-500'
                )}
              />
            )}
            <span className="flex-1">{item.label}</span>
          </button>
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <>
      <div ref={triggerRef} onClick={toggleDropdown} className="inline-block">
        {trigger}
      </div>
      {dropdownElement && createPortal(dropdownElement, document.body)}
    </>
  );
};

// Menu Button (common dropdown trigger)
export interface MenuButtonProps {
  children?: React.ReactNode;
  variant?: 'ghost' | 'outline' | 'primary';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
}

export const MenuButton: React.FC<MenuButtonProps> = ({
  children,
  variant = 'ghost',
  size = 'md',
  disabled = false,
  className,
}) => {
  return (
    <Button
      variant={variant}
      size={size}
      disabled={disabled}
      className={cn('flex items-center space-x-2', className)}
    >
      {children}
      <Icons.ChevronDown className="h-4 w-4" />
    </Button>
  );
};

// Popover Component (more flexible than dropdown)
export interface PopoverProps {
  trigger: React.ReactNode;
  content: React.ReactNode;
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end';
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  closeOnClickOutside?: boolean;
  className?: string;
}

export const Popover: React.FC<PopoverProps> = ({
  trigger,
  content,
  placement = 'bottom-start',
  isOpen: controlledIsOpen,
  onOpenChange,
  disabled = false,
  closeOnClickOutside = true,
  className,
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const setIsOpen = onOpenChange || setInternalIsOpen;

  const calculatePosition = () => {
    if (!triggerRef.current) return;

    const rect = triggerRef.current.getBoundingClientRect();
    const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;

    let x = rect.left + scrollX;
    let y = rect.bottom + scrollY + 8;

    // Adjust based on placement
    switch (placement) {
      case 'top':
        x = rect.left + rect.width / 2 + scrollX;
        y = rect.top + scrollY - 8;
        break;
      case 'bottom':
        x = rect.left + rect.width / 2 + scrollX;
        y = rect.bottom + scrollY + 8;
        break;
      case 'left':
        x = rect.left + scrollX - 8;
        y = rect.top + rect.height / 2 + scrollY;
        break;
      case 'right':
        x = rect.right + scrollX + 8;
        y = rect.top + rect.height / 2 + scrollY;
        break;
      case 'top-start':
        x = rect.left + scrollX;
        y = rect.top + scrollY - 8;
        break;
      case 'top-end':
        x = rect.right + scrollX;
        y = rect.top + scrollY - 8;
        break;
      case 'bottom-start':
        x = rect.left + scrollX;
        y = rect.bottom + scrollY + 8;
        break;
      case 'bottom-end':
        x = rect.right + scrollX;
        y = rect.bottom + scrollY + 8;
        break;
    }

    setPosition({ x, y });
  };

  const togglePopover = () => {
    if (disabled) return;

    if (!isOpen) {
      calculatePosition();
    }
    setIsOpen(!isOpen);
  };

  // Close on click outside
  useEffect(() => {
    if (!closeOnClickOutside || !isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, closeOnClickOutside, setIsOpen]);

  const popoverElement = isOpen && (
    <div
      ref={popoverRef}
      className={cn(
        'absolute z-50 bg-white border border-neutral-200 rounded-md shadow-lg transition-all duration-200',
        className
      )}
      style={{
        left: placement.includes('end') ? position.x - (popoverRef.current?.offsetWidth || 0) :
              placement === 'top' || placement === 'bottom' ? position.x - ((popoverRef.current?.offsetWidth || 0) / 2) :
              placement === 'right' ? position.x :
              position.x,
        top: placement.startsWith('top') ? position.y - (popoverRef.current?.offsetHeight || 0) :
             placement === 'left' || placement === 'right' ? position.y - ((popoverRef.current?.offsetHeight || 0) / 2) :
             position.y,
      }}
    >
      {content}
    </div>
  );

  return (
    <>
      <div ref={triggerRef} onClick={togglePopover} className="inline-block">
        {trigger}
      </div>
      {popoverElement && createPortal(popoverElement, document.body)}
    </>
  );
};

export default Dropdown;