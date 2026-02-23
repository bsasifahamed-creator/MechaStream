/**
 * Lightweight capability detection for environment rendering
 */

export interface DeviceCapabilities {
  hasWebGL: boolean;
  hasWebGL2: boolean;
  gpuMemoryMB: number;
  deviceMemoryGB: number;
  prefersReducedMotion: boolean;
  isLowEndDevice: boolean;
}

let capabilities: DeviceCapabilities | null = null;

/**
 * Detect device capabilities for environment rendering decisions
 */
export function detectCapabilities(): DeviceCapabilities {
  if (capabilities) return capabilities;

  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  const gl2 = canvas.getContext('webgl2');

  // WebGL detection
  const hasWebGL = !!gl;
  const hasWebGL2 = !!gl2;

  // GPU memory estimation (rough heuristic)
  let gpuMemoryMB = 256; // Default low-end assumption
  if (gl) {
    const webgl = gl as WebGLRenderingContext;
    const debugInfo = webgl.getExtension('WEBGL_debug_renderer_info');
    if (debugInfo) {
      const renderer = webgl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
      // Rough heuristics based on known GPU strings
      if (renderer?.includes('RTX') || renderer?.includes('GTX') || renderer?.includes('Radeon RX')) {
        gpuMemoryMB = 4096;
      } else if (renderer?.includes('GT') || renderer?.includes('Radeon') || renderer?.includes('Iris')) {
        gpuMemoryMB = 2048;
      } else if (renderer?.includes('Intel') || renderer?.includes('UHD')) {
        gpuMemoryMB = 512;
      }
    }
  }

  // Device memory detection
  const deviceMemoryGB = (navigator as any).deviceMemory || 4; // Default to 4GB

  // Motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Low-end device heuristic
  const isLowEndDevice = deviceMemoryGB < 4 || gpuMemoryMB < 1024 || !hasWebGL;

  capabilities = {
    hasWebGL,
    hasWebGL2,
    gpuMemoryMB,
    deviceMemoryGB,
    prefersReducedMotion,
    isLowEndDevice
  };

  return capabilities;
}

/**
 * Check if device can handle a given performance cost
 */
export function canHandlePerformanceCost(cost: 'low' | 'medium' | 'high'): boolean {
  const caps = detectCapabilities();

  if (caps.prefersReducedMotion) return false;
  if (caps.isLowEndDevice) return cost === 'low';

  switch (cost) {
    case 'low': return true;
    case 'medium': return caps.gpuMemoryMB >= 1024 && caps.deviceMemoryGB >= 4;
    case 'high': return caps.gpuMemoryMB >= 2048 && caps.deviceMemoryGB >= 8;
    default: return false;
  }
}
