import React, { useState, useEffect, useRef, useCallback, TouchEvent } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { Icons } from './Icons';

// Touch gesture types
interface TouchGesture {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  deltaX: number;
  deltaY: number;
  distance: number;
  direction: 'left' | 'right' | 'up' | 'down';
  velocity: number;
  duration: number;
}

// Swipeable Component
const swipeableVariants = cva(
  'relative overflow-hidden',
  {
    variants: {
      direction: {
        horizontal: 'touch-pan-y',
        vertical: 'touch-pan-x',
        both: 'touch-none',
      },
    },
    defaultVariants: {
      direction: 'horizontal',
    },
  }
);

export interface SwipeableProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof swipeableVariants> {
  onSwipeLeft?: (gesture: TouchGesture) => void;
  onSwipeRight?: (gesture: TouchGesture) => void;
  onSwipeUp?: (gesture: TouchGesture) => void;
  onSwipeDown?: (gesture: TouchGesture) => void;
  onSwipeStart?: (event: TouchEvent) => void;
  onSwipeEnd?: (gesture: TouchGesture) => void;
  threshold?: number; // minimum distance for swipe
  velocityThreshold?: number; // minimum velocity for swipe
  disabled?: boolean;
}

export const Swipeable: React.FC<SwipeableProps> = ({
  direction,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onSwipeStart,
  onSwipeEnd,
  threshold = 50,
  velocityThreshold = 0.3,
  disabled = false,
  className,
  children,
  ...props
}) => {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number; time: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number; time: number } | null>(null);

  const handleTouchStart = (event: TouchEvent) => {
    if (disabled) return;

    const touch = event.touches[0];
    setTouchStart({
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    });
    setTouchEnd(null);
    onSwipeStart?.(event);
  };

  const handleTouchMove = (event: TouchEvent) => {
    if (disabled) return;

    const touch = event.touches[0];
    setTouchEnd({
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    });
  };

  const handleTouchEnd = () => {
    if (disabled || !touchStart || !touchEnd) return;

    const deltaX = touchEnd.x - touchStart.x;
    const deltaY = touchEnd.y - touchStart.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const duration = touchEnd.time - touchStart.time;
    const velocity = distance / duration;

    // Determine primary direction
    const isHorizontal = Math.abs(deltaX) > Math.abs(deltaY);
    let gestureDirection: 'left' | 'right' | 'up' | 'down';

    if (isHorizontal) {
      gestureDirection = deltaX > 0 ? 'right' : 'left';
    } else {
      gestureDirection = deltaY > 0 ? 'down' : 'up';
    }

    const gesture: TouchGesture = {
      startX: touchStart.x,
      startY: touchStart.y,
      endX: touchEnd.x,
      endY: touchEnd.y,
      deltaX,
      deltaY,
      distance,
      direction: gestureDirection,
      velocity,
      duration,
    };

    // Check if swipe meets threshold requirements
    const meetsDistanceThreshold = distance >= threshold;
    const meetsVelocityThreshold = velocity >= velocityThreshold;

    if (meetsDistanceThreshold && meetsVelocityThreshold) {
      switch (gestureDirection) {
        case 'left':
          onSwipeLeft?.(gesture);
          break;
        case 'right':
          onSwipeRight?.(gesture);
          break;
        case 'up':
          onSwipeUp?.(gesture);
          break;
        case 'down':
          onSwipeDown?.(gesture);
          break;
      }
    }

    onSwipeEnd?.(gesture);
    setTouchStart(null);
    setTouchEnd(null);
  };

  return (
    <div
      className={cn(swipeableVariants({ direction }), className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      {...props}
    >
      {children}
    </div>
  );
};

// Pull to Refresh Component
export interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  pullDistance?: number;
  triggerDistance?: number;
  children: React.ReactNode;
  className?: string;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  onRefresh,
  pullDistance = 80,
  triggerDistance = 60,
  children,
  className,
}) => {
  const [isPulling, setIsPulling] = useState(false);
  const [pullValue, setPullValue] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [touchStart, setTouchStart] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (event: TouchEvent) => {
    const container = containerRef.current;
    if (!container || container.scrollTop > 0) return;

    setTouchStart(event.touches[0].clientY);
  };

  const handleTouchMove = (event: TouchEvent) => {
    const container = containerRef.current;
    if (!container || container.scrollTop > 0 || touchStart === 0) return;

    const currentTouch = event.touches[0].clientY;
    const pullDistance = currentTouch - touchStart;

    if (pullDistance > 0) {
      event.preventDefault();
      setIsPulling(true);

      // Apply resistance curve
      const resistance = Math.min(pullDistance * 0.5, 80);
      setPullValue(resistance);
    }
  };

  const handleTouchEnd = async () => {
    if (!isPulling) return;

    if (pullValue >= triggerDistance && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }

    setIsPulling(false);
    setPullValue(0);
    setTouchStart(0);
  };

  const pullProgress = Math.min(pullValue / triggerDistance, 1);

  return (
    <div
      ref={containerRef}
      className={cn('relative overflow-auto', className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull Indicator */}
      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-center transition-transform duration-200 ease-out z-10"
        style={{
          transform: `translateY(${Math.max(pullValue - 40, -40)}px)`,
        }}
      >
        <div className="flex items-center space-x-2 bg-white rounded-full shadow-lg px-4 py-2">
          {isRefreshing ? (
            <>
              <div className="animate-spin h-4 w-4 text-primary-600">
                <Icons.Settings className="h-full w-full" />
              </div>
              <span className="text-sm text-neutral-600">Refreshing...</span>
            </>
          ) : (
            <>
              <div
                className={cn(
                  'h-4 w-4 transition-transform duration-200',
                  pullProgress >= 1 ? 'text-primary-600' : 'text-neutral-400'
                )}
                style={{
                  transform: `rotate(${pullProgress * 180}deg)`,
                }}
              >
                <Icons.ChevronDown className="h-full w-full" />
              </div>
              <span className="text-sm text-neutral-600">
                {pullProgress >= 1 ? 'Release to refresh' : 'Pull to refresh'}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div
        className="transition-transform duration-200 ease-out"
        style={{
          transform: `translateY(${pullValue}px)`,
        }}
      >
        {children}
      </div>
    </div>
  );
};

// Touch-optimized Button
const touchButtonVariants = cva(
  'inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none active:scale-95 select-none',
  {
    variants: {
      variant: {
        primary: 'bg-primary-600 text-white active:bg-primary-700',
        secondary: 'bg-secondary-600 text-white active:bg-secondary-700',
        outline: 'border-2 border-neutral-300 text-neutral-700 active:bg-neutral-50',
        ghost: 'text-neutral-700 active:bg-neutral-100',
        danger: 'bg-danger-600 text-white active:bg-danger-700',
      },
      size: {
        sm: 'px-3 py-2 text-sm rounded-md min-h-[36px]',
        md: 'px-4 py-2 text-base rounded-md min-h-[44px]',
        lg: 'px-6 py-3 text-lg rounded-lg min-h-[48px]',
        xl: 'px-8 py-4 text-xl rounded-lg min-h-[56px]',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
    },
  }
);

export interface TouchButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof touchButtonVariants> {
  loading?: boolean;
  hapticFeedback?: boolean;
}

export const TouchButton: React.FC<TouchButtonProps> = ({
  variant,
  size,
  fullWidth,
  loading = false,
  hapticFeedback = true,
  className,
  children,
  onClick,
  disabled,
  ...props
}) => {
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) return;

    // Haptic feedback for mobile devices
    if (hapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate(10);
    }

    onClick?.(event);
  };

  return (
    <button
      className={cn(
        touchButtonVariants({ variant, size, fullWidth }),
        (disabled || loading) && 'opacity-50 cursor-not-allowed active:scale-100',
        className
      )}
      onClick={handleClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <div className="animate-spin h-4 w-4 mr-2">
            <Icons.Settings className="h-full w-full" />
          </div>
          Loading...
        </>
      ) : (
        children
      )}
    </button>
  );
};

// Draggable Component
export interface DraggableProps {
  onDragStart?: (event: React.TouchEvent | React.MouseEvent) => void;
  onDrag?: (event: React.TouchEvent | React.MouseEvent, delta: { x: number; y: number }) => void;
  onDragEnd?: (event: React.TouchEvent | React.MouseEvent, delta: { x: number; y: number }) => void;
  axis?: 'x' | 'y' | 'both';
  bounds?: {
    left?: number;
    right?: number;
    top?: number;
    bottom?: number;
  };
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const Draggable: React.FC<DraggableProps> = ({
  onDragStart,
  onDrag,
  onDragEnd,
  axis = 'both',
  bounds,
  disabled = false,
  children,
  className,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const elementRef = useRef<HTMLDivElement>(null);

  const getEventPosition = (event: React.TouchEvent | React.MouseEvent | globalThis.TouchEvent | globalThis.MouseEvent) => {
    if ('touches' in event) {
      return {
        x: event.touches[0].clientX,
        y: event.touches[0].clientY,
      };
    }
    return {
      x: event.clientX,
      y: event.clientY,
    };
  };

  const constrainPosition = (newPosition: { x: number; y: number }) => {
    let { x, y } = newPosition;

    if (bounds) {
      if (bounds.left !== undefined) x = Math.max(x, bounds.left);
      if (bounds.right !== undefined) x = Math.min(x, bounds.right);
      if (bounds.top !== undefined) y = Math.max(y, bounds.top);
      if (bounds.bottom !== undefined) y = Math.min(y, bounds.bottom);
    }

    if (axis === 'x') y = 0;
    if (axis === 'y') x = 0;

    return { x, y };
  };

  const handleStart = (event: React.TouchEvent | React.MouseEvent) => {
    if (disabled) return;

    event.preventDefault();
    const eventPos = getEventPosition(event);
    setDragStart(eventPos);
    setIsDragging(true);
    onDragStart?.(event);
  };

  const handleMove = useCallback((event: globalThis.TouchEvent | globalThis.MouseEvent) => {
    if (!isDragging || disabled) return;

    event.preventDefault();
    const eventPos = getEventPosition(event);
    const delta = {
      x: eventPos.x - dragStart.x,
      y: eventPos.y - dragStart.y,
    };

    const newPosition = constrainPosition(delta);
    setPosition(newPosition);
    // Create a synthetic event for the callback
    const syntheticEvent = event as any;
    onDrag?.(syntheticEvent, newPosition);
  }, [isDragging, dragStart, disabled, onDrag, axis, bounds]);

  const handleEnd = useCallback((event: globalThis.TouchEvent | globalThis.MouseEvent) => {
    if (!isDragging) return;

    setIsDragging(false);
    // Create a synthetic event for the callback
    const syntheticEvent = event as any;
    onDragEnd?.(syntheticEvent, position);
  }, [isDragging, position, onDragEnd]);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (event: globalThis.MouseEvent) => handleMove(event);
    const handleMouseUp = (event: globalThis.MouseEvent) => handleEnd(event);
    const handleTouchMove = (event: globalThis.TouchEvent) => handleMove(event);
    const handleTouchEnd = (event: globalThis.TouchEvent) => handleEnd(event);

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, handleMove, handleEnd]);

  return (
    <div
      ref={elementRef}
      className={cn(
        'touch-none select-none',
        isDragging && 'cursor-grabbing',
        !disabled && !isDragging && 'cursor-grab',
        disabled && 'cursor-not-allowed',
        className
      )}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
      }}
      onMouseDown={handleStart}
      onTouchStart={handleStart}
    >
      {children}
    </div>
  );
};

