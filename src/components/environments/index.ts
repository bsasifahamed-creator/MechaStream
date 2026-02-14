/**
 * Environment components registry
 */

import { environmentRegistry } from '@/lib/environment-registry';
import CyberneticGridShader from './CyberneticGridShader';

// Register environments
environmentRegistry.register({
  id: 'cybernetic-grid',
  label: 'Cybernetic Grid',
  component: CyberneticGridShader,
  performanceCost: 'medium',
  description: 'Animated grid shader with cybernetic aesthetics'
});

// Export for external use
export { default as CyberneticGridShader } from './CyberneticGridShader';
