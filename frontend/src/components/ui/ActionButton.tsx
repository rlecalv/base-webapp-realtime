import { Button } from './Button';

interface ActionButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  className?: string;
}

export function ActionButton({ 
  children, 
  variant = 'outline', 
  size = 'md',
  onClick,
  className = ''
}: ActionButtonProps) {
  const baseClasses = variant === 'primary' 
    ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200'
    : 'border-blue-200 text-blue-700 hover:bg-blue-50';

  return (
    <Button 
      variant={variant}
      size={size}
      onClick={onClick}
      className={`${baseClasses} ${className}`}
    >
      <div className={`${variant === 'primary' ? 'bg-white' : 'bg-blue-500'} rounded-sm opacity-90 mr-2 ${
        size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'
      }`}></div>
      {children}
    </Button>
  );
}
