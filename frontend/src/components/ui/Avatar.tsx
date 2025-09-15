import React from 'react';
import { cn } from '@/lib/utils';

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fallbackColor?: 'gray' | 'red' | 'yellow' | 'green' | 'blue' | 'indigo' | 'purple' | 'pink';
}

const sizeClasses = {
  xs: 'h-6 w-6 text-xs',
  sm: 'h-8 w-8 text-sm',
  md: 'h-10 w-10 text-base',
  lg: 'h-12 w-12 text-lg',
  xl: 'h-16 w-16 text-xl'
};

const colorClasses = {
  gray: 'bg-gray-500',
  red: 'bg-red-500',
  yellow: 'bg-yellow-500',
  green: 'bg-green-500',
  blue: 'bg-blue-500',
  indigo: 'bg-indigo-500',
  purple: 'bg-purple-500',
  pink: 'bg-pink-500'
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function Avatar({ 
  src, 
  alt, 
  name, 
  size = 'md', 
  fallbackColor = 'gray',
  className,
  ...props 
}: AvatarProps) {
  const [imageError, setImageError] = React.useState(false);
  
  const displayName = alt || name || '';
  const initials = name ? getInitials(name) : '';

  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center rounded-full',
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {src && !imageError ? (
        <img
          src={src}
          alt={displayName}
          className={cn(
            'rounded-full object-cover',
            sizeClasses[size]
          )}
          onError={() => setImageError(true)}
        />
      ) : (
        <div
          className={cn(
            'flex items-center justify-center rounded-full text-white font-medium',
            sizeClasses[size],
            colorClasses[fallbackColor]
          )}
        >
          {initials || displayName[0]?.toUpperCase() || '?'}
        </div>
      )}
    </div>
  );
}