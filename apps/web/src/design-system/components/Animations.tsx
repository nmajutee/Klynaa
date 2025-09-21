import React, { useState, useEffect, useRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

// Animation Types
export type AnimationType =
  | 'fade'
  | 'slide-up'
  | 'slide-down'
  | 'slide-left'
  | 'slide-right'
  | 'scale'
  | 'rotate'
  | 'bounce'
  | 'shake'
  | 'pulse'
  | 'flip';

export type AnimationDuration = 'fast' | 'normal' | 'slow';
export type AnimationEasing = 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear';

// Animation Hook
export const useAnimation = (
  trigger: boolean,
  type: AnimationType = 'fade',
  duration: AnimationDuration = 'normal',
  easing: AnimationEasing = 'ease-out',
  delay = 0
) => {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldMount, setShouldMount] = useState(false);

  const durationMs = {
    fast: 200,
    normal: 300,
    slow: 500,
  }[duration];

  useEffect(() => {
    if (trigger) {
      setShouldMount(true);
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, delay);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => {
        setShouldMount(false);
      }, durationMs);
      return () => clearTimeout(timer);
    }
  }, [trigger, delay, durationMs]);

  const getAnimationClasses = () => {
    const baseClasses = `transition-all duration-${duration} ${easing}`;

    switch (type) {
      case 'fade':
        return cn(
          baseClasses,
          isVisible ? 'opacity-100' : 'opacity-0'
        );

      case 'slide-up':
        return cn(
          baseClasses,
          isVisible
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-4'
        );

      case 'slide-down':
        return cn(
          baseClasses,
          isVisible
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 -translate-y-4'
        );

      case 'slide-left':
        return cn(
          baseClasses,
          isVisible
            ? 'opacity-100 translate-x-0'
            : 'opacity-0 translate-x-4'
        );

      case 'slide-right':
        return cn(
          baseClasses,
          isVisible
            ? 'opacity-100 translate-x-0'
            : 'opacity-0 -translate-x-4'
        );

      case 'scale':
        return cn(
          baseClasses,
          isVisible
            ? 'opacity-100 scale-100'
            : 'opacity-0 scale-95'
        );

      case 'rotate':
        return cn(
          baseClasses,
          isVisible
            ? 'opacity-100 rotate-0'
            : 'opacity-0 -rotate-12'
        );

      case 'bounce':
        return cn(
          baseClasses,
          'transform-gpu',
          isVisible && 'animate-bounce'
        );

      case 'shake':
        return cn(
          baseClasses,
          'transform-gpu',
          isVisible && 'animate-pulse'
        );

      case 'pulse':
        return cn(
          baseClasses,
          isVisible && 'animate-pulse'
        );

      case 'flip':
        return cn(
          baseClasses,
          'transform-gpu preserve-3d',
          isVisible
            ? 'opacity-100 rotateY-0'
            : 'opacity-0 rotateY-180'
        );

      default:
        return baseClasses;
    }
  };

  return {
    isVisible,
    shouldMount,
    animationClasses: getAnimationClasses(),
  };
};

// Animated Container Component
export interface AnimatedContainerProps {
  children: React.ReactNode;
  animation?: AnimationType;
  duration?: AnimationDuration;
  easing?: AnimationEasing;
  delay?: number;
  trigger?: boolean;
  className?: string;
  onAnimationEnd?: () => void;
}

export const AnimatedContainer: React.FC<AnimatedContainerProps> = ({
  children,
  animation = 'fade',
  duration = 'normal',
  easing = 'ease-out',
  delay = 0,
  trigger = true,
  className,
  onAnimationEnd,
}) => {
  const { shouldMount, animationClasses } = useAnimation(trigger, animation, duration, easing, delay);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || !onAnimationEnd) return;

    const handleTransitionEnd = () => {
      onAnimationEnd();
    };

    element.addEventListener('transitionend', handleTransitionEnd);
    return () => element.removeEventListener('transitionend', handleTransitionEnd);
  }, [onAnimationEnd]);

  if (!shouldMount) return null;

  return (
    <div ref={ref} className={cn(animationClasses, className)}>
      {children}
    </div>
  );
};

