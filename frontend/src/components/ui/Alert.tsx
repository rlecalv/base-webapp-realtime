import React from 'react';
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  XCircleIcon, 
  InformationCircleIcon,
  XMarkIcon 
} from '@heroicons/react/20/solid';
import { cn } from '@/lib/utils';

interface AlertProps {
  type?: 'success' | 'warning' | 'error' | 'info';
  title: string;
  description?: string;
  onClose?: () => void;
  className?: string;
  children?: React.ReactNode;
}

const alertConfig = {
  success: {
    icon: CheckCircleIcon,
    containerClass: 'bg-green-50 dark:bg-green-500/10 dark:outline dark:outline-green-500/15',
    iconClass: 'text-green-400 dark:text-green-300',
    titleClass: 'text-green-800 dark:text-green-100',
    descriptionClass: 'text-green-700 dark:text-green-100/80',
    closeButtonClass: 'text-green-500 hover:text-green-600 dark:text-green-300 dark:hover:text-green-100'
  },
  warning: {
    icon: ExclamationTriangleIcon,
    containerClass: 'bg-yellow-50 dark:bg-yellow-500/10 dark:outline dark:outline-yellow-500/15',
    iconClass: 'text-yellow-400 dark:text-yellow-300',
    titleClass: 'text-yellow-800 dark:text-yellow-100',
    descriptionClass: 'text-yellow-700 dark:text-yellow-100/80',
    closeButtonClass: 'text-yellow-500 hover:text-yellow-600 dark:text-yellow-300 dark:hover:text-yellow-100'
  },
  error: {
    icon: XCircleIcon,
    containerClass: 'bg-red-50 dark:bg-red-500/10 dark:outline dark:outline-red-500/15',
    iconClass: 'text-red-400 dark:text-red-300',
    titleClass: 'text-red-800 dark:text-red-100',
    descriptionClass: 'text-red-700 dark:text-red-100/80',
    closeButtonClass: 'text-red-500 hover:text-red-600 dark:text-red-300 dark:hover:text-red-100'
  },
  info: {
    icon: InformationCircleIcon,
    containerClass: 'bg-blue-50 dark:bg-blue-500/10 dark:outline dark:outline-blue-500/15',
    iconClass: 'text-blue-400 dark:text-blue-300',
    titleClass: 'text-blue-800 dark:text-blue-100',
    descriptionClass: 'text-blue-700 dark:text-blue-100/80',
    closeButtonClass: 'text-blue-500 hover:text-blue-600 dark:text-blue-300 dark:hover:text-blue-100'
  }
};

export function Alert({ 
  type = 'info', 
  title, 
  description, 
  onClose, 
  className, 
  children 
}: AlertProps) {
  const config = alertConfig[type];
  const Icon = config.icon;

  return (
    <div className={cn('rounded-md p-4', config.containerClass, className)}>
      <div className="flex">
        <div className="shrink-0">
          <Icon aria-hidden="true" className={cn('size-5', config.iconClass)} />
        </div>
        <div className="ml-3 flex-1">
          <h3 className={cn('text-sm font-medium', config.titleClass)}>
            {title}
          </h3>
          {(description || children) && (
            <div className={cn('mt-2 text-sm', config.descriptionClass)}>
              {description && <p>{description}</p>}
              {children}
            </div>
          )}
        </div>
        {onClose && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                onClick={onClose}
                className={cn(
                  'inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2',
                  config.closeButtonClass
                )}
              >
                <span className="sr-only">Fermer</span>
                <XMarkIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Composant d'alerte simple sans icône
interface SimpleAlertProps {
  type?: 'success' | 'warning' | 'error' | 'info';
  children: React.ReactNode;
  className?: string;
}

export function SimpleAlert({ type = 'info', children, className }: SimpleAlertProps) {
  const config = alertConfig[type];
  
  return (
    <div className={cn('rounded-md p-4', config.containerClass, className)}>
      <div className={cn('text-sm', config.descriptionClass)}>
        {children}
      </div>
    </div>
  );
}