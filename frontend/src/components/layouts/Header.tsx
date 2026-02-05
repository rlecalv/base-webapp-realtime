'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { 
  HomeIcon,
  CalculatorIcon,
  DocumentTextIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';

export default function Header() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Accueil', href: '/', icon: HomeIcon },
    { name: 'Estimation', href: '/estimation', icon: CalculatorIcon },
    { name: 'Conseils', href: '/conseils', icon: DocumentTextIcon },
    { name: 'Comment ça marche', href: '/#algorithme', icon: DocumentTextIcon },
  ];

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Top">
        <div className="flex w-full items-center justify-between border-b border-gray-200 py-4 lg:border-none">
          <div className="flex items-center">
            <button
              onClick={() => router.push('/')}
              className="flex items-center space-x-2"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center">
                <HomeIcon className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">MonEstimation</span>
            </button>
          </div>
          
          {/* Desktop navigation */}
          <div className="hidden lg:flex lg:items-center lg:space-x-6">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.name}
                  onClick={() => {
                    if (item.href.startsWith('/#')) {
                      const id = item.href.substring(2);
                      router.push('/');
                      setTimeout(() => {
                        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
                      }, 100);
                    } else {
                      router.push(item.href);
                    }
                  }}
                  className="flex items-center space-x-1 text-base font-medium text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </button>
              );
            })}
            <Button
              onClick={() => router.push('/estimation')}
              className="ml-4"
            >
              <CalculatorIcon className="w-5 h-5 mr-2" />
              Estimer mon bien
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100"
            >
              {mobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 py-4">
            <div className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.name}
                    onClick={() => {
                      setMobileMenuOpen(false);
                      if (item.href.startsWith('/#')) {
                        const id = item.href.substring(2);
                        router.push('/');
                        setTimeout(() => {
                          document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
                        }, 100);
                      } else {
                        router.push(item.href);
                      }
                    }}
                    className="flex items-center space-x-2 w-full px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-md"
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </button>
                );
              })}
              <div className="pt-2 px-4">
                <Button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    router.push('/estimation');
                  }}
                  className="w-full"
                >
                  <CalculatorIcon className="w-5 h-5 mr-2" />
                  Estimer mon bien
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}