// Stagger Animation Component
export interface StaggeredAnimationProps {
  children: React.ReactElement[];
  animation?: AnimationType;
  duration?: AnimationDuration;
  staggerDelay?: number;
  initialDelay?: number;
  trigger?: boolean;
  className?: string;
}

export const StaggeredAnimation: React.FC<StaggeredAnimationProps> = ({
  children,
  animation = 'slide-up',
  duration = 'normal',
  staggerDelay = 100,
  initialDelay = 0,
  trigger = true,
  className,
}) => {
  return (
    <div className={className}>
      {children.map((child, index) => (
        <AnimatedContainer
          key={index}
          animation={animation}
          duration={duration}
          delay={initialDelay + index * staggerDelay}
          trigger={trigger}
        >
          {child}
        </AnimatedContainer>
      ))}
    </div>
  );
};

// Intersection Observer Animation Hook
export const useInViewAnimation = (
  threshold = 0.1,
  rootMargin = '0px',
  triggerOnce = true
) => {
  const [inView, setInView] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isIntersecting = entry.isIntersecting;

        if (isIntersecting && (!triggerOnce || !hasTriggered)) {
          setInView(true);
          setHasTriggered(true);
        } else if (!triggerOnce && !isIntersecting) {
          setInView(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [threshold, rootMargin, triggerOnce, hasTriggered]);

  return { ref, inView };
};

// Scroll Animation Component
export interface ScrollAnimationProps {
  children: React.ReactNode;
  animation?: AnimationType;
  duration?: AnimationDuration;
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
  className?: string;
}

export const ScrollAnimation: React.FC<ScrollAnimationProps> = ({
  children,
  animation = 'slide-up',
  duration = 'normal',
  threshold = 0.1,
  rootMargin = '0px',
  triggerOnce = true,
  className,
}) => {
  const { ref, inView } = useInViewAnimation(threshold, rootMargin, triggerOnce);

  return (
    <div ref={ref as any}>
      <AnimatedContainer
        animation={animation}
        duration={duration}
        trigger={inView}
        className={className}
      >
        {children}
      </AnimatedContainer>
    </div>
  );
};

// Page Transition Component
export interface PageTransitionProps {
  children: React.ReactNode;
  type?: 'fade' | 'slide' | 'scale';
  direction?: 'up' | 'down' | 'left' | 'right';
  duration?: AnimationDuration;
  className?: string;
}

export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  type = 'fade',
  direction = 'up',
  duration = 'normal',
  className,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const getAnimationType = (): AnimationType => {
    if (type === 'slide') {
      return `slide-${direction}` as AnimationType;
    }
    return type as AnimationType;
  };

  return (
    <AnimatedContainer
      animation={getAnimationType()}
      duration={duration}
      trigger={isLoaded}
      className={className}
    >
      {children}
    </AnimatedContainer>
  );
};

// Collapsible Component with Animation
export interface CollapsibleProps {
  open: boolean;
  children: React.ReactNode;
  duration?: AnimationDuration;
  className?: string;
  contentClassName?: string;
}

export const Collapsible: React.FC<CollapsibleProps> = ({
  open,
  children,
  duration = 'normal',
  className,
  contentClassName,
}) => {
  const [height, setHeight] = useState<number | 'auto'>('auto');
  const [shouldMount, setShouldMount] = useState(open);
  const contentRef = useRef<HTMLDivElement>(null);

  const durationClass = {
    fast: 'duration-200',
    normal: 'duration-300',
    slow: 'duration-500',
  }[duration];

  useEffect(() => {
    if (open) {
      setShouldMount(true);
    }
  }, [open]);

  useEffect(() => {
    if (!contentRef.current) return;

    if (open) {
      const contentHeight = contentRef.current.scrollHeight;
      setHeight(contentHeight);

      // Set back to auto after animation
      const timer = setTimeout(() => {
        setHeight('auto');
      }, { fast: 200, normal: 300, slow: 500 }[duration]);

      return () => clearTimeout(timer);
    } else {
      const contentHeight = contentRef.current.scrollHeight;
      setHeight(contentHeight);

      // Trigger collapse
      requestAnimationFrame(() => {
        setHeight(0);
      });

      // Unmount after animation
      const timer = setTimeout(() => {
        setShouldMount(false);
      }, { fast: 200, normal: 300, slow: 500 }[duration]);

      return () => clearTimeout(timer);
    }
  }, [open, duration]);

  if (!shouldMount) return null;

  return (
    <div
      className={cn('overflow-hidden transition-all', durationClass, className)}
      style={{ height: height === 'auto' ? undefined : height }}
    >
      <div ref={contentRef} className={contentClassName}>
        {children}
      </div>
    </div>
  );
};