// Touch-optimized Slider
export interface TouchSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  showValue?: boolean;
  formatValue?: (value: number) => string;
  className?: string;
}

export const TouchSlider: React.FC<TouchSliderProps> = ({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  showValue = true,
  formatValue = (val) => val.toString(),
  className,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  const percentage = ((value - min) / (max - min)) * 100;

  const updateValue = (clientX: number) => {
    if (!sliderRef.current || disabled) return;

    const rect = sliderRef.current.getBoundingClientRect();
    const percentage = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
    const rawValue = min + percentage * (max - min);
    const steppedValue = Math.round(rawValue / step) * step;
    const clampedValue = Math.min(Math.max(steppedValue, min), max);

    onChange(clampedValue);
  };

  const handleStart = (event: React.TouchEvent | React.MouseEvent) => {
    if (disabled) return;

    setIsDragging(true);
    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    updateValue(clientX);
  };

  const handleMove = useCallback((event: globalThis.TouchEvent | globalThis.MouseEvent) => {
    if (!isDragging || disabled) return;

    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    updateValue(clientX);
  }, [isDragging, disabled]);

  const handleEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (event: globalThis.MouseEvent) => handleMove(event);
    const handleMouseUp = () => handleEnd();
    const handleTouchMove = (event: globalThis.TouchEvent) => handleMove(event);
    const handleTouchEnd = () => handleEnd();

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, handleMove, handleEnd]);

  return (
    <div className={cn('space-y-2', className)}>
      {showValue && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-neutral-600">Value</span>
          <span className="font-medium">{formatValue(value)}</span>
        </div>
      )}

      <div
        ref={sliderRef}
        className={cn(
          'relative h-12 touch-none select-none',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        onMouseDown={handleStart}
        onTouchStart={handleStart}
      >
        {/* Track */}
        <div className="absolute top-1/2 left-0 right-0 h-2 bg-neutral-200 rounded-full transform -translate-y-1/2">
          {/* Progress */}
          <div
            className="absolute left-0 top-0 h-full bg-primary-600 rounded-full transition-all duration-150"
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Thumb */}
        <div
          className={cn(
            'absolute top-1/2 w-6 h-6 bg-white border-2 border-primary-600 rounded-full transform -translate-y-1/2 -translate-x-1/2 transition-all duration-150 shadow-md',
            isDragging && 'scale-110 shadow-lg',
            !disabled && 'cursor-grab active:cursor-grabbing'
          )}
          style={{ left: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default Swipeable;