'use client';

import React from 'react';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { cn } from '@/lib/utils';

interface DropdownItem {
  label: string;
  onClick?: () => void;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
  divider?: boolean;
}

interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  align?: 'left' | 'right';
  className?: string;
}

export function Dropdown({ trigger, items, align = 'right', className }: DropdownProps) {
  return (
    <Menu as="div" className={cn("relative inline-block", className)}>
      <MenuButton className="inline-flex w-full justify-center items-center">
        {trigger}
      </MenuButton>

      <MenuItems
        transition
        className={cn(
          "absolute z-10 mt-2 w-56 origin-top rounded-md bg-white shadow-lg outline-1 outline-black/5 transition data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in dark:bg-gray-800 dark:shadow-none dark:-outline-offset-1 dark:outline-white/10",
          align === 'right' ? 'right-0' : 'left-0'
        )}
      >
        <div className="py-1">
          {items.map((item, index) => (
            <React.Fragment key={index}>
              {item.divider ? (
                <div className="border-t border-gray-100 dark:border-gray-700 my-1" />
              ) : (
                <MenuItem disabled={item.disabled}>
                  {item.href ? (
                    <a
                      href={item.href}
                      className={cn(
                        "flex items-center px-4 py-2 text-sm",
                        item.disabled
                          ? "text-gray-400 cursor-not-allowed"
                          : "text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden dark:text-gray-300 dark:data-focus:bg-white/5 dark:data-focus:text-white"
                      )}
                    >
                      {item.icon && <item.icon className="mr-3 h-4 w-4" />}
                      {item.label}
                    </a>
                  ) : (
                    <button
                      onClick={item.onClick}
                      disabled={item.disabled}
                      className={cn(
                        "flex w-full items-center px-4 py-2 text-left text-sm",
                        item.disabled
                          ? "text-gray-400 cursor-not-allowed"
                          : "text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden dark:text-gray-300 dark:data-focus:bg-white/5 dark:data-focus:text-white"
                      )}
                    >
                      {item.icon && <item.icon className="mr-3 h-4 w-4" />}
                      {item.label}
                    </button>
                  )}
                </MenuItem>
              )}
            </React.Fragment>
          ))}
        </div>
      </MenuItems>
    </Menu>
  );
}

// Composant de dropdown simple avec bouton intégré
interface SimpleDropdownProps {
  label: string;
  items: DropdownItem[];
  align?: 'left' | 'right';
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function SimpleDropdown({ 
  label, 
  items, 
  align = 'right', 
  variant = 'default',
  size = 'md',
  className 
}: SimpleDropdownProps) {
  const buttonClasses = {
    default: 'bg-white text-gray-900 shadow-xs inset-ring-1 inset-ring-gray-300 hover:bg-gray-50 dark:bg-white/10 dark:text-white dark:shadow-none dark:inset-ring-white/5 dark:hover:bg-white/20',
    outline: 'border border-gray-300 bg-transparent hover:bg-gray-50 text-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800',
    ghost: 'hover:bg-gray-100 text-gray-700 dark:hover:bg-gray-800 dark:text-gray-300'
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const trigger = (
    <div className={cn(
      "inline-flex w-full justify-center gap-x-1.5 rounded-md font-semibold",
      buttonClasses[variant],
      sizeClasses[size],
      className
    )}>
      {label}
      <ChevronDownIcon aria-hidden="true" className="-mr-1 size-5 text-gray-400" />
    </div>
  );

  return <Dropdown trigger={trigger} items={items} align={align} />;
}