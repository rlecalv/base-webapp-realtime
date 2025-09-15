'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  HomeIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  BuildingLibraryIcon,
  BanknotesIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
}

const navigation: NavigationItem[] = [
  {
    name: 'Tableau de Bord',
    href: '/dashboard',
    icon: HomeIcon,
    description: 'Vue d\'ensemble du patrimoine'
  },
  {
    name: 'Actifs Immobiliers',
    href: '/patrimoine',
    icon: BuildingOfficeIcon,
    description: '16 actifs - 2.1M€ revenus'
  },
  {
    name: 'Locataires',
    href: '/locataires',
    icon: UserGroupIcon,
    description: '35 locataires actifs'
  },
  {
    name: 'Sociétés',
    href: '/societes',
    icon: BuildingLibraryIcon,
    description: '12 sociétés propriétaires'
  },
  {
    name: 'Dettes & Financements',
    href: '/dettes',
    icon: BanknotesIcon,
    description: '14 financements - 16.3M€'
  },
  {
    name: 'Rapports',
    href: '/rapports',
    icon: ChartBarIcon,
    description: 'Analyses et exports'
  }
];

interface PatrimoineLayoutProps {
  children: React.ReactNode;
}

export default function PatrimoineLayout({ children }: PatrimoineLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const handleLogout = () => {
    // Logique de déconnexion
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar pour desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gray-900 px-6 pb-4">
          {/* Logo */}
          <div className="flex h-16 shrink-0 items-center">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">📊</span>
              </div>
              <div>
                <h1 className="text-white font-bold text-lg">FINDEV</h1>
                <p className="text-gray-400 text-sm">Patrimoine</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => {
                    const isActive = pathname === item.href || 
                      (item.href !== '/dashboard' && pathname.startsWith(item.href));
                    
                    return (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          className={`group flex gap-x-3 rounded-md p-3 text-sm font-semibold leading-6 transition-colors ${
                            isActive
                              ? 'bg-indigo-700 text-white'
                              : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                          }`}
                        >
                          <item.icon className="h-6 w-6 shrink-0" />
                          <div className="flex-1">
                            <div>{item.name}</div>
                            {item.description && (
                              <div className="text-xs text-gray-400 mt-1">
                                {item.description}
                              </div>
                            )}
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </li>

              {/* Section administration */}
              <li className="mt-auto">
                <div className="text-xs font-semibold leading-6 text-gray-400 mb-2">
                  ADMINISTRATION
                </div>
                <ul role="list" className="-mx-2 space-y-1">
                  <li>
                    <Link
                      href="/admin"
                      className="group flex gap-x-3 rounded-md p-3 text-sm font-semibold leading-6 text-gray-300 hover:bg-gray-800 hover:text-white"
                    >
                      <Cog6ToothIcon className="h-6 w-6 shrink-0" />
                      Paramètres
                    </Link>
                  </li>
                  <li>
                    <button
                      onClick={handleLogout}
                      className="group flex w-full gap-x-3 rounded-md p-3 text-sm font-semibold leading-6 text-gray-300 hover:bg-gray-800 hover:text-white"
                    >
                      <ArrowRightOnRectangleIcon className="h-6 w-6 shrink-0" />
                      Déconnexion
                    </button>
                  </li>
                </ul>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Header mobile */}
      <div className="lg:hidden">
        <div className="flex h-16 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6">
          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
          >
            <span className="sr-only">Ouvrir sidebar</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
          
          <div className="flex flex-1 items-center justify-between">
            <h1 className="text-lg font-semibold text-gray-900">
              📊 FINDEV Patrimoine
            </h1>
            <button
              onClick={handleLogout}
              className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </div>

      {/* Menu mobile overlay */}
      {sidebarOpen && (
        <div className="lg:hidden">
          <div className="fixed inset-0 z-50 flex">
            <div 
              className="fixed inset-0 bg-gray-900/80"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="relative mr-16 flex w-full max-w-xs flex-1">
              <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gray-900 px-6 pb-4">
                <div className="flex h-16 shrink-0 items-center">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-indigo-600 rounded flex items-center justify-center">
                      <span className="text-white font-bold">📊</span>
                    </div>
                    <div>
                      <h1 className="text-white font-bold">FINDEV</h1>
                      <p className="text-gray-400 text-xs">Patrimoine</p>
                    </div>
                  </div>
                </div>
                <nav className="flex flex-1 flex-col">
                  <ul role="list" className="flex flex-1 flex-col gap-y-7">
                    <li>
                      <ul role="list" className="-mx-2 space-y-1">
                        {navigation.map((item) => {
                          const isActive = pathname === item.href || 
                            (item.href !== '/dashboard' && pathname.startsWith(item.href));
                          
                          return (
                            <li key={item.name}>
                              <Link
                                href={item.href}
                                onClick={() => setSidebarOpen(false)}
                                className={`group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 ${
                                  isActive
                                    ? 'bg-indigo-700 text-white'
                                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                                }`}
                              >
                                <item.icon className="h-6 w-6 shrink-0" />
                                {item.name}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contenu principal */}
      <div className="lg:pl-72">
        <main className="py-4">
          {children}
        </main>
      </div>
    </div>
  );
}
