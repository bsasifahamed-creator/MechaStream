/**
 * Project-level environment resolution
 */

import { environmentRegistry } from './environment-registry';

export interface ProjectConfig {
  environment?: string;
  [key: string]: any;
}

/**
 * Resolve environment for a project with fallback hierarchy:
 * 1. Project config
 * 2. User preference (not implemented in this scope)
 * 3. None
 */
export function resolveProjectEnvironment(projectConfig?: ProjectConfig): string | null {
  if (!projectConfig?.environment) {
    return null;
  }

  const envId = projectConfig.environment;
  const env = environmentRegistry.get(envId);

  if (!env) {
    console.warn(`Environment "${envId}" not found, falling back to none`);
    return null;
  }

  if (!environmentRegistry.isAvailable(envId)) {
    console.warn(`Environment "${envId}" not available on this device, falling back to none`);
    return null;
  }

  return envId;
}

/**
 * Load project config from project files
 */
export async function loadProjectConfig(projectName: string): Promise<ProjectConfig | null> {
  try {
    // Try to load .vibe/config.json or similar
    const configPath = `${projectName}/.vibe/config.json`;
    const response = await fetch(`/api/execute-command`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        operation: 'read',
        projectName,
        filePath: configPath
      })
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    if (data.error || !data.content) {
      return null;
    }

    return JSON.parse(data.content);
  } catch (error) {
    console.warn('Failed to load project config:', error);
    return null;
  }
}
