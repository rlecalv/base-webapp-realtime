'use client';

import React, { useState } from 'react';
import { FormInput } from './FormInput';
import { Button } from './Button';
import { Alert } from './Alert';
import { cn } from '@/lib/utils';

interface LoginFormProps {
  onSubmit: (credentials: { email: string; password: string }) => Promise<boolean>;
  isLoading?: boolean;
  title?: string;
  subtitle?: string;
  logo?: string;
  showForgotPassword?: boolean;
  showSignUp?: boolean;
  onForgotPassword?: () => void;
  onSignUp?: () => void;
  className?: string;
}

export function LoginForm({
  onSubmit,
  isLoading = false,
  title = "Connectez-vous à votre compte",
  subtitle,
  logo,
  showForgotPassword = true,
  showSignUp = true,
  onForgotPassword,
  onSignUp,
  className
}: LoginFormProps) {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [generalError, setGeneralError] = useState('');

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!credentials.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(credentials.email)) {
      newErrors.email = 'Format d\'email invalide';
    }

    if (!credentials.password) {
      newErrors.password = 'Le mot de passe est requis';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');

    if (!validateForm()) {
      return;
    }

    try {
      const success = await onSubmit(credentials);
      if (!success) {
        setGeneralError('Email ou mot de passe incorrect');
      }
    } catch (error) {
      setGeneralError('Une erreur est survenue lors de la connexion');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Effacer l'erreur pour ce champ
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Effacer l'erreur générale
    if (generalError) {
      setGeneralError('');
    }
  };

  return (
    <div className={cn("flex min-h-full flex-col justify-center px-6 py-12 lg:px-8", className)}>
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        {logo && (
          <img
            alt="Logo"
            src={logo}
            className="mx-auto h-10 w-auto"
          />
        )}
        <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900 dark:text-white">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            {subtitle}
          </p>
        )}
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        {generalError && (
          <div className="mb-4">
            <Alert type="error" title="Erreur de connexion" description={generalError} />
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <FormInput
            label="Adresse email"
            name="email"
            type="email"
            value={credentials.email}
            onChange={handleInputChange}
            error={errors.email}
            autoComplete="email"
            required
          />

          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-sm/6 font-medium text-gray-900 dark:text-gray-100">
                Mot de passe
              </label>
              {showForgotPassword && (
                <div className="text-sm">
                  <button
                    type="button"
                    onClick={onForgotPassword}
                    className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                  >
                    Mot de passe oublié ?
                  </button>
                </div>
              )}
            </div>
            <div className="mt-2">
              <FormInput
                name="password"
                type="password"
                value={credentials.password}
                onChange={handleInputChange}
                error={errors.password}
                autoComplete="current-password"
                hideLabel
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Connexion...
              </>
            ) : (
              'Se connecter'
            )}
          </Button>
        </form>

        {showSignUp && (
          <p className="mt-10 text-center text-sm/6 text-gray-500 dark:text-gray-400">
            Pas encore de compte ?{' '}
            <button
              type="button"
              onClick={onSignUp}
              className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              Créer un compte
            </button>
          </p>
        )}
      </div>
    </div>
  );
}