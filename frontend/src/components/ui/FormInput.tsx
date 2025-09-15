import React from 'react';
import { cn } from '@/lib/utils';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helpText?: string;
  error?: string;
  hideLabel?: boolean;
}

export const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  ({ className, label, helpText, error, hideLabel = false, id, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div>
        {label && (
          <label 
            htmlFor={inputId} 
            className={cn(
              "block text-sm/6 font-medium text-gray-900 dark:text-white",
              hideLabel && "sr-only"
            )}
          >
            {label}
          </label>
        )}
        <div className={cn(label && !hideLabel && "mt-2")}>
          <input
            id={inputId}
            ref={ref}
            className={cn(
              "block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-indigo-500",
              error && "outline-red-500 focus:outline-red-500 dark:outline-red-500 dark:focus:outline-red-500",
              className
            )}
            aria-describedby={
              helpText || error ? `${inputId}-description` : undefined
            }
            {...props}
          />
        </div>
        {(helpText || error) && (
          <p 
            id={`${inputId}-description`} 
            className={cn(
              "mt-2 text-sm",
              error 
                ? "text-red-600 dark:text-red-400" 
                : "text-gray-500 dark:text-gray-400"
            )}
          >
            {error || helpText}
          </p>
        )}
      </div>
    );
  }
);

FormInput.displayName = 'FormInput';