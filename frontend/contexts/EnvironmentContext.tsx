'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { performanceGovernor } from '@/lib/performance-governor';
import { environmentRegistry } from '@/lib/environment-registry';
import { resolveProjectEnvironment, loadProjectConfig } from '@/lib/project-environment';

interface EnvironmentContextValue {
  currentEnvironment: string | null;
  isEnabled: boolean;
  availableEnvironments: string[];
  setEnvironment: (envId: string | null) => void;
  refreshForProject: (projectName: string) => Promise<void>;
}

const EnvironmentContext = createContext<EnvironmentContextValue | null>(null);

interface EnvironmentProviderProps {
  children: ReactNode;
  initialProjectName?: string;
}

export function EnvironmentProvider({ children, initialProjectName }: EnvironmentProviderProps) {
  const [currentEnvironment, setCurrentEnvironment] = useState<string | null>(null);
  const [isEnabled, setIsEnabled] = useState(performanceGovernor.isEnabled);
  const [availableEnvironments, setAvailableEnvironments] = useState<string[]>([]);

  // Update available environments
  useEffect(() => {
    const updateAvailable = () => {
      const available = environmentRegistry.getAvailable().map(env => env.id);
      setAvailableEnvironments(available);
    };

    updateAvailable();
    // Re-check when registry changes (in a real app, you'd have a subscription)
  }, []);

  // Listen to performance governor changes
  useEffect(() => {
    const handleGovernorChange = (enabled: boolean) => {
      setIsEnabled(enabled);
    };

    performanceGovernor.onChange(handleGovernorChange);

    return () => {
      performanceGovernor.offChange(handleGovernorChange);
    };
  }, []);

  // Load initial project environment
  useEffect(() => {
    if (initialProjectName) {
      refreshForProject(initialProjectName);
    }
  }, [initialProjectName]);

  const setEnvironment = (envId: string | null) => {
    if (envId && !availableEnvironments.includes(envId)) {
      console.warn(`Environment ${envId} not available`);
      return;
    }
    setCurrentEnvironment(envId);
  };

  const refreshForProject = async (projectName: string) => {
    try {
      const config = await loadProjectConfig(projectName);
      const resolvedEnv = resolveProjectEnvironment(config ?? undefined);
      setCurrentEnvironment(resolvedEnv);
    } catch (error) {
      console.warn('Failed to refresh project environment:', error);
      setCurrentEnvironment(null);
    }
  };

  const value: EnvironmentContextValue = {
    currentEnvironment,
    isEnabled,
    availableEnvironments,
    setEnvironment,
    refreshForProject
  };

  return (
    <EnvironmentContext.Provider value={value}>
      {children}
    </EnvironmentContext.Provider>
  );
}

export function useEnvironment(): EnvironmentContextValue {
  const context = useContext(EnvironmentContext);
  if (!context) {
    throw new Error('useEnvironment must be used within EnvironmentProvider');
  }
  return context;
}
