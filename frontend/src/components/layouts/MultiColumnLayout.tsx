'use client';

import React, { useState } from 'react';
import { Dialog, DialogBackdrop, DialogPanel, TransitionChild } from '@headlessui/react';
import {
  Bars3Icon,
  CalendarIcon,
  ChartPieIcon,
  DocumentDuplicateIcon,
  FolderIcon,
  HomeIcon,
  UsersIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  current?: boolean;
  onClick?: () => void;
}

interface Team {
  id: number;
  name: string;
  href: string;
  initial: string;
  current?: boolean;
  onClick?: () => void;
}

interface User {
  name: string;
  avatar: string;
  onClick?: () => void;
}

interface MultiColumnLayoutProps {
  navigation: NavigationItem[];
  teams?: Team[];
  user: User;
  logo?: string;
  logoAlt?: string;
  title: string;
  children: React.ReactNode;
  secondaryColumn?: React.ReactNode;
  tertiaryColumn?: React.ReactNode;
  variant?: 'full-width-three' | 'full-width-secondary-right' | 'constrained-three' | 'constrained-sticky' | 'narrow-sidebar' | 'narrow-sidebar-header';
  className?: string;
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export function MultiColumnLayout({
  navigation,
  teams = [],
  user,
  logo,
  logoAlt = "Your Company",
  title,
  children,
  secondaryColumn,
  tertiaryColumn,
  variant = 'full-width-three',
  className
}: MultiColumnLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const sidebarContent = (
    <div className="relative flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-2 dark:bg-gray-900 dark:before:pointer-events-none dark:before:absolute dark:before:inset-0 dark:before:border-r dark:before:border-white/10 dark:before:bg-black/10">
      <div className="relative flex h-16 shrink-0 items-center">
        {logo ? (
          <>
            <img
              alt={logoAlt}
              src={logo}
              className="h-8 w-auto dark:hidden"
            />
            <img
              alt={logoAlt}
              src={logo}
              className="h-8 w-auto not-dark:hidden"
            />
          </>
        ) : (
          <div className="h-8 w-8 bg-indigo-600 rounded flex items-center justify-center">
            <span className="text-white font-bold text-sm">L</span>
          </div>
        )}
      </div>
      <nav className="relative flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" className="-mx-2 space-y-1">
              {navigation.map((item) => (
                <li key={item.name}>
                  <button
                    onClick={item.onClick}
                    className={classNames(
                      item.current
                        ? 'bg-gray-50 text-indigo-600 dark:bg-white/5 dark:text-white'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-indigo-600 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white',
                      'group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold w-full text-left',
                    )}
                  >
                    <item.icon
                      aria-hidden="true"
                      className={classNames(
                        item.current
                          ? 'text-indigo-600 dark:text-white'
                          : 'text-gray-400 group-hover:text-indigo-600 dark:text-gray-500 dark:group-hover:text-white',
                        'size-6 shrink-0',
                      )}
                    />
                    {item.name}
                  </button>
                </li>
              ))}
            </ul>
          </li>
          {teams.length > 0 && (
            <li>
              <div className="text-xs/6 font-semibold text-gray-400 dark:text-gray-500">Vos équipes</div>
              <ul role="list" className="-mx-2 mt-2 space-y-1">
                {teams.map((team) => (
                  <li key={team.name}>
                    <button
                      onClick={team.onClick}
                      className={classNames(
                        team.current
                          ? 'bg-gray-50 text-indigo-600 dark:bg-white/5 dark:text-white'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-indigo-600 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white',
                        'group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold w-full text-left',
                      )}
                    >
                      <span
                        className={classNames(
                          team.current
                            ? 'border-indigo-600 text-indigo-600 dark:border-white/20 dark:text-white'
                            : 'border-gray-200 text-gray-400 group-hover:border-indigo-600 group-hover:text-indigo-600 dark:border-white/10 dark:group-hover:border-white/20 dark:group-hover:text-white',
                          'flex size-6 shrink-0 items-center justify-center rounded-lg border bg-white text-[0.625rem] font-medium dark:bg-white/5',
                        )}
                      >
                        {team.initial}
                      </span>
                      <span className="truncate">{team.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </li>
          )}
          <li className="-mx-6 mt-auto">
            <button
              onClick={user.onClick}
              className="flex items-center gap-x-4 px-6 py-3 text-sm/6 font-semibold text-gray-900 hover:bg-gray-50 dark:text-white dark:hover:bg-white/5 w-full text-left"
            >
              <img
                alt=""
                src={user.avatar}
                className="size-8 rounded-full bg-gray-50 outline -outline-offset-1 outline-black/5 dark:bg-gray-800 dark:outline-white/10"
              />
              <span className="sr-only">Votre profil</span>
              <span aria-hidden="true">{user.name}</span>
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );

  const renderLayout = () => {
    switch (variant) {
      case 'full-width-three':
        return (
          <div className={cn("", className)}>
            {/* Mobile sidebar */}
            <Dialog open={sidebarOpen} onClose={setSidebarOpen} className="relative z-50 lg:hidden">
              <DialogBackdrop
                transition
                className="fixed inset-0 bg-gray-900/80 transition-opacity duration-300 ease-linear data-closed:opacity-0"
              />
              <div className="fixed inset-0 flex">
                <DialogPanel
                  transition
                  className="relative mr-16 flex w-full max-w-xs flex-1 transform transition duration-300 ease-in-out data-closed:-translate-x-full"
                >
                  <TransitionChild>
                    <div className="absolute top-0 left-full flex w-16 justify-center pt-5 duration-300 ease-in-out data-closed:opacity-0">
                      <button type="button" onClick={() => setSidebarOpen(false)} className="-m-2.5 p-2.5">
                        <span className="sr-only">Fermer la sidebar</span>
                        <XMarkIcon aria-hidden="true" className="size-6 text-white" />
                      </button>
                    </div>
                  </TransitionChild>
                  {sidebarContent}
                </DialogPanel>
              </div>
            </Dialog>

            {/* Desktop sidebar */}
            <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
              <div className="relative flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6 dark:border-white/10 dark:bg-gray-900 dark:before:pointer-events-none dark:before:absolute dark:before:inset-0 dark:before:bg-black/10">
                {sidebarContent.props.children}
              </div>
            </div>

            {/* Mobile header */}
            <div className="sticky top-0 z-40 flex items-center gap-x-6 bg-white px-4 py-4 shadow-xs sm:px-6 lg:hidden dark:bg-gray-900 dark:shadow-none dark:before:pointer-events-none dark:before:absolute dark:before:inset-0 dark:before:border-b dark:before:border-white/10 dark:before:bg-black/10">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="relative -m-2.5 p-2.5 text-gray-700 lg:hidden dark:text-gray-400"
              >
                <span className="sr-only">Ouvrir la sidebar</span>
                <Bars3Icon aria-hidden="true" className="size-6" />
              </button>
              <div className="relative flex-1 text-sm/6 font-semibold text-gray-900 dark:text-white">{title}</div>
              <button onClick={user.onClick} className="relative">
                <span className="sr-only">Votre profil</span>
                <img
                  alt=""
                  src={user.avatar}
                  className="size-8 rounded-full bg-gray-50 outline -outline-offset-1 outline-black/5 dark:bg-gray-800 dark:outline-white/10"
                />
              </button>
            </div>

            {/* Main content with three columns */}
            <main className="lg:pl-72">
              <div className="xl:pl-96">
                <div className="px-4 py-10 sm:px-6 lg:px-8 lg:py-6">
                  {children}
                </div>
              </div>
            </main>

            {/* Secondary column */}
            {secondaryColumn && (
              <aside className="fixed inset-y-0 left-72 hidden w-96 overflow-y-auto border-r border-gray-200 px-4 py-6 sm:px-6 lg:px-8 xl:block dark:border-white/10">
                {secondaryColumn}
              </aside>
            )}
          </div>
        );

      case 'constrained-three':
        return (
          <div className={cn("min-h-screen bg-gray-50 dark:bg-gray-900", className)}>
            {/* Mobile sidebar */}
            <Dialog open={sidebarOpen} onClose={setSidebarOpen} className="relative z-50 lg:hidden">
              <DialogBackdrop
                transition
                className="fixed inset-0 bg-gray-900/80 transition-opacity duration-300 ease-linear data-closed:opacity-0"
              />
              <div className="fixed inset-0 flex">
                <DialogPanel
                  transition
                  className="relative mr-16 flex w-full max-w-xs flex-1 transform transition duration-300 ease-in-out data-closed:-translate-x-full"
                >
                  <TransitionChild>
                    <div className="absolute top-0 left-full flex w-16 justify-center pt-5 duration-300 ease-in-out data-closed:opacity-0">
                      <button type="button" onClick={() => setSidebarOpen(false)} className="-m-2.5 p-2.5">
                        <span className="sr-only">Fermer la sidebar</span>
                        <XMarkIcon aria-hidden="true" className="size-6 text-white" />
                      </button>
                    </div>
                  </TransitionChild>
                  {sidebarContent}
                </DialogPanel>
              </div>
            </Dialog>

            {/* Desktop sidebar */}
            <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
              <div className="relative flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6 dark:border-white/10 dark:bg-gray-900">
                {sidebarContent.props.children}
              </div>
            </div>

            {/* Mobile header */}
            <div className="sticky top-0 z-40 flex items-center gap-x-6 bg-white px-4 py-4 shadow-xs sm:px-6 lg:hidden dark:bg-gray-900">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="relative -m-2.5 p-2.5 text-gray-700 lg:hidden dark:text-gray-400"
              >
                <span className="sr-only">Ouvrir la sidebar</span>
                <Bars3Icon aria-hidden="true" className="size-6" />
              </button>
              <div className="relative flex-1 text-sm/6 font-semibold text-gray-900 dark:text-white">{title}</div>
            </div>

            {/* Constrained main area with three columns */}
            <div className="lg:pl-72">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 py-6">
                  {/* Main content */}
                  <div className="lg:col-span-2">
                    <div className="bg-white rounded-lg shadow-sm p-6 dark:bg-gray-800">
                      {children}
                    </div>
                  </div>
                  
                  {/* Secondary column */}
                  {secondaryColumn && (
                    <div className="lg:col-span-1">
                      <div className="bg-white rounded-lg shadow-sm p-6 dark:bg-gray-800">
                        {secondaryColumn}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 'narrow-sidebar':
        return (
          <div className={cn("flex min-h-screen", className)}>
            {/* Narrow sidebar */}
            <div className="hidden lg:flex lg:w-20 lg:flex-col lg:fixed lg:inset-y-0">
              <div className="flex flex-col items-center bg-gray-900 py-4">
                <div className="flex items-center justify-center h-16 w-16">
                  {logo ? (
                    <img src={logo} alt={logoAlt} className="h-8 w-8" />
                  ) : (
                    <div className="h-8 w-8 bg-indigo-600 rounded flex items-center justify-center">
                      <span className="text-white font-bold text-sm">L</span>
                    </div>
                  )}
                </div>
                <nav className="flex-1 flex flex-col items-center space-y-4 mt-8">
                  {navigation.map((item) => (
                    <button
                      key={item.name}
                      onClick={item.onClick}
                      className={classNames(
                        item.current
                          ? 'bg-gray-800 text-white'
                          : 'text-gray-400 hover:bg-gray-800 hover:text-white',
                        'group flex items-center p-2 rounded-md'
                      )}
                    >
                      <item.icon className="h-6 w-6" />
                      <span className="sr-only">{item.name}</span>
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Main content */}
            <div className="lg:pl-20 flex-1">
              <main className="flex-1">
                <div className="px-4 py-6 sm:px-6 lg:px-8">
                  {children}
                </div>
              </main>
            </div>

            {/* Secondary column */}
            {secondaryColumn && (
              <aside className="hidden xl:block xl:w-96 xl:flex-shrink-0">
                <div className="h-full border-l border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
                  <div className="px-6 py-6">
                    {secondaryColumn}
                  </div>
                </div>
              </aside>
            )}
          </div>
        );

      default:
        return renderLayout();
    }
  };

  return renderLayout();
}

// Composants pré-configurés pour différents cas d'usage
export function EmailLayout({ children, secondaryColumn, ...props }: Omit<MultiColumnLayoutProps, 'variant'>) {
  return (
    <MultiColumnLayout
      variant="full-width-three"
      {...props}
    >
      {children}
    </MultiColumnLayout>
  );
}

export function DashboardLayout({ children, secondaryColumn, ...props }: Omit<MultiColumnLayoutProps, 'variant'>) {
  return (
    <MultiColumnLayout
      variant="constrained-three"
      {...props}
    >
      {children}
    </MultiColumnLayout>
  );
}

export function ProjectManagementLayout({ children, secondaryColumn, ...props }: Omit<MultiColumnLayoutProps, 'variant'>) {
  return (
    <MultiColumnLayout
      variant="narrow-sidebar"
      {...props}
    >
      {children}
    </MultiColumnLayout>
  );
}