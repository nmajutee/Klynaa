import React, { useState, useRef, useEffect } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { Icons } from './Icons';
import { Button } from './Button';
import { Text } from './Typography';

// Date Range Picker
export interface DateRange {
  from: Date | null;
  to: Date | null;
}

export interface DateRangePickerProps {
  value?: DateRange;
  onChange?: (range: DateRange) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  className?: string;
  minDate?: Date;
  maxDate?: Date;
  format?: string;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  value = { from: null, to: null },
  onChange,
  placeholder = 'Select date range',
  disabled = false,
  error,
  className,
  minDate,
  maxDate,
  format = 'MMM dd, yyyy',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectingRange, setSelectingRange] = useState<'from' | 'to' | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    });
  };

  const getDisplayText = (): string => {
    if (value.from && value.to) {
      return `${formatDate(value.from)} - ${formatDate(value.to)}`;
    } else if (value.from) {
      return `${formatDate(value.from)} - Select end date`;
    } else {
      return placeholder;
    }
  };

  const getDaysInMonth = (date: Date): Date[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: Date[] = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(new Date(year, month, -startingDayOfWeek + i + 1));
    }

    // Add days of the current month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    // Add days from next month to fill the grid
    const remainingCells = 42 - days.length; // 6 rows × 7 days
    for (let day = 1; day <= remainingCells; day++) {
      days.push(new Date(year, month + 1, day));
    }

    return days;
  };

  const isDateDisabled = (date: Date): boolean => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };

  const isDateInRange = (date: Date): boolean => {
    if (!value.from || !value.to) return false;
    return date >= value.from && date <= value.to;
  };

  const isDateRangeStart = (date: Date): boolean => {
    return value.from ? date.getTime() === value.from.getTime() : false;
  };

  const isDateRangeEnd = (date: Date): boolean => {
    return value.to ? date.getTime() === value.to.getTime() : false;
  };

  const handleDateClick = (date: Date) => {
    if (isDateDisabled(date)) return;

    if (!value.from || (value.from && value.to)) {
      // Start new selection
      onChange?.({ from: date, to: null });
      setSelectingRange('to');
    } else if (value.from && !value.to) {
      // Complete the range
      if (date < value.from) {
        onChange?.({ from: date, to: value.from });
      } else {
        onChange?.({ from: value.from, to: date });
      }
      setSelectingRange(null);
      setIsOpen(false);
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      return newDate;
    });
  };

  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const days = getDaysInMonth(currentMonth);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSelectingRange(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          'w-full px-3 py-2 text-left bg-white border rounded-md shadow-sm',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
          error && 'border-danger-500 focus:ring-danger-500 focus:border-danger-500',
          disabled && 'bg-neutral-50 text-neutral-500 cursor-not-allowed',
          !error && !disabled && 'border-neutral-300 hover:border-neutral-400'
        )}
      >
        <div className="flex items-center justify-between">
          <span className={cn(
            !value.from && 'text-neutral-500'
          )}>
            {getDisplayText()}
          </span>
          <Icons.Calendar className="h-4 w-4 text-neutral-400" />
        </div>
      </button>

      {error && (
        <Text variant="caption" color="danger" className="mt-1">
          {error}
        </Text>
      )}

      {isOpen && (
        <div className="absolute z-50 mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateMonth('prev')}
            >
              <Icons.ChevronLeft className="h-4 w-4" />
            </Button>

            <Text variant="body" className="font-semibold">
              {currentMonth.toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric'
              })}
            </Text>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateMonth('next')}
            >
              <Icons.ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map(day => (
              <div key={day} className="text-center p-2">
                <Text variant="caption" color="muted" className="font-medium">
                  {day}
                </Text>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) => {
              const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
              const isToday = day.toDateString() === new Date().toDateString();
              const isDisabled = isDateDisabled(day);
              const inRange = isDateInRange(day);
              const isRangeStart = isDateRangeStart(day);
              const isRangeEnd = isDateRangeEnd(day);

              return (
                <button
                  key={index}
                  onClick={() => handleDateClick(day)}
                  disabled={isDisabled}
                  className={cn(
                    'p-2 text-sm rounded-md transition-colors',
                    'hover:bg-primary-50',
                    !isCurrentMonth && 'text-neutral-400',
                    isCurrentMonth && 'text-neutral-900',
                    isToday && 'bg-primary-100 text-primary-900',
                    inRange && !isRangeStart && !isRangeEnd && 'bg-primary-100',
                    (isRangeStart || isRangeEnd) && 'bg-primary-500 text-white',
                    isDisabled && 'text-neutral-300 cursor-not-allowed hover:bg-transparent'
                  )}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>

          {selectingRange && (
            <div className="mt-4 p-2 bg-primary-50 rounded-md">
              <Text variant="caption" color="primary" className="text-center">
                {selectingRange === 'to' ? 'Select end date' : 'Select start date'}
              </Text>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Time Picker Component
export interface TimePickerProps {
  value?: { hours: number; minutes: number };
  onChange?: (time: { hours: number; minutes: number }) => void;
  format?: '12h' | '24h';
  step?: number; // minutes
  disabled?: boolean;
  error?: string;
  placeholder?: string;
  className?: string;
}

export const TimePicker: React.FC<TimePickerProps> = ({
  value = { hours: 0, minutes: 0 },
  onChange,
  format = '12h',
  step = 15,
  disabled = false,
  error,
  placeholder = 'Select time',
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const formatTime = (hours: number, minutes: number): string => {
    if (format === '12h') {
      const period = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
      return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
    } else {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
  };

  const getDisplayText = (): string => {
    if (value.hours === 0 && value.minutes === 0 && placeholder) {
      return placeholder;
    }
    return formatTime(value.hours, value.minutes);
  };

  const generateTimeOptions = (): Array<{ hours: number; minutes: number }> => {
    const options: Array<{ hours: number; minutes: number }> = [];

    for (let hours = 0; hours < 24; hours++) {
      for (let minutes = 0; minutes < 60; minutes += step) {
        options.push({ hours, minutes });
      }
    }

    return options;
  };

  const handleTimeSelect = (hours: number, minutes: number) => {
    onChange?.({ hours, minutes });
    setIsOpen(false);
  };

  const timeOptions = generateTimeOptions();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          'w-full px-3 py-2 text-left bg-white border rounded-md shadow-sm',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
          error && 'border-danger-500 focus:ring-danger-500 focus:border-danger-500',
          disabled && 'bg-neutral-50 text-neutral-500 cursor-not-allowed',
          !error && !disabled && 'border-neutral-300 hover:border-neutral-400'
        )}
      >
        <div className="flex items-center justify-between">
          <span className={cn(
            value.hours === 0 && value.minutes === 0 && placeholder && 'text-neutral-500'
          )}>
            {getDisplayText()}
          </span>
          <Icons.Clock className="h-4 w-4 text-neutral-400" />
        </div>
      </button>

      {error && (
        <Text variant="caption" color="danger" className="mt-1">
          {error}
        </Text>
      )}

      {isOpen && (
        <div className="absolute z-50 mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {timeOptions.map((option, index) => (
            <button
              key={index}
              onClick={() => handleTimeSelect(option.hours, option.minutes)}
              className={cn(
                'w-full px-4 py-2 text-left text-sm hover:bg-primary-50 focus:bg-primary-50',
                'focus:outline-none',
                value.hours === option.hours && value.minutes === option.minutes &&
                'bg-primary-500 text-white hover:bg-primary-600'
              )}
            >
              {formatTime(option.hours, option.minutes)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Color Picker Component
export interface ColorPickerProps {
  value?: string;
  onChange?: (color: string) => void;
  colors?: string[];
  disabled?: boolean;
  error?: string;
  placeholder?: string;
  allowCustom?: boolean;
  className?: string;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  value = '',
  onChange,
  colors = [
    '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
    '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
    '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
    '#ec4899', '#f43f5e'
  ],
  disabled = false,
  error,
  placeholder = 'Select color',
  allowCustom = true,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [customColor, setCustomColor] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const handleColorSelect = (color: string) => {
    onChange?.(color);
    setIsOpen(false);
  };

  const handleCustomColorSubmit = () => {
    if (customColor && /^#[0-9A-F]{6}$/i.test(customColor)) {
      onChange?.(customColor);
      setIsOpen(false);
      setCustomColor('');
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          'w-full px-3 py-2 text-left bg-white border rounded-md shadow-sm',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
          error && 'border-danger-500 focus:ring-danger-500 focus:border-danger-500',
          disabled && 'bg-neutral-50 text-neutral-500 cursor-not-allowed',
          !error && !disabled && 'border-neutral-300 hover:border-neutral-400'
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {value && (
              <div
                className="w-4 h-4 rounded border border-neutral-300"
                style={{ backgroundColor: value }}
              />
            )}
            <span className={cn(!value && 'text-neutral-500')}>
              {value || placeholder}
            </span>
          </div>
          <Icons.ChevronDown className="h-4 w-4 text-neutral-400" />
        </div>
      </button>

      {error && (
        <Text variant="caption" color="danger" className="mt-1">
          {error}
        </Text>
      )}

      {isOpen && (
        <div className="absolute z-50 mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg p-4">
          <div className="grid grid-cols-6 gap-2 mb-4">
            {colors.map((color, index) => (
              <button
                key={index}
                onClick={() => handleColorSelect(color)}
                className={cn(
                  'w-8 h-8 rounded border-2 transition-all',
                  'hover:scale-110 focus:outline-none focus:scale-110',
                  value === color ? 'border-neutral-900' : 'border-neutral-200'
                )}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>

          {allowCustom && (
            <div>
              <Text variant="caption" color="muted" className="mb-2">
                Custom Color
              </Text>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={customColor}
                  onChange={(e) => setCustomColor(e.target.value)}
                  placeholder="#000000"
                  className="flex-1 px-2 py-1 text-sm border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
                <Button
                  size="sm"
                  onClick={handleCustomColorSubmit}
                  disabled={!customColor || !/^#[0-9A-F]{6}$/i.test(customColor)}
                >
                  Add
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;