// Parallax Component
export interface ParallaxProps {
  children: React.ReactNode;
  speed?: number; // -1 to 1, negative for reverse direction
  className?: string;
}

export const Parallax: React.FC<ParallaxProps> = ({
  children,
  speed = 0.5,
  className,
}) => {
  const [offset, setOffset] = useState(0);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!elementRef.current) return;

      const rect = elementRef.current.getBoundingClientRect();
      const scrolled = window.pageYOffset;
      const rate = scrolled * speed;

      setOffset(rate);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial call

    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed]);

  return (
    <div
      ref={elementRef}
      className={cn('transform-gpu', className)}
      style={{
        transform: `translate3d(0, ${offset}px, 0)`,
      }}
    >
      {children}
    </div>
  );
};

// Morphing Number Component
export interface MorphingNumberProps {
  value: number;
  duration?: number;
  decimals?: number;
  separator?: string;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export const MorphingNumber: React.FC<MorphingNumberProps> = ({
  value,
  duration = 1000,
  decimals = 0,
  separator = ',',
  prefix = '',
  suffix = '',
  className,
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const animationRef = useRef<number | undefined>(undefined);
  const startTimeRef = useRef<number | undefined>(undefined);
  const startValueRef = useRef<number>(0);

  useEffect(() => {
    if (value === displayValue) return;

    setIsAnimating(true);
    startValueRef.current = displayValue;

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);

      const currentValue = startValueRef.current + (value - startValueRef.current) * easeOut;
      setDisplayValue(currentValue);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
        setDisplayValue(value);
        startTimeRef.current = undefined;
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [value, duration, displayValue]);

  const formatNumber = (num: number) => {
    const fixed = num.toFixed(decimals);
    const parts = fixed.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, separator);
    return parts.join('.');
  };

  return (
    <span className={cn(isAnimating && 'tabular-nums', className)}>
      {prefix}{formatNumber(displayValue)}{suffix}
    </span>
  );
};

// Typewriter Effect Component
export interface TypewriterProps {
  words: string[];
  typeSpeed?: number;
  deleteSpeed?: number;
  delayBetweenWords?: number;
  loop?: boolean;
  className?: string;
  cursorClassName?: string;
}

export const Typewriter: React.FC<TypewriterProps> = ({
  words,
  typeSpeed = 100,
  deleteSpeed = 50,
  delayBetweenWords = 2000,
  loop = true,
  className,
  cursorClassName,
}) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    const currentWord = words[currentWordIndex];

    const timeout = setTimeout(() => {
      if (isDeleting) {
        setCurrentText(currentWord.substring(0, currentText.length - 1));

        if (currentText === '') {
          setIsDeleting(false);
          setCurrentWordIndex((prev) => {
            if (loop) {
              return (prev + 1) % words.length;
            } else {
              return Math.min(prev + 1, words.length - 1);
            }
          });
        }
      } else {
        setCurrentText(currentWord.substring(0, currentText.length + 1));

        if (currentText === currentWord) {
          if (loop || currentWordIndex < words.length - 1) {
            setTimeout(() => setIsDeleting(true), delayBetweenWords);
          }
        }
      }
    }, isDeleting ? deleteSpeed : typeSpeed);

    return () => clearTimeout(timeout);
  }, [currentText, currentWordIndex, isDeleting, words, typeSpeed, deleteSpeed, delayBetweenWords, loop]);

  // Cursor blink effect
  useEffect(() => {
    const interval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 530);

    return () => clearInterval(interval);
  }, []);

  return (
    <span className={className}>
      {currentText}
      <span
        className={cn(
          'inline-block w-0.5 h-[1em] bg-current ml-1',
          !showCursor && 'opacity-0',
          'transition-opacity duration-100',
          cursorClassName
        )}
      />
    </span>
  );
};

export default AnimatedContainer;