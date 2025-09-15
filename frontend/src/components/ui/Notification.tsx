'use client';

import React, { useState, useEffect } from 'react';
import { Transition } from '@headlessui/react';
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  XCircleIcon, 
  InformationCircleIcon 
} from '@heroicons/react/24/outline';
import { XMarkIcon } from '@heroicons/react/20/solid';

interface NotificationProps {
  show: boolean;
  onClose: () => void;
  title: string;
  message?: string;
  type?: 'success' | 'warning' | 'error' | 'info';
  autoClose?: boolean;
  autoCloseDelay?: number;
}

const iconMap = {
  success: CheckCircleIcon,
  warning: ExclamationTriangleIcon,
  error: XCircleIcon,
  info: InformationCircleIcon,
};

const colorMap = {
  success: 'text-green-400',
  warning: 'text-yellow-400',
  error: 'text-red-400',
  info: 'text-blue-400',
};

export function Notification({
  show,
  onClose,
  title,
  message,
  type = 'success',
  autoClose = true,
  autoCloseDelay = 5000,
}: NotificationProps) {
  const [isVisible, setIsVisible] = useState(show);

  useEffect(() => {
    setIsVisible(show);
  }, [show]);

  useEffect(() => {
    if (show && autoClose) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Attendre la fin de l'animation
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [show, autoClose, autoCloseDelay, onClose]);

  const Icon = iconMap[type];

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <div
      aria-live="assertive"
      className="pointer-events-none fixed inset-0 flex items-end px-4 py-6 sm:items-start sm:p-6 z-50"
    >
      <div className="flex w-full flex-col items-center space-y-4 sm:items-end">
        <Transition show={isVisible}>
          <div className="pointer-events-auto w-full max-w-sm rounded-lg bg-white shadow-lg outline-1 outline-black/5 transition data-closed:opacity-0 data-enter:transform data-enter:duration-300 data-enter:ease-out data-closed:data-enter:translate-y-2 data-leave:duration-100 data-leave:ease-in data-closed:data-enter:sm:translate-x-2 data-closed:data-enter:sm:translate-y-0 dark:bg-gray-800 dark:-outline-offset-1 dark:outline-white/10">
            <div className="p-4">
              <div className="flex items-start">
                <div className="shrink-0">
                  <Icon aria-hidden="true" className={`size-6 ${colorMap[type]}`} />
                </div>
                <div className="ml-3 w-0 flex-1 pt-0.5">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {title}
                  </p>
                  {message && (
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {message}
                    </p>
                  )}
                </div>
                <div className="ml-4 flex shrink-0">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="inline-flex rounded-md text-gray-400 hover:text-gray-500 focus:outline-2 focus:outline-offset-2 focus:outline-indigo-600 dark:hover:text-white dark:focus:outline-indigo-500"
                  >
                    <span className="sr-only">Fermer</span>
                    <XMarkIcon aria-hidden="true" className="size-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  );
}

// Hook pour gérer les notifications
export function useNotification() {
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    title: string;
    message?: string;
    type: 'success' | 'warning' | 'error' | 'info';
  }>>([]);

  const addNotification = (notification: Omit<typeof notifications[0], 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, { ...notification, id }]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return {
    notifications,
    addNotification,
    removeNotification,
    success: (title: string, message?: string) => addNotification({ title, message, type: 'success' }),
    warning: (title: string, message?: string) => addNotification({ title, message, type: 'warning' }),
    error: (title: string, message?: string) => addNotification({ title, message, type: 'error' }),
    info: (title: string, message?: string) => addNotification({ title, message, type: 'info' }),
  };
}

// Composant pour afficher toutes les notifications
export function NotificationContainer() {
  const { notifications, removeNotification } = useNotification();

  return (
    <>
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          show={true}
          onClose={() => removeNotification(notification.id)}
          title={notification.title}
          message={notification.message}
          type={notification.type}
        />
      ))}
    </>
  );
}