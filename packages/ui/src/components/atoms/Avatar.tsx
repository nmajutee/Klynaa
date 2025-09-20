import React from 'react';
import { cn } from '../../utils/cn';

export interface AvatarProps {
  src?: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fallback?: string;
  className?: string;
  name?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = 'Avatar',
  size = 'md',
  fallback,
  className,
  name
}) => {
  const sizes = {
    sm: 'h-6 w-6 text-xs',
    md: 'h-8 w-8 text-sm',
    lg: 'h-12 w-12 text-base',
    xl: 'h-16 w-16 text-lg'
  };

  const baseClasses = 'inline-block rounded-full overflow-hidden bg-gray-100';

  if (src) {
    return (
      <img
        className={cn(baseClasses, sizes[size], className)}
        src={src}
        alt={alt}
      />
    );
  }

  return (
    <div className={cn(baseClasses, sizes[size], 'flex items-center justify-center text-gray-500', className)}>
      {fallback ?
        fallback.charAt(0).toUpperCase() :
        name ?
          name.charAt(0).toUpperCase() :
          alt.charAt(0).toUpperCase()
      }
    </div>
  );
};