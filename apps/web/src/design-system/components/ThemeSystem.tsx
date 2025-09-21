import React, { useState, useEffect, useCallback, useContext, createContext } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { Icons } from './Icons';

// Types
export interface ThemeConfig {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    danger: string;
    neutral: string;
    background: string;
    surface: string;
    text: {
      primary: string;
      secondary: string;
      disabled: string;
    };
  };
  typography: {
    fontFamily: {
      sans: string;
      mono: string;
    };
    fontSize: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
      '2xl': string;
      '3xl': string;
    };
    fontWeight: {
      normal: number;
      medium: number;
      semibold: number;
      bold: number;
    };
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    full: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
  };
  mode: 'light' | 'dark' | 'auto';
  customProperties?: Record<string, string>;
}

export interface ThemePreset {
  id: string;
  name: string;
  description: string;
  category: 'default' | 'business' | 'creative' | 'minimal' | 'colorful';
  config: ThemeConfig;
  preview?: string;
}

// Theme Context
interface ThemeContextType {
  theme: ThemeConfig;
  setTheme: (theme: ThemeConfig) => void;
  presets: ThemePreset[];
  resetTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Default theme config
const defaultTheme: ThemeConfig = {
  id: 'default',
  name: 'Default',
  colors: {
    primary: '#3B82F6',
    secondary: '#8B5CF6',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    neutral: '#6B7280',
    background: '#FFFFFF',
    surface: '#F9FAFB',
    text: {
      primary: '#111827',
      secondary: '#6B7280',
      disabled: '#D1D5DB',
    },
  },
  typography: {
    fontFamily: {
      sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      mono: 'SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  },
  mode: 'light',
};

// Theme Provider
export interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: ThemeConfig;
  presets?: ThemePreset[];
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTheme: customDefaultTheme,
  presets = [],
}) => {
  const [theme, setTheme] = useState<ThemeConfig>(customDefaultTheme || defaultTheme);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load theme from localStorage
    const savedTheme = localStorage.getItem('theme-config');
    if (savedTheme) {
      try {
        setTheme(JSON.parse(savedTheme));
      } catch (error) {
        console.error('Failed to load saved theme:', error);
      }
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      // Save theme to localStorage
      localStorage.setItem('theme-config', JSON.stringify(theme));

      // Apply CSS custom properties
      const root = document.documentElement;

      // Apply colors
      Object.entries(theme.colors).forEach(([key, value]) => {
        if (typeof value === 'object') {
          Object.entries(value).forEach(([subKey, subValue]) => {
            root.style.setProperty(`--theme-${key}-${subKey}`, subValue);
          });
        } else {
          root.style.setProperty(`--theme-${key}`, value);
        }
      });

      // Apply typography
      Object.entries(theme.typography).forEach(([key, value]) => {
        if (typeof value === 'object') {
          Object.entries(value).forEach(([subKey, subValue]) => {
            root.style.setProperty(`--theme-${key}-${subKey}`, String(subValue));
          });
        }
      });

      // Apply spacing
      Object.entries(theme.spacing).forEach(([key, value]) => {
        root.style.setProperty(`--theme-spacing-${key}`, value);
      });

      // Apply border radius
      Object.entries(theme.borderRadius).forEach(([key, value]) => {
        root.style.setProperty(`--theme-radius-${key}`, value);
      });

      // Apply shadows
      Object.entries(theme.shadows).forEach(([key, value]) => {
        root.style.setProperty(`--theme-shadow-${key}`, value);
      });

      // Apply custom properties
      if (theme.customProperties) {
        Object.entries(theme.customProperties).forEach(([key, value]) => {
          root.style.setProperty(key, value);
        });
      }

      // Apply dark/light mode
      if (theme.mode === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [theme, mounted]);

  const resetTheme = useCallback(() => {
    setTheme(customDefaultTheme || defaultTheme);
  }, [customDefaultTheme]);

  if (!mounted) {
    return null; // Prevent hydration mismatch
  }

  const contextValue: ThemeContextType = {
    theme,
    setTheme,
    presets,
    resetTheme,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

// Color Picker Component
export interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  label?: string;
  presetColors?: string[];
  className?: string;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  color,
  onChange,
  label,
  presetColors = [
    '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899',
    '#6B7280', '#111827', '#FFFFFF', '#F3F4F6', '#E5E7EB', '#D1D5DB',
  ],
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputColor, setInputColor] = useState(color);

  useEffect(() => {
    setInputColor(color);
  }, [color]);

  const handleColorChange = (newColor: string) => {
    setInputColor(newColor);
    onChange(newColor);
  };

  return (
    <div className={cn('relative', className)}>
      {label && (
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          {label}
        </label>
      )}

      <div className="flex items-center space-x-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-10 h-10 rounded-md border-2 border-neutral-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 relative overflow-hidden"
          style={{ backgroundColor: color }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black opacity-10" />
        </button>

        <input
          type="text"
          value={inputColor}
          onChange={(e) => handleColorChange(e.target.value)}
          className="flex-1 px-3 py-2 border border-neutral-300 rounded-md text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          placeholder="#000000"
        />
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-2 p-4 bg-white border border-neutral-200 rounded-lg shadow-lg">
          <div className="mb-4">
            <input
              type="color"
              value={color}
              onChange={(e) => handleColorChange(e.target.value)}
              className="w-full h-32 border border-neutral-300 rounded-md cursor-pointer"
            />
          </div>

          <div className="mb-4">
            <p className="text-sm font-medium text-neutral-700 mb-2">Presets</p>
            <div className="grid grid-cols-6 gap-2">
              {presetColors.map((presetColor) => (
                <button
                  key={presetColor}
                  onClick={() => handleColorChange(presetColor)}
                  className={cn(
                    'w-8 h-8 rounded border-2 focus:outline-none focus:ring-2 focus:ring-primary-500',
                    color === presetColor ? 'border-primary-500' : 'border-neutral-300'
                  )}
                  style={{ backgroundColor: presetColor }}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setIsOpen(false)}
              className="px-3 py-1 text-sm border border-neutral-300 rounded-md hover:bg-neutral-50"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Theme Customizer Panel
export interface ThemeCustomizerProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export const ThemeCustomizer: React.FC<ThemeCustomizerProps> = ({
  isOpen,
  onClose,
  className,
}) => {
  const { theme, setTheme, resetTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<'colors' | 'typography' | 'layout' | 'presets'>('colors');

  const updateTheme = (updates: Partial<ThemeConfig>) => {
    setTheme({ ...theme, ...updates });
  };

  const updateColors = (colorUpdates: Partial<ThemeConfig['colors']>) => {
    updateTheme({
      colors: { ...theme.colors, ...colorUpdates }
    });
  };

  const updateTypography = (typographyUpdates: Partial<ThemeConfig['typography']>) => {
    updateTheme({
      typography: { ...theme.typography, ...typographyUpdates }
    });
  };

  const tabs = [
    { id: 'colors', label: 'Colors', icon: Icons.Settings },
    { id: 'typography', label: 'Typography', icon: Icons.User },
    { id: 'layout', label: 'Layout', icon: Icons.Settings },
    { id: 'presets', label: 'Presets', icon: Icons.Settings },
  ] as const;

  if (!isOpen) return null;

  return (
    <div className={cn('fixed inset-0 z-50 overflow-hidden', className)}>
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />

      <div className="absolute right-0 top-0 h-full w-96 bg-white shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-neutral-200">
          <h2 className="text-lg font-semibold text-neutral-900">Theme Customizer</h2>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-neutral-600 rounded-md hover:bg-neutral-100"
          >
            <Icons.XCircle className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-neutral-200">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium transition-colors',
                  activeTab === tab.id
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-neutral-500 hover:text-neutral-700'
                )}
              >
                <IconComponent className="h-4 w-4 mr-1" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'colors' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-neutral-900 mb-4">Brand Colors</h3>
                <div className="space-y-4">
                  <ColorPicker
                    label="Primary"
                    color={theme.colors.primary}
                    onChange={(color) => updateColors({ primary: color })}
                  />
                  <ColorPicker
                    label="Secondary"
                    color={theme.colors.secondary}
                    onChange={(color) => updateColors({ secondary: color })}
                  />
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-neutral-900 mb-4">Status Colors</h3>
                <div className="space-y-4">
                  <ColorPicker
                    label="Success"
                    color={theme.colors.success}
                    onChange={(color) => updateColors({ success: color })}
                  />
                  <ColorPicker
                    label="Warning"
                    color={theme.colors.warning}
                    onChange={(color) => updateColors({ warning: color })}
                  />
                  <ColorPicker
                    label="Danger"
                    color={theme.colors.danger}
                    onChange={(color) => updateColors({ danger: color })}
                  />
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-neutral-900 mb-4">Surface Colors</h3>
                <div className="space-y-4">
                  <ColorPicker
                    label="Background"
                    color={theme.colors.background}
                    onChange={(color) => updateColors({ background: color })}
                  />
                  <ColorPicker
                    label="Surface"
                    color={theme.colors.surface}
                    onChange={(color) => updateColors({ surface: color })}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'typography' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-neutral-900 mb-4">Font Family</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Sans Serif
                    </label>
                    <select
                      value={theme.typography.fontFamily.sans}
                      onChange={(e) => updateTypography({
                        fontFamily: { ...theme.typography.fontFamily, sans: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif">System Default</option>
                      <option value="Manrope, sans-serif">Manrope</option>
                      <option value="'Roboto', sans-serif">Roboto</option>
                      <option value="'Open Sans', sans-serif">Open Sans</option>
                      <option value="'Poppins', sans-serif">Poppins</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Monospace
                    </label>
                    <select
                      value={theme.typography.fontFamily.mono}
                      onChange={(e) => updateTypography({
                        fontFamily: { ...theme.typography.fontFamily, mono: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="SFMono-Regular, Menlo, Monaco, Consolas, monospace">System Default</option>
                      <option value="'JetBrains Mono', monospace">JetBrains Mono</option>
                      <option value="'Fira Code', monospace">Fira Code</option>
                      <option value="'Source Code Pro', monospace">Source Code Pro</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-neutral-900 mb-4">Font Sizes</h3>
                <div className="space-y-4">
                  {Object.entries(theme.typography.fontSize).map(([key, value]) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        {key.toUpperCase()} ({value})
                      </label>
                      <input
                        type="range"
                        min="0.5"
                        max="4"
                        step="0.125"
                        value={parseFloat(value)}
                        onChange={(e) => updateTypography({
                          fontSize: { ...theme.typography.fontSize, [key]: `${e.target.value}rem` }
                        })}
                        className="w-full"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'layout' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-neutral-900 mb-4">Border Radius</h3>
                <div className="space-y-4">
                  {Object.entries(theme.borderRadius).map(([key, value]) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        {key.charAt(0).toUpperCase() + key.slice(1)} ({value})
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="2"
                        step="0.125"
                        value={key === 'full' ? 20 : parseFloat(value)}
                        onChange={(e) => {
                          const newValue = key === 'full' ? '9999px' : `${e.target.value}rem`;
                          updateTheme({
                            borderRadius: { ...theme.borderRadius, [key]: newValue }
                          });
                        }}
                        className="w-full"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-neutral-900 mb-4">Dark Mode</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    {(['light', 'dark', 'auto'] as const).map((mode) => (
                      <label key={mode} className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="theme-mode"
                          value={mode}
                          checked={theme.mode === mode}
                          onChange={(e) => updateTheme({ mode: e.target.value as any })}
                          className="border-neutral-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm text-neutral-700 capitalize">{mode}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'presets' && (
            <div className="space-y-4">
              <p className="text-sm text-neutral-600">
                Choose from pre-built themes or save your current customizations.
              </p>

              <div className="space-y-3">
                <button
                  onClick={() => updateTheme(defaultTheme)}
                  className="w-full p-3 text-left border border-neutral-200 rounded-md hover:bg-neutral-50 transition-colors"
                >
                  <div className="font-medium text-neutral-900">Default Theme</div>
                  <div className="text-sm text-neutral-600">Clean and minimal design</div>
                </button>

                {/* Mock preset themes */}
                <button className="w-full p-3 text-left border border-neutral-200 rounded-md hover:bg-neutral-50 transition-colors">
                  <div className="font-medium text-neutral-900">Dark Theme</div>
                  <div className="text-sm text-neutral-600">Dark mode optimized</div>
                </button>

                <button className="w-full p-3 text-left border border-neutral-200 rounded-md hover:bg-neutral-50 transition-colors">
                  <div className="font-medium text-neutral-900">Colorful Theme</div>
                  <div className="text-sm text-neutral-600">Vibrant and energetic</div>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-neutral-200 p-4">
          <div className="flex space-x-2">
            <button
              onClick={resetTheme}
              className="flex-1 px-4 py-2 border border-neutral-300 text-neutral-700 rounded-md hover:bg-neutral-50 transition-colors"
            >
              Reset
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Theme Preview Component
export interface ThemePreviewProps {
  theme: ThemeConfig;
  onSelect?: () => void;
  isSelected?: boolean;
  className?: string;
}

export const ThemePreview: React.FC<ThemePreviewProps> = ({
  theme,
  onSelect,
  isSelected = false,
  className,
}) => {
  return (
    <button
      onClick={onSelect}
      className={cn(
        'w-full p-4 text-left border-2 rounded-lg transition-all duration-200 hover:shadow-md',
        isSelected
          ? 'border-primary-300 bg-primary-50'
          : 'border-neutral-200 bg-white hover:border-neutral-300',
        className
      )}
    >
      {/* Theme Name */}
      <div className="mb-3">
        <h3 className="font-medium text-neutral-900">{theme.name}</h3>
      </div>

      {/* Color Palette Preview */}
      <div className="flex space-x-2 mb-3">
        {[
          theme.colors.primary,
          theme.colors.secondary,
          theme.colors.success,
          theme.colors.warning,
          theme.colors.danger,
        ].map((color, index) => (
          <div
            key={index}
            className="w-6 h-6 rounded-full border border-neutral-200"
            style={{ backgroundColor: color }}
          />
        ))}
      </div>

      {/* UI Preview */}
      <div
        className="p-3 rounded border"
        style={{
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.neutral + '40',
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <div
            className="w-16 h-2 rounded"
            style={{ backgroundColor: theme.colors.text.primary + '20' }}
          />
          <div
            className="w-12 h-5 rounded text-xs flex items-center justify-center text-white"
            style={{ backgroundColor: theme.colors.primary }}
          >
            Button
          </div>
        </div>
        <div
          className="w-24 h-2 rounded mb-1"
          style={{ backgroundColor: theme.colors.text.secondary + '40' }}
        />
        <div
          className="w-20 h-2 rounded"
          style={{ backgroundColor: theme.colors.text.secondary + '20' }}
        />
      </div>
    </button>
  );
};

// Quick Theme Switcher
export interface QuickThemeSwitcherProps {
  className?: string;
}

export const QuickThemeSwitcher: React.FC<QuickThemeSwitcherProps> = ({
  className,
}) => {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const quickThemes = [
    {
      ...defaultTheme,
      name: 'Light',
      mode: 'light' as const,
    },
    {
      ...defaultTheme,
      name: 'Dark',
      mode: 'dark' as const,
      colors: {
        ...defaultTheme.colors,
        background: '#111827',
        surface: '#1F2937',
        text: {
          primary: '#F9FAFB',
          secondary: '#D1D5DB',
          disabled: '#6B7280',
        },
      },
    },
  ];

  return (
    <div className={cn('relative', className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors"
        title="Switch Theme"
      >
        <Icons.Settings className="h-5 w-5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-neutral-200 rounded-lg shadow-lg z-50">
          <div className="p-2">
            <div className="text-xs font-semibold text-neutral-600 mb-2 px-2">
              Quick Switch
            </div>
            {quickThemes.map((quickTheme) => (
              <button
                key={quickTheme.name}
                onClick={() => {
                  setTheme(quickTheme);
                  setIsOpen(false);
                }}
                className={cn(
                  'w-full flex items-center space-x-2 px-2 py-1.5 text-sm rounded hover:bg-neutral-50 transition-colors',
                  theme.mode === quickTheme.mode && 'bg-primary-50 text-primary-700'
                )}
              >
                <div
                  className="w-3 h-3 rounded-full border border-neutral-200"
                  style={{ backgroundColor: quickTheme.colors.primary }}
                />
                <span>{quickTheme.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeCustomizer;