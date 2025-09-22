import React, { useEffect, useState } from 'react';
import { Icon } from '../../components/ui/Icons';
import { useLanguage } from '../contexts/LanguageContext';

export type VerificationStatus = 'verified' | 'pending' | 'rejected' | 'not_started';

interface VerificationBadgeProps {
  status: VerificationStatus;
  onClick?: () => void;
  className?: string;
}

export default function VerificationBadge({ status, onClick, className = '' }: VerificationBadgeProps) {
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getStatusConfig = (status: VerificationStatus) => {
    // Use fallback text for SSR compatibility
    const fallbackTexts = {
      'verified': 'Verified',
      'pending': 'Pending',
      'rejected': 'Rejected',
      'not_started': 'Not Started'
    };

    const text = mounted ? t(`verification.${status}`, fallbackTexts[status]) : fallbackTexts[status];

    switch (status) {
      case 'verified':
        return {
          icon: (props: any) => <Icon name="CheckCircle" {...props} />,
          text,
          className: 'bg-green-100 text-green-800 border-green-200',
          clickable: false
        };
      case 'pending':
        return {
          icon: (props: any) => <Icon name="Clock" {...props} />,
          text,
          className: 'bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200 cursor-pointer',
          clickable: true
        };
      case 'rejected':
        return {
          icon: (props: any) => <Icon name="AlertCircle" {...props} />,
          text,
          className: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200 cursor-pointer',
          clickable: true
        };
      case 'not_started':
        return {
          icon: (props: any) => <Icon name="Clock" {...props} />,
          text,
          className: 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200 cursor-pointer',
          clickable: true
        };
      default:
        return {
          icon: (props: any) => <Icon name="Clock" {...props} />,
          text: t('verification.pending', 'Pending'),
          className: 'bg-gray-100 text-gray-800 border-gray-200',
          clickable: false
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;
  const isClickable = config.clickable && onClick;

  const handleClick = () => {
    if (isClickable) {
      onClick?.();
    }
  };

  return (
    <div
      className={`
        inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors duration-200
        ${config.className}
        ${className}
      `}
      onClick={handleClick}
      role={isClickable ? 'button' : 'status'}
      tabIndex={isClickable ? 0 : -1}
      onKeyDown={(e) => {
        if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      <Icon size={16} />
      <span>{config.text}</span>
    </div>
  );
}

// Helper function to determine verification status based on user data
export const getVerificationStatus = (user: any): VerificationStatus => {
  if (!user) return 'not_started';

  // Check if user has submitted verification documents
  if (user.verification_status === 'verified') {
    return 'verified';
  } else if (user.verification_status === 'rejected') {
    return 'rejected';
  } else if (user.verification_status === 'pending') {
    return 'pending';
  } else {
    return 'not_started';
  }
};

// Mock verification status for development
export const mockVerificationStatus = (userType: 'worker' | 'bin_owner'): VerificationStatus => {
  // Simulate different states for testing
  const statuses: VerificationStatus[] = ['verified', 'pending', 'not_started', 'rejected'];
  return statuses[Math.floor(Math.random() * statuses.length)];
};