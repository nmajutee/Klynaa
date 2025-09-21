import React, { useState, useRef, useEffect } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { Icons } from './Icons';
import { Button } from './Button';
import { Input } from './Form';

// Search Bar Component
export interface SearchBarProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: 'sm' | 'md' | 'lg';
  onSearch?: (query: string) => void;
  suggestions?: string[];
  loading?: boolean;
  clearable?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  size = 'md',
  onSearch,
  suggestions = [],
  loading = false,
  clearable = true,
  className,
  value,
  onChange,
  placeholder = 'Search...',
  ...props
}) => {
  const [query, setQuery] = useState((value as string) || '');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const filteredSuggestions = suggestions.filter(suggestion =>
    suggestion.toLowerCase().includes(query.toLowerCase())
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    onChange?.(e);
    setSelectedIndex(-1);
    setShowSuggestions(filteredSuggestions.length > 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, filteredSuggestions.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSuggestionClick(filteredSuggestions[selectedIndex]);
        } else {
          handleSearch();
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleSearch = () => {
    onSearch?.(query);
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    onSearch?.(suggestion);
  };

  const handleClear = () => {
    setQuery('');
    setShowSuggestions(false);
    onChange?.({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>);
    inputRef.current?.focus();
  };

  const sizes = {
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-12',
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={cn('relative', className)}>
      <div className="relative">
        <Icons.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size="sm" />
        <Input
          ref={inputRef}
          className={cn('pl-10', clearable && query && 'pr-20', sizes[size])}
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => filteredSuggestions.length > 0 && setShowSuggestions(true)}
          placeholder={placeholder}
          {...props}
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
          {loading && (
            <div className="animate-spin">
              <Icons.Settings size="sm" />
            </div>
          )}
          {clearable && query && !loading && (
            <button
              onClick={handleClear}
              className="text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              <Icons.X size="sm" />
            </button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSearch}
            className="p-1"
          >
            <Icons.Search size="sm" />
          </Button>
        </div>
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-10 w-full mt-1 bg-white border border-neutral-200 rounded-md shadow-lg max-h-60 overflow-auto"
        >
          {filteredSuggestions.map((suggestion, index) => (
            <button
              key={index}
              className={cn(
                'w-full text-left px-3 py-2 text-sm hover:bg-neutral-50 transition-colors',
                index === selectedIndex && 'bg-primary-50 text-primary-600'
              )}
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Filter Option Interface
export interface FilterOption {
  id: string;
  label: string;
  value: any;
  count?: number;
}

export interface FilterGroup {
  id: string;
  label: string;
  type: 'checkbox' | 'radio' | 'select' | 'range' | 'date';
  options?: FilterOption[];
  min?: number;
  max?: number;
  step?: number;
  multiple?: boolean;
}

// Single Filter Component
export interface FilterProps {
  group: FilterGroup;
  selectedValues: any[];
  onChange: (values: any[]) => void;
  className?: string;
}

export const Filter: React.FC<FilterProps> = ({
  group,
  selectedValues,
  onChange,
  className,
}) => {
  const handleCheckboxChange = (optionId: string, checked: boolean) => {
    if (checked) {
      onChange([...selectedValues, optionId]);
    } else {
      onChange(selectedValues.filter(id => id !== optionId));
    }
  };

  const handleRadioChange = (optionId: string) => {
    onChange([optionId]);
  };

  const handleSelectChange = (value: string) => {
    if (group.multiple) {
      const values = selectedValues.includes(value)
        ? selectedValues.filter(v => v !== value)
        : [...selectedValues, value];
      onChange(values);
    } else {
      onChange([value]);
    }
  };

  const handleRangeChange = (type: 'min' | 'max', value: number) => {
    const currentRange = selectedValues.length > 0 ? selectedValues[0] : { min: group.min, max: group.max };
    onChange([{ ...currentRange, [type]: value }]);
  };

  return (
    <div className={cn('space-y-3', className)}>
      <h3 className="font-medium text-sm text-neutral-900">{group.label}</h3>

      {group.type === 'checkbox' && (
        <div className="space-y-2">
          {group.options?.map(option => (
            <label key={option.id} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedValues.includes(option.id)}
                onChange={(e) => handleCheckboxChange(option.id, e.target.checked)}
                className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-neutral-700">{option.label}</span>
              {option.count !== undefined && (
                <span className="text-xs text-neutral-400">({option.count})</span>
              )}
            </label>
          ))}
        </div>
      )}

      {group.type === 'radio' && (
        <div className="space-y-2">
          {group.options?.map(option => (
            <label key={option.id} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name={group.id}
                checked={selectedValues.includes(option.id)}
                onChange={() => handleRadioChange(option.id)}
                className="border-neutral-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-neutral-700">{option.label}</span>
              {option.count !== undefined && (
                <span className="text-xs text-neutral-400">({option.count})</span>
              )}
            </label>
          ))}
        </div>
      )}

      {group.type === 'select' && (
        <select
          multiple={group.multiple}
          value={group.multiple ? selectedValues : selectedValues[0] || ''}
          onChange={(e) => {
            if (group.multiple) {
              const values = Array.from(e.target.selectedOptions, option => option.value);
              onChange(values);
            } else {
              onChange([e.target.value]);
            }
          }}
          className="w-full rounded-md border-neutral-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        >
          <option value="">All</option>
          {group.options?.map(option => (
            <option key={option.id} value={option.id}>
              {option.label}
              {option.count !== undefined && ` (${option.count})`}
            </option>
          ))}
        </select>
      )}

      {group.type === 'range' && (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <input
              type="number"
              placeholder="Min"
              min={group.min}
              max={group.max}
              step={group.step}
              value={selectedValues[0]?.min || ''}
              onChange={(e) => handleRangeChange('min', parseFloat(e.target.value))}
              className="flex-1 rounded-md border-neutral-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            />
            <span className="text-neutral-400">to</span>
            <input
              type="number"
              placeholder="Max"
              min={group.min}
              max={group.max}
              step={group.step}
              value={selectedValues[0]?.max || ''}
              onChange={(e) => handleRangeChange('max', parseFloat(e.target.value))}
              className="flex-1 rounded-md border-neutral-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            />
          </div>
        </div>
      )}

      {group.type === 'date' && (
        <div className="space-y-2">
          <input
            type="date"
            value={selectedValues[0] || ''}
            onChange={(e) => onChange([e.target.value])}
            className="w-full rounded-md border-neutral-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          />
        </div>
      )}
    </div>
  );
};

// Filter Panel Component
export interface FilterPanelProps {
  groups: FilterGroup[];
  selectedFilters: Record<string, any[]>;
  onChange: (filters: Record<string, any[]>) => void;
  onClear?: () => void;
  className?: string;
  collapsible?: boolean;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  groups,
  selectedFilters,
  onChange,
  onClear,
  className,
  collapsible = false,
}) => {
  const [collapsed, setCollapsed] = useState(false);

  const handleFilterChange = (groupId: string, values: any[]) => {
    onChange({
      ...selectedFilters,
      [groupId]: values,
    });
  };

  const activeFiltersCount = Object.values(selectedFilters).reduce(
    (count, values) => count + values.length,
    0
  );

  return (
    <div className={cn('bg-white border border-neutral-200 rounded-lg', className)}>
      <div className="p-4 border-b border-neutral-200">
        <div className="flex items-center justify-between">
          <h2 className="font-medium text-neutral-900 flex items-center">
            <Icons.Filter size="sm" className="mr-2" />
            Filters
            {activeFiltersCount > 0 && (
              <span className="ml-2 px-2 py-1 text-xs bg-primary-100 text-primary-700 rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </h2>
          <div className="flex items-center space-x-2">
            {onClear && activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClear}
                className="text-xs"
              >
                Clear all
              </Button>
            )}
            {collapsible && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCollapsed(!collapsed)}
              >
                {collapsed ? <Icons.ChevronDown size="sm" /> : <Icons.ChevronUp size="sm" />}
              </Button>
            )}
          </div>
        </div>
      </div>

      {!collapsed && (
        <div className="p-4 space-y-6">
          {groups.map(group => (
            <Filter
              key={group.id}
              group={group}
              selectedValues={selectedFilters[group.id] || []}
              onChange={(values) => handleFilterChange(group.id, values)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Active Filters Display
export interface ActiveFiltersProps {
  groups: FilterGroup[];
  selectedFilters: Record<string, any[]>;
  onChange: (filters: Record<string, any[]>) => void;
  className?: string;
}

export const ActiveFilters: React.FC<ActiveFiltersProps> = ({
  groups,
  selectedFilters,
  onChange,
  className,
}) => {
  const getFilterLabel = (groupId: string, value: any): string => {
    const group = groups.find(g => g.id === groupId);
    if (!group) return String(value);

    if (group.type === 'range') {
      return `${value.min || group.min}-${value.max || group.max}`;
    }

    const option = group.options?.find(o => o.id === value);
    return option?.label || String(value);
  };

  const removeFilter = (groupId: string, value: any) => {
    const currentValues = selectedFilters[groupId] || [];
    const newValues = currentValues.filter(v =>
      typeof v === 'object' ? JSON.stringify(v) !== JSON.stringify(value) : v !== value
    );

    onChange({
      ...selectedFilters,
      [groupId]: newValues,
    });
  };

  const clearAll = () => {
    onChange({});
  };

  const activeFilters = Object.entries(selectedFilters)
    .filter(([_, values]) => values.length > 0)
    .flatMap(([groupId, values]) =>
      values.map(value => ({ groupId, value, label: getFilterLabel(groupId, value) }))
    );

  if (activeFilters.length === 0) return null;

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      <span className="text-sm text-neutral-600">Active filters:</span>
      {activeFilters.map(({ groupId, value, label }, index) => (
        <span
          key={`${groupId}-${index}`}
          className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-primary-100 text-primary-800"
        >
          {label}
          <button
            onClick={() => removeFilter(groupId, value)}
            className="ml-1 hover:text-primary-900"
          >
            <Icons.X size="xs" />
          </button>
        </span>
      ))}
      <Button
        variant="ghost"
        size="sm"
        onClick={clearAll}
        className="text-xs text-neutral-600 hover:text-neutral-800"
      >
        Clear all
      </Button>
    </div>
  );
};

// Sort Component
export interface SortOption {
  id: string;
  label: string;
  direction?: 'asc' | 'desc';
}

export interface SortProps {
  options: SortOption[];
  selectedSort: string;
  onSortChange: (sortId: string) => void;
  className?: string;
}

export const Sort: React.FC<SortProps> = ({
  options,
  selectedSort,
  onSortChange,
  className,
}) => {
  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <span className="text-sm text-neutral-600">Sort by:</span>
      <select
        value={selectedSort}
        onChange={(e) => onSortChange(e.target.value)}
        className="rounded-md border-neutral-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm"
      >
        {options.map(option => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SearchBar;