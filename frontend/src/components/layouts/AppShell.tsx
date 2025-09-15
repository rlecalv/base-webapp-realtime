'use client';

import React from 'react';
import { Navbar } from './Navbar';
import { cn } from '@/lib/utils';

interface AppShellProps {
  children: React.ReactNode;
  navbar?: {
    logo?: string;
    logoAlt?: string;
    navigation: Array<{
      name: string;
      href: string;
      current?: boolean;
      onClick?: () => void;
    }>;
    userMenuItems: Array<{
      name: string;
      href?: string;
      onClick?: () => void;
    }>;
    userAvatar?: string;
    userName?: string;
    onNotificationClick?: () => void;
    notificationCount?: number;
  };
  sidebar?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export function AppShell({ 
  children, 
  navbar, 
  sidebar, 
  footer, 
  className 
}: AppShellProps) {
  return (
    <div className={cn("min-h-screen bg-gray-50 dark:bg-gray-900", className)}>
      {/* Navbar */}
      {navbar && (
        <Navbar
          logo={navbar.logo}
          logoAlt={navbar.logoAlt}
          navigation={navbar.navigation}
          userMenuItems={navbar.userMenuItems}
          userAvatar={navbar.userAvatar}
          userName={navbar.userName}
          onNotificationClick={navbar.onNotificationClick}
          notificationCount={navbar.notificationCount}
        />
      )}

      {/* Main layout */}
      <div className="flex">
        {/* Sidebar */}
        {sidebar && (
          <aside className="w-64 min-h-screen bg-white border-r border-gray-200 dark:bg-gray-800 dark:border-gray-700">
            {sidebar}
          </aside>
        )}

        {/* Main content */}
        <main className="flex-1">
          {children}
        </main>
      </div>

      {/* Footer */}
      {footer && (
        <footer className="bg-white border-t border-gray-200 dark:bg-gray-800 dark:border-gray-700">
          {footer}
        </footer>
      )}
    </div>
  );
}

// Composant de layout simple sans sidebar
export function SimpleAppShell({ 
  children, 
  navbar, 
  footer, 
  className 
}: Omit<AppShellProps, 'sidebar'>) {
  return (
    <div className={cn("min-h-screen bg-gray-50 dark:bg-gray-900", className)}>
      {/* Navbar */}
      {navbar && (
        <Navbar
          logo={navbar.logo}
          logoAlt={navbar.logoAlt}
          navigation={navbar.navigation}
          userMenuItems={navbar.userMenuItems}
          userAvatar={navbar.userAvatar}
          userName={navbar.userName}
          onNotificationClick={navbar.onNotificationClick}
          notificationCount={navbar.notificationCount}
        />
      )}

      {/* Main content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      {footer && (
        <footer className="bg-white border-t border-gray-200 dark:bg-gray-800 dark:border-gray-700">
          {footer}
        </footer>
      )}
    </div>
  );
}