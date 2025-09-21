import React, { useState, useEffect, useRef, useCallback } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { Icons } from './Icons';

// Types
export interface SecurityLevel {
  level: 'low' | 'medium' | 'high' | 'critical';
  score: number;
  recommendations: string[];
}

export interface BiometricSupport {
  fingerprint: boolean;
  faceId: boolean;
  touchId: boolean;
  voice: boolean;
}

// PIN Entry Component
export interface PINEntryProps {
  length?: number;
  onComplete?: (pin: string) => void;
  onError?: (error: string) => void;
  masked?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
  maxAttempts?: number;
  lockoutDuration?: number; // seconds
  className?: string;
}

export const PINEntry: React.FC<PINEntryProps> = ({
  length = 4,
  onComplete,
  onError,
  masked = true,
  disabled = false,
  autoFocus = true,
  maxAttempts = 3,
  lockoutDuration = 30,
  className,
}) => {
  const [pin, setPin] = useState<string[]>(new Array(length).fill(''));
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTime, setLockoutTime] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Handle lockout timer
  useEffect(() => {
    if (isLocked && lockoutTime > 0) {
      const timer = setInterval(() => {
        setLockoutTime((prev) => {
          if (prev <= 1) {
            setIsLocked(false);
            setAttempts(0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isLocked, lockoutTime]);

  const handleInputChange = (index: number, value: string) => {
    if (disabled || isLocked) return;

    // Only allow single digits
    if (value.length > 1) value = value.slice(-1);
    if (value && !/^\d$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);

    // Move to next input
    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Check if PIN is complete
    if (newPin.every(digit => digit !== '') && newPin.join('').length === length) {
      const pinValue = newPin.join('');
      onComplete?.(pinValue);
    }
  };

  const handleKeyDown = (index: number, event: React.KeyboardEvent) => {
    if (disabled || isLocked) return;

    if (event.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (event: React.ClipboardEvent) => {
    if (disabled || isLocked) return;

    event.preventDefault();
    const pastedData = event.clipboardData.getData('text/plain').slice(0, length);

    if (!/^\d+$/.test(pastedData)) return;

    const newPin = [...pin];
    for (let i = 0; i < pastedData.length && i < length; i++) {
      newPin[i] = pastedData[i];
    }
    setPin(newPin);

    // Focus the next empty input or the last one
    const nextEmptyIndex = newPin.findIndex(digit => digit === '');
    const focusIndex = nextEmptyIndex === -1 ? length - 1 : nextEmptyIndex;
    inputRefs.current[focusIndex]?.focus();

    // Check completion
    if (newPin.every(digit => digit !== '')) {
      onComplete?.(newPin.join(''));
    }
  };

  const handleError = () => {
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    if (newAttempts >= maxAttempts) {
      setIsLocked(true);
      setLockoutTime(lockoutDuration);
      onError?.(`Too many failed attempts. Locked for ${lockoutDuration} seconds.`);
    } else {
      onError?.(`Incorrect PIN. ${maxAttempts - newAttempts} attempts remaining.`);
    }

    // Clear PIN
    setPin(new Array(length).fill(''));
    inputRefs.current[0]?.focus();
  };

  const clearPIN = () => {
    setPin(new Array(length).fill(''));
    inputRefs.current[0]?.focus();
  };

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex justify-center space-x-2">
        {pin.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type={masked ? 'password' : 'text'}
            inputMode="numeric"
            pattern="\d*"
            maxLength={1}
            value={digit}
            onChange={(e) => handleInputChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            autoFocus={autoFocus && index === 0}
            disabled={disabled || isLocked}
            className={cn(
              'w-12 h-12 text-center text-lg font-bold border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors',
              digit
                ? 'border-primary-500 bg-primary-50'
                : 'border-neutral-300 bg-white',
              (disabled || isLocked) && 'bg-neutral-100 cursor-not-allowed',
              'focus:border-primary-500'
            )}
          />
        ))}
      </div>

      {/* Status Messages */}
      {isLocked && (
        <div className="text-center text-danger-600 text-sm">
          <Icons.XCircle className="h-4 w-4 inline mr-1" />
          Locked for {lockoutTime} seconds
        </div>
      )}

      {attempts > 0 && !isLocked && (
        <div className="text-center text-warning-600 text-sm">
          {maxAttempts - attempts} attempts remaining
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={clearPIN}
          disabled={disabled || isLocked}
          className="text-sm text-neutral-600 hover:text-neutral-900 disabled:opacity-50"
        >
          Clear
        </button>
      </div>
    </div>
  );
};

// Biometric Authentication Component
export interface BiometricAuthProps {
  supportedMethods?: Array<'fingerprint' | 'faceId' | 'touchId' | 'voice'>;
  onAuthenticate?: (method: string, success: boolean) => void;
  onError?: (error: string) => void;
  fallbackToPIN?: boolean;
  disabled?: boolean;
  className?: string;
}

export const BiometricAuth: React.FC<BiometricAuthProps> = ({
  supportedMethods = ['fingerprint', 'faceId'],
  onAuthenticate,
  onError,
  fallbackToPIN = true,
  disabled = false,
  className,
}) => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [showPINFallback, setShowPINFallback] = useState(false);
  const [availableMethods, setAvailableMethods] = useState<string[]>([]);

  useEffect(() => {
    // Check available biometric methods (mock implementation)
    const checkSupport = async () => {
      // In a real app, this would check actual device capabilities
      const mockSupport = {
        fingerprint: true,
        faceId: false,
        touchId: true,
        voice: false,
      };

      const available = supportedMethods.filter(method => mockSupport[method]);
      setAvailableMethods(available);
    };

    checkSupport();
  }, [supportedMethods]);

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'fingerprint':
      case 'touchId':
        return Icons.User;
      case 'faceId':
        return Icons.User;
      case 'voice':
        return Icons.Settings;
      default:
        return Icons.User;
    }
  };

  const getMethodLabel = (method: string) => {
    switch (method) {
      case 'fingerprint':
        return 'Fingerprint';
      case 'faceId':
        return 'Face ID';
      case 'touchId':
        return 'Touch ID';
      case 'voice':
        return 'Voice';
      default:
        return method;
    }
  };

  const authenticateWithBiometric = async (method: string) => {
    if (disabled || isAuthenticating) return;

    setIsAuthenticating(true);

    try {
      // Mock biometric authentication
      const success = await new Promise<boolean>((resolve) => {
        setTimeout(() => {
          // Simulate success/failure
          resolve(Math.random() > 0.2); // 80% success rate
        }, 2000);
      });

      onAuthenticate?.(method, success);

      if (!success && fallbackToPIN) {
        setShowPINFallback(true);
      }
    } catch (error) {
      onError?.(`Biometric authentication failed: ${error}`);
      if (fallbackToPIN) {
        setShowPINFallback(true);
      }
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handlePINComplete = (pin: string) => {
    // Mock PIN validation
    const isValid = pin === '1234'; // Mock valid PIN
    onAuthenticate?.('pin', isValid);

    if (!isValid) {
      onError?.('Invalid PIN');
    }
  };

  if (showPINFallback) {
    return (
      <div className={cn('space-y-4', className)}>
        <div className="text-center">
          <h3 className="text-lg font-medium text-neutral-900 mb-2">
            Enter PIN
          </h3>
          <p className="text-sm text-neutral-600">
            Biometric authentication unavailable
          </p>
        </div>

        <PINEntry
          onComplete={handlePINComplete}
          onError={onError}
        />

        <button
          onClick={() => setShowPINFallback(false)}
          className="w-full text-sm text-primary-600 hover:text-primary-700"
        >
          Try biometric authentication again
        </button>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      <div className="text-center">
        <h3 className="text-lg font-medium text-neutral-900 mb-2">
          Biometric Authentication
        </h3>
        <p className="text-sm text-neutral-600">
          Use your biometric data to authenticate
        </p>
      </div>

      {availableMethods.length === 0 ? (
        <div className="text-center py-8">
          <Icons.XCircle className="h-8 w-8 mx-auto mb-2 text-neutral-400" />
          <p className="text-sm text-neutral-500">
            No biometric methods available
          </p>
          {fallbackToPIN && (
            <button
              onClick={() => setShowPINFallback(true)}
              className="mt-2 text-sm text-primary-600 hover:text-primary-700"
            >
              Use PIN instead
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {availableMethods.map((method) => {
            const IconComponent = getMethodIcon(method);
            return (
              <button
                key={method}
                onClick={() => authenticateWithBiometric(method)}
                disabled={disabled || isAuthenticating}
                className={cn(
                  'w-full p-4 border-2 border-dashed border-neutral-300 rounded-lg hover:border-primary-400 hover:bg-primary-50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed',
                  isAuthenticating && 'border-primary-400 bg-primary-50'
                )}
              >
                <div className="flex items-center justify-center space-x-3">
                  {isAuthenticating ? (
                    <div className="animate-spin h-6 w-6 text-primary-600">
                      <Icons.Settings className="h-full w-full" />
                    </div>
                  ) : (
                    <IconComponent className="h-6 w-6 text-neutral-600" />
                  )}
                  <span className="font-medium text-neutral-900">
                    {isAuthenticating ? 'Authenticating...' : getMethodLabel(method)}
                  </span>
                </div>
              </button>
            );
          })}

          {fallbackToPIN && (
            <button
              onClick={() => setShowPINFallback(true)}
              className="w-full text-sm text-neutral-600 hover:text-neutral-900"
            >
              Use PIN instead
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// Security Indicator Component
const securityIndicatorVariants = cva(
  'flex items-center space-x-2',
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

export interface SecurityIndicatorProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof securityIndicatorVariants> {
  level: SecurityLevel;
  showDetails?: boolean;
  onViewDetails?: () => void;
}

export const SecurityIndicator: React.FC<SecurityIndicatorProps> = ({
  size,
  level,
  showDetails = false,
  onViewDetails,
  className,
  ...props
}) => {
  const getSecurityConfig = () => {
    switch (level.level) {
      case 'low':
        return {
          color: 'text-danger-600',
          bgColor: 'bg-danger-100',
          icon: Icons.AlertTriangle,
          label: 'Low Security',
        };
      case 'medium':
        return {
          color: 'text-warning-600',
          bgColor: 'bg-warning-100',
          icon: Icons.AlertTriangle,
          label: 'Medium Security',
        };
      case 'high':
        return {
          color: 'text-success-600',
          bgColor: 'bg-success-100',
          icon: Icons.CheckCircle,
          label: 'High Security',
        };
      case 'critical':
        return {
          color: 'text-danger-600',
          bgColor: 'bg-danger-100',
          icon: Icons.XCircle,
          label: 'Critical Risk',
        };
      default:
        return {
          color: 'text-neutral-600',
          bgColor: 'bg-neutral-100',
          icon: Icons.Info,
          label: 'Unknown',
        };
    }
  };

  const config = getSecurityConfig();
  const IconComponent = config.icon;

  return (
    <div className={cn(securityIndicatorVariants({ size }), className)} {...props}>
      <div className={cn('p-2 rounded-full', config.bgColor)}>
        <IconComponent className={cn('h-4 w-4', config.color)} />
      </div>

      <div className="flex-1">
        <div className="flex items-center space-x-2">
          <span className={cn('font-medium', config.color)}>
            {config.label}
          </span>
          <span className="text-neutral-500">
            ({level.score}/100)
          </span>
        </div>

        {showDetails && level.recommendations.length > 0 && (
          <div className="mt-1">
            <ul className="text-xs text-neutral-600 space-y-1">
              {level.recommendations.slice(0, 2).map((rec, index) => (
                <li key={index} className="flex items-start space-x-1">
                  <span className="text-neutral-400">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>

            {level.recommendations.length > 2 && (
              <button
                onClick={onViewDetails}
                className="text-xs text-primary-600 hover:text-primary-700 mt-1"
              >
                View all recommendations
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Privacy Controls Component
export interface PrivacyControlsProps {
  settings: {
    dataCollection: boolean;
    locationTracking: boolean;
    analyticsSharing: boolean;
    marketingEmails: boolean;
    thirdPartySharing: boolean;
  };
  onSettingChange: (setting: string, enabled: boolean) => void;
  className?: string;
}

export const PrivacyControls: React.FC<PrivacyControlsProps> = ({
  settings,
  onSettingChange,
  className,
}) => {
  const privacySettings = [
    {
      key: 'dataCollection',
      label: 'Data Collection',
      description: 'Allow app to collect usage data for improvement',
      icon: Icons.Settings,
      critical: false,
    },
    {
      key: 'locationTracking',
      label: 'Location Tracking',
      description: 'Enable location services for pickup scheduling',
      icon: Icons.MapPin,
      critical: true,
    },
    {
      key: 'analyticsSharing',
      label: 'Analytics Sharing',
      description: 'Share anonymized analytics with third parties',
      icon: Icons.Settings,
      critical: false,
    },
    {
      key: 'marketingEmails',
      label: 'Marketing Emails',
      description: 'Receive promotional emails and offers',
      icon: Icons.User,
      critical: false,
    },
    {
      key: 'thirdPartySharing',
      label: 'Third-party Sharing',
      description: 'Allow sharing data with partner services',
      icon: Icons.Settings,
      critical: false,
    },
  ];

  return (
    <div className={cn('space-y-6', className)}>
      <div>
        <h3 className="text-lg font-semibold text-neutral-900 mb-2">
          Privacy Controls
        </h3>
        <p className="text-sm text-neutral-600">
          Manage your privacy settings and data sharing preferences
        </p>
      </div>

      <div className="space-y-4">
        {privacySettings.map((setting) => {
          const IconComponent = setting.icon;
          const isEnabled = settings[setting.key as keyof typeof settings];

          return (
            <div
              key={setting.key}
              className="flex items-start space-x-4 p-4 border border-neutral-200 rounded-lg"
            >
              <div className="flex-shrink-0">
                <div className={cn(
                  'p-2 rounded-lg',
                  isEnabled ? 'bg-primary-100 text-primary-600' : 'bg-neutral-100 text-neutral-400'
                )}>
                  <IconComponent className="h-4 w-4" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h4 className="text-sm font-medium text-neutral-900">
                    {setting.label}
                  </h4>
                  {setting.critical && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-warning-100 text-warning-800">
                      Required
                    </span>
                  )}
                </div>
                <p className="text-sm text-neutral-600 mt-1">
                  {setting.description}
                </p>
              </div>

              <div className="flex-shrink-0">
                <button
                  onClick={() => onSettingChange(setting.key, !isEnabled)}
                  disabled={setting.critical && isEnabled}
                  className={cn(
                    'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
                    isEnabled ? 'bg-primary-600' : 'bg-neutral-200',
                    setting.critical && isEnabled && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  <span
                    className={cn(
                      'inline-block h-4 w-4 rounded-full bg-white transition-transform',
                      isEnabled ? 'translate-x-6' : 'translate-x-1'
                    )}
                  />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Privacy Summary */}
      <div className="p-4 bg-neutral-50 rounded-lg">
        <div className="flex items-center space-x-2 mb-2">
          <Icons.Info className="h-4 w-4 text-neutral-500" />
          <span className="text-sm font-medium text-neutral-700">
            Privacy Summary
          </span>
        </div>
        <p className="text-xs text-neutral-600">
          Your privacy settings control how we collect, use, and share your data.
          Critical settings are required for app functionality. You can change these
          settings at any time.
        </p>
      </div>
    </div>
  );
};

// Two-Factor Authentication Setup
export interface TwoFactorAuthProps {
  onSetupComplete?: (secret: string, backupCodes: string[]) => void;
  onError?: (error: string) => void;
  className?: string;
}

export const TwoFactorAuth: React.FC<TwoFactorAuthProps> = ({
  onSetupComplete,
  onError,
  className,
}) => {
  const [step, setStep] = useState<'setup' | 'verify' | 'complete'>('setup');
  const [secret, setSecret] = useState('');
  const [qrCode, setQRCode] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes] = useState([
    'A1B2C3D4', 'E5F6G7H8', 'I9J0K1L2',
    'M3N4O5P6', 'Q7R8S9T0', 'U1V2W3X4'
  ]);

  useEffect(() => {
    // Generate mock secret and QR code
    const mockSecret = 'JBSWY3DPEHPK3PXP';
    const mockQRCode = `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IndoaXRlIi8+PHRleHQgeD0iMTAwIiB5PSIxMDAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuMzVlbSI+UVIgQ29kZTwvdGV4dD48L3N2Zz4=`;

    setSecret(mockSecret);
    setQRCode(mockQRCode);
  }, []);

  const handleVerify = () => {
    // Mock verification - in real app, this would verify with server
    if (verificationCode === '123456') {
      setStep('complete');
      onSetupComplete?.(secret, backupCodes);
    } else {
      onError?.('Invalid verification code');
    }
  };

  const renderStep = () => {
    switch (step) {
      case 'setup':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                Set up Two-Factor Authentication
              </h3>
              <p className="text-sm text-neutral-600">
                Scan the QR code with your authenticator app
              </p>
            </div>

            <div className="flex justify-center">
              <div className="p-4 bg-white border-2 border-neutral-200 rounded-lg">
                <img
                  src={qrCode}
                  alt="QR Code"
                  className="w-48 h-48"
                />
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm text-neutral-600 mb-2">
                Or enter this code manually:
              </p>
              <code className="px-3 py-1 bg-neutral-100 text-neutral-900 rounded text-sm font-mono">
                {secret}
              </code>
            </div>

            <button
              onClick={() => setStep('verify')}
              className="w-full px-4 py-2 bg-primary-600 text-white rounded-md font-medium hover:bg-primary-700 transition-colors"
            >
              I've added the account
            </button>
          </div>
        );

      case 'verify':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                Verify Setup
              </h3>
              <p className="text-sm text-neutral-600">
                Enter the 6-digit code from your authenticator app
              </p>
            </div>

            <div>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.slice(0, 6))}
                placeholder="000000"
                className="w-full px-4 py-3 text-center text-lg font-mono border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                maxLength={6}
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setStep('setup')}
                className="flex-1 px-4 py-2 border border-neutral-300 text-neutral-700 rounded-md font-medium hover:bg-neutral-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleVerify}
                disabled={verificationCode.length !== 6}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Verify
              </button>
            </div>
          </div>
        );

      case 'complete':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-success-100 rounded-full flex items-center justify-center mb-4">
                <Icons.CheckCircle className="h-6 w-6 text-success-600" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                Two-Factor Authentication Enabled
              </h3>
              <p className="text-sm text-neutral-600">
                Your account is now more secure
              </p>
            </div>

            <div className="p-4 bg-warning-50 border border-warning-200 rounded-lg">
              <h4 className="text-sm font-semibold text-warning-800 mb-2">
                Save your backup codes
              </h4>
              <p className="text-xs text-warning-700 mb-3">
                Use these codes if you lose access to your authenticator app
              </p>
              <div className="grid grid-cols-2 gap-2">
                {backupCodes.map((code, index) => (
                  <code
                    key={index}
                    className="px-2 py-1 bg-white text-neutral-900 rounded text-xs font-mono text-center"
                  >
                    {code}
                  </code>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={cn('max-w-md mx-auto', className)}>
      {renderStep()}
    </div>
  );
};

export default PINEntry;