/**
 * Environment plugin registration and management system
 */

import { ComponentType } from 'react';
import { canHandlePerformanceCost } from './capability-detection';

export interface EnvironmentPlugin {
  id: string;
  label: string;
  component: ComponentType<EnvironmentProps>;
  performanceCost: 'low' | 'medium' | 'high';
  description?: string;
}

export interface EnvironmentProps {
  className?: string;
}

class EnvironmentRegistry {
  private environments = new Map<string, EnvironmentPlugin>();
  private lazyComponents = new Map<string, () => Promise<ComponentType<EnvironmentProps>>>();

  /**
   * Register an environment plugin
   */
  register(plugin: EnvironmentPlugin): void {
    if (this.environments.has(plugin.id)) {
      console.warn(`Environment ${plugin.id} already registered, skipping`);
      return;
    }

    this.environments.set(plugin.id, plugin);
  }

  /**
   * Register a lazy-loaded environment plugin
   */
  registerLazy(
    id: string,
    label: string,
    loader: () => Promise<ComponentType<EnvironmentProps>>,
    performanceCost: 'low' | 'medium' | 'high',
    description?: string
  ): void {
    if (this.environments.has(id) || this.lazyComponents.has(id)) {
      console.warn(`Environment ${id} already registered, skipping`);
      return;
    }

    this.lazyComponents.set(id, loader);
    this.environments.set(id, {
      id,
      label,
      component: () => null, // Placeholder, will be loaded lazily
      performanceCost,
      description
    });
  }

  /**
   * Get all registered environments
   */
  getAll(): EnvironmentPlugin[] {
    return Array.from(this.environments.values());
  }

  /**
   * Get environment by ID
   */
  get(id: string): EnvironmentPlugin | null {
    return this.environments.get(id) || null;
  }

  /**
   * Check if environment is available for current device
   */
  isAvailable(id: string): boolean {
    const env = this.environments.get(id);
    return env ? canHandlePerformanceCost(env.performanceCost) : false;
  }

  /**
   * Load lazy component if needed
   */
  async loadComponent(id: string): Promise<ComponentType<EnvironmentProps> | null> {
    const loader = this.lazyComponents.get(id);
    if (!loader) {
      const env = this.environments.get(id);
      return env?.component || null;
    }

    try {
      const component = await loader();
      // Update the registry with the loaded component
      const existing = this.environments.get(id);
      if (existing) {
        existing.component = component;
      }
      return component;
    } catch (error) {
      console.error(`Failed to load environment ${id}:`, error);
      return null;
    }
  }

  /**
   * Get available environments for current device
   */
  getAvailable(): EnvironmentPlugin[] {
    return this.getAll().filter(env => this.isAvailable(env.id));
  }
}

export const environmentRegistry = new EnvironmentRegistry();
