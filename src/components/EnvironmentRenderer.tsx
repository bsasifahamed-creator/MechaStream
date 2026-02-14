'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useEnvironment } from '@/contexts/EnvironmentContext';
import { environmentRegistry } from '@/lib/environment-registry';

interface EnvironmentRendererProps {
  className?: string;
}

export default function EnvironmentRenderer({ className }: EnvironmentRendererProps) {
  const { currentEnvironment, isEnabled } = useEnvironment();
  const [EnvironmentComponent, setEnvironmentComponent] = useState<React.ComponentType<any> | null>(null);

  useEffect(() => {
    if (!currentEnvironment || !isEnabled) {
      setEnvironmentComponent(null);
      return;
    }

    const loadEnvironment = async () => {
      try {
        const component = await environmentRegistry.loadComponent(currentEnvironment);
        setEnvironmentComponent(() => component);
      } catch (error) {
        console.error('Failed to load environment:', error);
        setEnvironmentComponent(null);
      }
    };

    loadEnvironment();
  }, [currentEnvironment, isEnabled]);

  if (!EnvironmentComponent || !isEnabled) {
    return null;
  }

  return (
    <Suspense fallback={null}>
      <div
        className={className}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: -10,
          pointerEvents: 'none'
        }}
      >
        <EnvironmentComponent />
      </div>
    </Suspense>
  );
}
