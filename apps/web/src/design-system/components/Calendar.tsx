import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { Icons } from './Icons';

// Types
export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type?: 'pickup' | 'maintenance' | 'meeting' | 'other';
  status?: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  description?: string;
  location?: string;
  attendees?: string[];
  color?: string;
}

export interface TimeSlot {
  start: Date;
  end: Date;
  available: boolean;
  event?: CalendarEvent;
}

// Calendar Component
const calendarVariants = cva(
  'bg-white border border-neutral-200 rounded-lg overflow-hidden',
  {
    variants: {
      size: {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

export interface CalendarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof calendarVariants> {
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
  events?: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  view?: 'month' | 'week' | 'day';
  onViewChange?: (view: 'month' | 'week' | 'day') => void;
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: Date[];
  showWeekends?: boolean;
  firstDayOfWeek?: 0 | 1; // 0 = Sunday, 1 = Monday
}

export const Calendar: React.FC<CalendarProps> = ({
  size,
  selectedDate = new Date(),
  onDateSelect,
  events = [],
  onEventClick,
  view = 'month',
  onViewChange,
  minDate,
  maxDate,
  disabledDates = [],
  showWeekends = true,
  firstDayOfWeek = 1,
  className,
  ...props
}) => {
  const [currentDate, setCurrentDate] = useState(selectedDate);
  const [currentView, setCurrentView] = useState(view);

  const today = new Date();

  // Helper functions
  const isSameDay = (date1: Date, date2: Date) => {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  };

  const isDateDisabled = (date: Date) => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return disabledDates.some(disabledDate => isSameDay(date, disabledDate));
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.start);
      return isSameDay(eventDate, date);
    });
  };

  // Generate calendar days
  const generateCalendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Calculate start date (considering first day of week)
    const startDate = new Date(firstDay);
    const dayOfWeek = (firstDay.getDay() + (7 - firstDayOfWeek)) % 7;
    startDate.setDate(startDate.getDate() - dayOfWeek);

    // Generate 42 days (6 weeks)
    const days = [];
    const current = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return days;
  }, [currentDate, firstDayOfWeek]);

  const weekDays = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return firstDayOfWeek === 1
      ? [...days.slice(1), days[0]]
      : days;
  }, [firstDayOfWeek]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate);
  };

  const handleDateClick = (date: Date) => {
    if (!isDateDisabled(date)) {
      onDateSelect?.(date);
    }
  };

  const handleViewChange = (newView: 'month' | 'week' | 'day') => {
    setCurrentView(newView);
    onViewChange?.(newView);
  };

  const getEventTypeColor = (type?: string) => {
    switch (type) {
      case 'pickup':
        return 'bg-primary-500';
      case 'maintenance':
        return 'bg-warning-500';
      case 'meeting':
        return 'bg-secondary-500';
      default:
        return 'bg-neutral-500';
    }
  };

  return (
    <div className={cn(calendarVariants({ size }), className)} {...props}>
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-4 border-b border-neutral-200">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-semibold text-neutral-900">
            {currentDate.toLocaleDateString('en-US', {
              month: 'long',
              year: 'numeric'
            })}
          </h2>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-1 rounded hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <Icons.ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => navigateMonth('next')}
              className="p-1 rounded hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <Icons.ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex items-center bg-neutral-100 rounded-md p-1">
          {(['month', 'week', 'day'] as const).map((viewOption) => (
            <button
              key={viewOption}
              onClick={() => handleViewChange(viewOption)}
              className={cn(
                'px-3 py-1 text-sm font-medium rounded transition-colors',
                currentView === viewOption
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-neutral-600 hover:text-neutral-900'
              )}
            >
              {viewOption.charAt(0).toUpperCase() + viewOption.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar Grid */}
      {currentView === 'month' && (
        <>
          {/* Week Header */}
          <div className="grid grid-cols-7 border-b border-neutral-200 bg-neutral-50">
            {weekDays.map((day, index) => (
              <div
                key={day}
                className={cn(
                  'p-2 text-center text-xs font-medium text-neutral-500',
                  !showWeekends && (index === 0 || index === 6) && 'hidden'
                )}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className={cn(
            'grid grid-cols-7',
            !showWeekends && 'grid-cols-5'
          )}>
            {generateCalendarDays.map((date, index) => {
              const isCurrentMonth = date.getMonth() === currentDate.getMonth();
              const isToday = isSameDay(date, today);
              const isSelected = isSameDay(date, selectedDate);
              const isDisabled = isDateDisabled(date);
              const dayEvents = getEventsForDate(date);
              const isWeekend = date.getDay() === 0 || date.getDay() === 6;

              if (!showWeekends && isWeekend) return null;

              return (
                <div
                  key={index}
                  className={cn(
                    'min-h-[80px] p-2 border-r border-b border-neutral-100 cursor-pointer hover:bg-neutral-50 transition-colors',
                    !isCurrentMonth && 'text-neutral-400 bg-neutral-50/50',
                    isToday && 'bg-primary-50',
                    isSelected && 'bg-primary-100',
                    isDisabled && 'cursor-not-allowed opacity-50'
                  )}
                  onClick={() => handleDateClick(date)}
                >
                  <div className={cn(
                    'text-sm font-medium mb-1',
                    isToday && 'text-primary-600',
                    isSelected && 'text-primary-700'
                  )}>
                    {date.getDate()}
                  </div>

                  {/* Events */}
                  <div className="space-y-1">
                    {dayEvents.slice(0, 3).map((event) => (
                      <div
                        key={event.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventClick?.(event);
                        }}
                        className={cn(
                          'text-xs p-1 rounded text-white truncate cursor-pointer hover:opacity-80',
                          getEventTypeColor(event.type)
                        )}
                      >
                        {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-xs text-neutral-500 font-medium">
                        +{dayEvents.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Week/Day views can be added here */}
      {currentView === 'week' && (
        <div className="p-4 text-center text-neutral-500">
          Week view - Implementation pending
        </div>
      )}

      {currentView === 'day' && (
        <div className="p-4 text-center text-neutral-500">
          Day view - Implementation pending
        </div>
      )}
    </div>
  );
};

// Date Picker Component
export interface DatePickerProps {
  value?: Date;
  onChange?: (date: Date) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  placeholder = "Select date...",
  disabled = false,
  required = false,
  error,
  minDate,
  maxDate,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(value);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    onChange?.(date);
    setIsOpen(false);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          'w-full px-3 py-2 text-left border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
          error
            ? 'border-danger-300 focus:border-danger-500 focus:ring-danger-500'
            : 'border-neutral-300',
          disabled && 'bg-neutral-50 cursor-not-allowed',
          'flex items-center justify-between'
        )}
      >
        <span className={cn(
          selectedDate ? 'text-neutral-900' : 'text-neutral-500'
        )}>
          {selectedDate ? formatDate(selectedDate) : placeholder}
        </span>
        <Icons.Calendar className="h-4 w-4 text-neutral-400" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-20 mt-1 bg-white border border-neutral-300 rounded-md shadow-lg">
            <Calendar
              selectedDate={selectedDate}
              onDateSelect={handleDateSelect}
              minDate={minDate}
              maxDate={maxDate}
              size="sm"
            />
          </div>
        </>
      )}

      {error && (
        <p className="mt-1 text-sm text-danger-600">{error}</p>
      )}
    </div>
  );
};

// Time Picker Component
export interface TimePickerProps {
  value?: string; // HH:MM format
  onChange?: (time: string) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  format?: '12' | '24';
  step?: number; // minutes
  className?: string;
}

export const TimePicker: React.FC<TimePickerProps> = ({
  value,
  onChange,
  placeholder = "Select time...",
  disabled = false,
  required = false,
  error,
  format = '24',
  step = 15,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const generateTimeSlots = useMemo(() => {
    const slots = [];
    const totalMinutes = 24 * 60;

    for (let minutes = 0; minutes < totalMinutes; minutes += step) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;

      let displayHours = hours;
      let suffix = '';

      if (format === '12') {
        suffix = hours >= 12 ? ' PM' : ' AM';
        displayHours = hours % 12 || 12;
      }

      const timeString = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
      const displayString = `${displayHours}:${mins.toString().padStart(2, '0')}${suffix}`;

      slots.push({
        value: timeString,
        display: displayString,
      });
    }

    return slots;
  }, [format, step]);

  const selectedTime = generateTimeSlots.find(slot => slot.value === value);

  const handleTimeSelect = (time: string) => {
    onChange?.(time);
    setIsOpen(false);
  };

  return (
    <div className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          'w-full px-3 py-2 text-left border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
          error
            ? 'border-danger-300 focus:border-danger-500 focus:ring-danger-500'
            : 'border-neutral-300',
          disabled && 'bg-neutral-50 cursor-not-allowed',
          'flex items-center justify-between'
        )}
      >
        <span className={cn(
          selectedTime ? 'text-neutral-900' : 'text-neutral-500'
        )}>
          {selectedTime ? selectedTime.display : placeholder}
        </span>
        <Icons.Clock className="h-4 w-4 text-neutral-400" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-20 w-full mt-1 bg-white border border-neutral-300 rounded-md shadow-lg max-h-60 overflow-auto">
            {generateTimeSlots.map((slot) => (
              <button
                key={slot.value}
                onClick={() => handleTimeSelect(slot.value)}
                className={cn(
                  'w-full px-3 py-2 text-left hover:bg-neutral-50 focus:bg-neutral-50 focus:outline-none first:rounded-t-md last:rounded-b-md',
                  slot.value === value && 'bg-primary-50 text-primary-600'
                )}
              >
                {slot.display}
              </button>
            ))}
          </div>
        </>
      )}

      {error && (
        <p className="mt-1 text-sm text-danger-600">{error}</p>
      )}
    </div>
  );
};

// Appointment Scheduler Component
export interface AppointmentSchedulerProps {
  availableSlots?: TimeSlot[];
  selectedSlot?: TimeSlot;
  onSlotSelect?: (slot: TimeSlot) => void;
  date: Date;
  onDateChange?: (date: Date) => void;
  duration?: number; // minutes
  className?: string;
}

export const AppointmentScheduler: React.FC<AppointmentSchedulerProps> = ({
  availableSlots = [],
  selectedSlot,
  onSlotSelect,
  date,
  onDateChange,
  duration = 60,
  className,
}) => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const isSlotSelected = (slot: TimeSlot) => {
    return selectedSlot &&
           slot.start.getTime() === selectedSlot.start.getTime() &&
           slot.end.getTime() === selectedSlot.end.getTime();
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Date Selection */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          Select Date
        </label>
        <DatePicker
          value={date}
          onChange={onDateChange}
          minDate={new Date()}
        />
      </div>

      {/* Time Slots */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          Available Time Slots
        </label>

        {availableSlots.length === 0 ? (
          <div className="text-center py-8 text-neutral-500">
            <Icons.Clock className="h-8 w-8 mx-auto mb-2" />
            <p>No available slots for this date</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {availableSlots.map((slot, index) => (
              <button
                key={index}
                onClick={() => slot.available && onSlotSelect?.(slot)}
                disabled={!slot.available}
                className={cn(
                  'p-3 text-sm font-medium rounded-md border transition-colors',
                  slot.available
                    ? isSlotSelected(slot)
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white text-neutral-900 border-neutral-300 hover:bg-primary-50 hover:border-primary-300'
                    : 'bg-neutral-100 text-neutral-400 border-neutral-200 cursor-not-allowed'
                )}
              >
                <div className="text-center">
                  <div>{formatTime(slot.start)}</div>
                  <div className="text-xs opacity-75">
                    {duration} min
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Selected Slot Summary */}
      {selectedSlot && (
        <div className="p-4 bg-primary-50 border border-primary-200 rounded-md">
          <h3 className="text-sm font-medium text-primary-900 mb-2">
            Selected Appointment
          </h3>
          <div className="space-y-1 text-sm text-primary-800">
            <div className="flex items-center space-x-2">
              <Icons.Calendar className="h-4 w-4" />
              <span>{date.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Icons.Clock className="h-4 w-4" />
              <span>
                {formatTime(selectedSlot.start)} - {formatTime(selectedSlot.end)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;