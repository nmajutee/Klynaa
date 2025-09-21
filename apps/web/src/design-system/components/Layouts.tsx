import React, { useState, useRef, useEffect } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { Icons } from './Icons';
import { Button } from './Button';

// Resizable Panels Hook
export const useResizablePanels = (
  initialSizes: number[],
  minSizes?: number[],
  maxSizes?: number[]
) => {
  const [sizes, setSizes] = useState(initialSizes);
  const [isResizing, setIsResizing] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const handleMouseDown = (index: number) => {
    setIsResizing(true);
    setActiveIndex(index);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  const handleMouseMove = (e: MouseEvent, containerRef: React.RefObject<HTMLElement>) => {
    if (!isResizing || activeIndex === null || !containerRef.current) return;

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const percentage = ((e.clientX - rect.left) / rect.width) * 100;

    setSizes(prev => {
      const newSizes = [...prev];
      const minSize = minSizes?.[activeIndex] || 10;
      const maxSize = maxSizes?.[activeIndex] || 90;

      newSizes[activeIndex] = Math.max(minSize, Math.min(maxSize, percentage));

      // Adjust the next panel size
      if (activeIndex + 1 < newSizes.length) {
        const remainingSpace = 100 - newSizes[activeIndex];
        const otherPanelsTotal = newSizes
          .slice(0, activeIndex)
          .concat(newSizes.slice(activeIndex + 2))
          .reduce((sum, size) => sum + size, 0);

        newSizes[activeIndex + 1] = Math.max(
          minSizes?.[activeIndex + 1] || 10,
          remainingSpace - otherPanelsTotal
        );
      }

      return newSizes;
    });
  };

  const handleMouseUp = () => {
    setIsResizing(false);
    setActiveIndex(null);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  };

  return {
    sizes,
    setSizes,
    isResizing,
    activeIndex,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  };
};

// Resizable Panels Component
export interface ResizablePanelsProps {
  children: React.ReactElement[];
  direction?: 'horizontal' | 'vertical';
  initialSizes?: number[];
  minSizes?: number[];
  maxSizes?: number[];
  resizerClassName?: string;
  className?: string;
  onResize?: (sizes: number[]) => void;
}

export const ResizablePanels: React.FC<ResizablePanelsProps> = ({
  children,
  direction = 'horizontal',
  initialSizes,
  minSizes,
  maxSizes,
  resizerClassName,
  className,
  onResize,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const defaultSizes = initialSizes || Array(children.length).fill(100 / children.length);

  const {
    sizes,
    setSizes,
    isResizing,
    activeIndex,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  } = useResizablePanels(defaultSizes, minSizes, maxSizes);

  useEffect(() => {
    const mouseMoveHandler = (e: MouseEvent) => {
      if (containerRef.current) {
        handleMouseMove(e, containerRef as React.RefObject<HTMLElement>);
      }
    };
    const mouseUpHandler = () => handleMouseUp();

    if (isResizing) {
      document.addEventListener('mousemove', mouseMoveHandler);
      document.addEventListener('mouseup', mouseUpHandler);
    }

    return () => {
      document.removeEventListener('mousemove', mouseMoveHandler);
      document.removeEventListener('mouseup', mouseUpHandler);
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);

  useEffect(() => {
    onResize?.(sizes);
  }, [sizes, onResize]);

  const isHorizontal = direction === 'horizontal';

  return (
    <div
      ref={containerRef}
      className={cn(
        'flex h-full',
        isHorizontal ? 'flex-row' : 'flex-col',
        className
      )}
    >
      {children.map((child, index) => (
        <React.Fragment key={index}>
          <div
            style={{
              [isHorizontal ? 'width' : 'height']: `${sizes[index]}%`,
            }}
            className="overflow-hidden"
          >
            {child}
          </div>

          {index < children.length - 1 && (
            <div
              className={cn(
                'flex-shrink-0 bg-neutral-200 hover:bg-neutral-300 transition-colors',
                isHorizontal ? 'w-1 cursor-col-resize' : 'h-1 cursor-row-resize',
                activeIndex === index && 'bg-primary-400',
                resizerClassName
              )}
              onMouseDown={() => handleMouseDown(index)}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

// Sidebar Layout Component
export interface SidebarLayoutProps {
  sidebar: React.ReactNode;
  children: React.ReactNode;
  sidebarPosition?: 'left' | 'right';
  sidebarWidth?: number;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  overlay?: boolean; // Mobile overlay mode
  className?: string;
  sidebarClassName?: string;
  contentClassName?: string;
}

export const SidebarLayout: React.FC<SidebarLayoutProps> = ({
  sidebar,
  children,
  sidebarPosition = 'left',
  sidebarWidth = 256,
  collapsible = true,
  defaultCollapsed = false,
  overlay = false,
  className,
  sidebarClassName,
  contentClassName,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const shouldShowOverlay = isMobile && overlay && !isCollapsed;

  return (
    <div className={cn('relative flex h-full', className)}>
      {/* Overlay for mobile */}
      {shouldShowOverlay && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsCollapsed(true)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'flex-shrink-0 bg-white border-r border-neutral-200 transition-all duration-300',
          sidebarPosition === 'right' && 'order-2 border-r-0 border-l',
          isCollapsed && !shouldShowOverlay && (isMobile ? '-translate-x-full' : 'w-0'),
          shouldShowOverlay && 'fixed left-0 top-0 h-full z-50',
          sidebarClassName
        )}
        style={{
          width: isCollapsed && !shouldShowOverlay ? 0 : sidebarWidth,
        }}
      >
        <div className="flex flex-col h-full" style={{ width: sidebarWidth }}>
          {collapsible && (
            <div className="flex justify-end p-2 border-b border-neutral-200">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCollapsed(!isCollapsed)}
              >
                {sidebarPosition === 'left' ? (
                  isCollapsed ? <Icons.ChevronRight /> : <Icons.ChevronLeft />
                ) : (
                  isCollapsed ? <Icons.ChevronLeft /> : <Icons.ChevronRight />
                )}
              </Button>
            </div>
          )}
          <div className="flex-1 overflow-hidden">{sidebar}</div>
        </div>
      </div>

      {/* Main Content */}
      <div className={cn('flex-1 overflow-hidden', contentClassName)}>
        {collapsible && isMobile && (
          <div className="flex items-center p-2 border-b border-neutral-200 md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              <Icons.Menu />
            </Button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
};

// Masonry Layout Component
export interface MasonryProps {
  children: React.ReactElement[];
  columns?: number;
  gap?: number;
  breakpoints?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  className?: string;
}

export const Masonry: React.FC<MasonryProps> = ({
  children,
  columns = 3,
  gap = 16,
  breakpoints,
  className,
}) => {
  const [columnCount, setColumnCount] = useState(columns);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateColumns = () => {
      if (!breakpoints) {
        setColumnCount(columns);
        return;
      }

      const width = window.innerWidth;
      if (width >= 1280 && breakpoints.xl) {
        setColumnCount(breakpoints.xl);
      } else if (width >= 1024 && breakpoints.lg) {
        setColumnCount(breakpoints.lg);
      } else if (width >= 768 && breakpoints.md) {
        setColumnCount(breakpoints.md);
      } else if (width >= 640 && breakpoints.sm) {
        setColumnCount(breakpoints.sm);
      } else {
        setColumnCount(columns);
      }
    };

    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, [columns, breakpoints]);

  // Distribute children across columns
  const columnWrappers = Array(columnCount).fill(null).map(() => [] as React.ReactElement[]);

  children.forEach((child, index) => {
    columnWrappers[index % columnCount].push(child);
  });

  return (
    <div
      ref={containerRef}
      className={cn('flex', className)}
      style={{ gap }}
    >
      {columnWrappers.map((column, columnIndex) => (
        <div
          key={columnIndex}
          className="flex-1"
          style={{ gap }}
        >
          <div className="flex flex-col" style={{ gap }}>
            {column.map((item, itemIndex) => (
              <div key={`${columnIndex}-${itemIndex}`}>
                {item}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// Split View Component
export interface SplitViewProps {
  left: React.ReactNode;
  right: React.ReactNode;
  defaultSplit?: number; // 0-100 percentage
  minLeftWidth?: number;
  minRightWidth?: number;
  className?: string;
  leftClassName?: string;
  rightClassName?: string;
  resizerClassName?: string;
  vertical?: boolean;
}

export const SplitView: React.FC<SplitViewProps> = ({
  left,
  right,
  defaultSplit = 50,
  minLeftWidth = 20,
  minRightWidth = 20,
  className,
  leftClassName,
  rightClassName,
  resizerClassName,
  vertical = false,
}) => {
  const [split, setSplit] = useState(defaultSplit);
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const percentage = vertical
        ? ((e.clientY - rect.top) / rect.height) * 100
        : ((e.clientX - rect.left) / rect.width) * 100;

      const newSplit = Math.max(
        minLeftWidth,
        Math.min(100 - minRightWidth, percentage)
      );

      setSplit(newSplit);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = vertical ? 'row-resize' : 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, minLeftWidth, minRightWidth, vertical]);

  const handleMouseDown = () => {
    setIsResizing(true);
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        'flex h-full',
        vertical ? 'flex-col' : 'flex-row',
        className
      )}
    >
      <div
        className={cn('overflow-hidden', leftClassName)}
        style={{
          [vertical ? 'height' : 'width']: `${split}%`,
        }}
      >
        {left}
      </div>

      <div
        className={cn(
          'flex-shrink-0 bg-neutral-200 hover:bg-neutral-300 transition-colors',
          vertical ? 'h-1 cursor-row-resize' : 'w-1 cursor-col-resize',
          isResizing && 'bg-primary-400',
          resizerClassName
        )}
        onMouseDown={handleMouseDown}
      />

      <div
        className={cn('overflow-hidden', rightClassName)}
        style={{
          [vertical ? 'height' : 'width']: `${100 - split}%`,
        }}
      >
        {right}
      </div>
    </div>
  );
};

// Stack Layout Component (for responsive stacking)
export interface StackProps {
  children: React.ReactNode;
  direction?: 'horizontal' | 'vertical';
  spacing?: number;
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  wrap?: boolean;
  responsive?: {
    sm?: 'horizontal' | 'vertical';
    md?: 'horizontal' | 'vertical';
    lg?: 'horizontal' | 'vertical';
  };
  className?: string;
}

export const Stack: React.FC<StackProps> = ({
  children,
  direction = 'vertical',
  spacing = 4,
  align = 'stretch',
  justify = 'start',
  wrap = false,
  responsive,
  className,
}) => {
  const getFlexDirection = () => {
    let classes = direction === 'horizontal' ? 'flex-row' : 'flex-col';

    if (responsive) {
      if (responsive.sm) {
        classes += ` sm:${responsive.sm === 'horizontal' ? 'flex-row' : 'flex-col'}`;
      }
      if (responsive.md) {
        classes += ` md:${responsive.md === 'horizontal' ? 'flex-row' : 'flex-col'}`;
      }
      if (responsive.lg) {
        classes += ` lg:${responsive.lg === 'horizontal' ? 'flex-row' : 'flex-col'}`;
      }
    }

    return classes;
  };

  const getAlignItems = () => {
    switch (align) {
      case 'start': return 'items-start';
      case 'center': return 'items-center';
      case 'end': return 'items-end';
      case 'stretch': return 'items-stretch';
      default: return 'items-stretch';
    }
  };

  const getJustifyContent = () => {
    switch (justify) {
      case 'start': return 'justify-start';
      case 'center': return 'justify-center';
      case 'end': return 'justify-end';
      case 'between': return 'justify-between';
      case 'around': return 'justify-around';
      case 'evenly': return 'justify-evenly';
      default: return 'justify-start';
    }
  };

  return (
    <div
      className={cn(
        'flex',
        getFlexDirection(),
        getAlignItems(),
        getJustifyContent(),
        wrap && 'flex-wrap',
        className
      )}
      style={{
        gap: `${spacing * 0.25}rem`, // Convert to rem (spacing * 4px / 16)
      }}
    >
      {children}
    </div>
  );
};

export default ResizablePanels;