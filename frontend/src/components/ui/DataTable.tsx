import React from 'react';
import { cn } from '@/lib/utils';

interface Column<T> {
  key: keyof T;
  header: string;
  render?: (value: any, item: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  title?: string;
  description?: string;
  actionButton?: React.ReactNode;
  onRowAction?: (item: T) => void;
  actionLabel?: string;
  className?: string;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  title,
  description,
  actionButton,
  onRowAction,
  actionLabel = "Edit",
  className
}: DataTableProps<T>) {
  return (
    <div className={cn("px-4 sm:px-6 lg:px-8", className)}>
      {(title || description || actionButton) && (
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            {title && (
              <h1 className="text-base font-semibold text-gray-900 dark:text-white">
                {title}
              </h1>
            )}
            {description && (
              <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                {description}
              </p>
            )}
          </div>
          {actionButton && (
            <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
              {actionButton}
            </div>
          )}
        </div>
      )}
      
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <table className="relative min-w-full divide-y divide-gray-300 dark:divide-white/15">
              <thead>
                <tr>
                  {columns.map((column) => (
                    <th
                      key={String(column.key)}
                      scope="col"
                      className={cn(
                        "py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white",
                        column.className || "px-3"
                      )}
                    >
                      {column.header}
                    </th>
                  ))}
                  {onRowAction && (
                    <th scope="col" className="py-3.5 pr-4 pl-3 sm:pr-0">
                      <span className="sr-only">{actionLabel}</span>
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-white/10">
                {data.map((item, index) => (
                  <tr key={index}>
                    {columns.map((column) => (
                      <td
                        key={String(column.key)}
                        className={cn(
                          "py-4 text-sm whitespace-nowrap",
                          column.className || "px-3 text-gray-500 dark:text-gray-400"
                        )}
                      >
                        {column.render 
                          ? column.render(item[column.key], item)
                          : item[column.key]
                        }
                      </td>
                    ))}
                    {onRowAction && (
                      <td className="py-4 pr-4 pl-3 text-right text-sm font-medium whitespace-nowrap sm:pr-0">
                        <button
                          onClick={() => onRowAction(item)}
                          className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                        >
                          {actionLabel}
                          <span className="sr-only">, {item.name || item.id || index}</span>
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {data.length === 0 && (
        <div className="text-center py-12">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Aucune donnée à afficher
          </p>
        </div>
      )}
    </div>
  );
}