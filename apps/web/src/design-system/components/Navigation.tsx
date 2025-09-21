import React, { useState } from 'react';
import { cn } from '../../lib/utils';
import { Button } from './Button';

// Navigation Item Interface
export interface NavItem {
  label: string;
  href?: string;
  onClick?: () => void;
  active?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  badge?: string | number;
  children?: NavItem[];
}

// Header Component
export interface HeaderProps {
  logo?: React.ReactNode;
  navigation?: NavItem[];
  actions?: React.ReactNode;
  className?: string;
  sticky?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  logo,
  navigation = [],
  actions,
  className,
  sticky = true,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header
      className={cn(
        'bg-white border-b border-neutral-200 shadow-sm z-50',
        sticky && 'sticky top-0',
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            {logo}
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item, index) => (
              <NavLink key={index} {...item} />
            ))}
          </nav>

          {/* Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {actions}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-neutral-200">
            <nav className="flex flex-col space-y-2">
              {navigation.map((item, index) => (
                <MobileNavLink key={index} {...item} />
              ))}
            </nav>
            {actions && (
              <div className="mt-4 pt-4 border-t border-neutral-200">
                {actions}
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

// Navigation Link Component
export interface NavLinkProps extends NavItem {
  className?: string;
}

export const NavLink: React.FC<NavLinkProps> = ({
  label,
  href,
  onClick,
  active = false,
  disabled = false,
  icon,
  badge,
  className,
}) => {
  const Component = href ? 'a' : 'button';

  return (
    <Component
      href={href}
      onClick={onClick}
      className={cn(
        'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
        active
          ? 'text-primary-600 bg-primary-50'
          : 'text-neutral-700 hover:text-primary-600 hover:bg-neutral-50',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      disabled={disabled}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {label}
      {badge && (
        <span className="ml-2 px-2 py-1 text-xs bg-primary-100 text-primary-700 rounded-full">
          {badge}
        </span>
      )}
    </Component>
  );
};

// Mobile Navigation Link Component
export const MobileNavLink: React.FC<NavLinkProps> = ({
  label,
  href,
  onClick,
  active = false,
  disabled = false,
  icon,
  badge,
  className,
}) => {
  const Component = href ? 'a' : 'button';

  return (
    <Component
      href={href}
      onClick={onClick}
      className={cn(
        'flex items-center justify-between px-3 py-2 text-base font-medium rounded-md transition-colors',
        active
          ? 'text-primary-600 bg-primary-50'
          : 'text-neutral-900 hover:text-primary-600 hover:bg-neutral-50',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      disabled={disabled}
    >
      <div className="flex items-center">
        {icon && <span className="mr-3">{icon}</span>}
        {label}
      </div>
      {badge && (
        <span className="px-2 py-1 text-xs bg-primary-100 text-primary-700 rounded-full">
          {badge}
        </span>
      )}
    </Component>
  );
};

// Sidebar Component
export interface SidebarProps {
  items: NavItem[];
  className?: string;
  collapsed?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  items,
  className,
  collapsed = false,
}) => {
  return (
    <aside
      className={cn(
        'bg-white border-r border-neutral-200 transition-all duration-300',
        collapsed ? 'w-16' : 'w-64',
        className
      )}
    >
      <nav className="p-4 space-y-2">
        {items.map((item, index) => (
          <SidebarItem key={index} {...item} collapsed={collapsed} />
        ))}
      </nav>
    </aside>
  );
};

// Sidebar Item Component
export interface SidebarItemProps extends NavItem {
  collapsed?: boolean;
  depth?: number;
}

export const SidebarItem: React.FC<SidebarItemProps> = ({
  label,
  href,
  onClick,
  active = false,
  disabled = false,
  icon,
  badge,
  children = [],
  collapsed = false,
  depth = 0,
}) => {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = children.length > 0;
  const Component = href ? 'a' : 'button';

  const handleClick = () => {
    if (hasChildren) {
      setExpanded(!expanded);
    }
    onClick?.();
  };

  return (
    <div>
      <Component
        href={!hasChildren ? href : undefined}
        onClick={handleClick}
        className={cn(
          'w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors',
          active
            ? 'text-primary-600 bg-primary-50'
            : 'text-neutral-700 hover:text-primary-600 hover:bg-neutral-50',
          disabled && 'opacity-50 cursor-not-allowed',
          depth > 0 && 'ml-4',
          collapsed && 'justify-center'
        )}
        disabled={disabled}
        title={collapsed ? label : undefined}
      >
        <div className="flex items-center min-w-0">
          {icon && <span className={cn('flex-shrink-0', !collapsed && 'mr-3')}>{icon}</span>}
          {!collapsed && (
            <span className="truncate">{label}</span>
          )}
        </div>

        {!collapsed && (
          <div className="flex items-center">
            {badge && (
              <span className="px-2 py-1 text-xs bg-primary-100 text-primary-700 rounded-full mr-2">
                {badge}
              </span>
            )}
            {hasChildren && (
              <svg
                className={cn(
                  'h-4 w-4 transition-transform',
                  expanded && 'rotate-90'
                )}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
          </div>
        )}
      </Component>

      {/* Child Items */}
      {!collapsed && hasChildren && expanded && (
        <div className="mt-2 space-y-1">
          {children.map((child, index) => (
            <SidebarItem
              key={index}
              {...child}
              depth={depth + 1}
              collapsed={collapsed}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Breadcrumb Component
export interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
  active?: boolean;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
  className?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  separator = '/',
  className,
}) => {
  return (
    <nav className={cn('flex items-center space-x-2 text-sm', className)}>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <span className="text-neutral-400">{separator}</span>
          )}
          {item.active ? (
            <span className="text-neutral-900 font-medium">{item.label}</span>
          ) : (
            <a
              href={item.href}
              onClick={item.onClick}
              className="text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              {item.label}
            </a>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

// Tabs Component
export interface Tab {
  id: string;
  label: string;
  content?: React.ReactNode;
  disabled?: boolean;
  badge?: string | number;
}

export interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
  variant?: 'default' | 'pills' | 'underline';
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  className,
  variant = 'default',
}) => {
  const variants = {
    default: {
      container: 'border-b border-neutral-200',
      tab: 'px-4 py-2 -mb-px border-b-2 font-medium text-sm transition-colors',
      active: 'border-primary-600 text-primary-600',
      inactive: 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300',
    },
    pills: {
      container: 'bg-neutral-100 rounded-lg p-1',
      tab: 'px-4 py-2 rounded-md font-medium text-sm transition-colors',
      active: 'bg-white shadow-sm text-neutral-900',
      inactive: 'text-neutral-600 hover:text-neutral-900',
    },
    underline: {
      container: '',
      tab: 'px-4 py-2 font-medium text-sm transition-colors relative',
      active: 'text-primary-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary-600',
      inactive: 'text-neutral-500 hover:text-neutral-700',
    },
  };

  const variantStyles = variants[variant];

  return (
    <div className={className}>
      <div className={cn('flex', variantStyles.container)}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => !tab.disabled && onChange(tab.id)}
            className={cn(
              variantStyles.tab,
              activeTab === tab.id ? variantStyles.active : variantStyles.inactive,
              tab.disabled && 'opacity-50 cursor-not-allowed'
            )}
            disabled={tab.disabled}
          >
            <span className="flex items-center">
              {tab.label}
              {tab.badge && (
                <span className="ml-2 px-2 py-1 text-xs bg-neutral-200 text-neutral-700 rounded-full">
                  {tab.badge}
                </span>
              )}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Header;