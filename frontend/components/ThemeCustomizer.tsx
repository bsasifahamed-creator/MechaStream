import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Palette, 
  Moon, 
  Sun, 
  Sparkles,
  Check,
  Copy,
  Download,
  Eye
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Theme {
  id: string;
  name: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    accent: string;
  };
  gradients: {
    primary: string;
    secondary: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  preview: string;
}

const themes: Theme[] = [
  {
    id: 'modern-blue',
    name: 'Modern Blue',
    description: 'Clean and professional blue theme',
    colors: {
      primary: '#3b82f6',
      secondary: '#1e40af',
      background: '#f8fafc',
      surface: '#ffffff',
      text: '#1e293b',
      accent: '#06b6d4'
    },
    gradients: {
      primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      secondary: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)'
    },
    fonts: {
      heading: 'Inter, sans-serif',
      body: 'Inter, sans-serif'
    },
    preview: 'bg-blue-500'
  },
  {
    id: 'dark-elegant',
    name: 'Dark Elegant',
    description: 'Sophisticated dark theme',
    colors: {
      primary: '#8b5cf6',
      secondary: '#7c3aed',
      background: '#0f172a',
      surface: '#1e293b',
      text: '#f1f5f9',
      accent: '#f59e0b'
    },
    gradients: {
      primary: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
      secondary: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
    },
    fonts: {
      heading: 'Poppins, sans-serif',
      body: 'Inter, sans-serif'
    },
    preview: 'bg-purple-500'
  },
  {
    id: 'nature-green',
    name: 'Nature Green',
    description: 'Fresh and natural green theme',
    colors: {
      primary: '#10b981',
      secondary: '#059669',
      background: '#f0fdf4',
      surface: '#ffffff',
      text: '#064e3b',
      accent: '#f59e0b'
    },
    gradients: {
      primary: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      secondary: 'linear-gradient(135deg, #34d399 0%, #10b981 100%)'
    },
    fonts: {
      heading: 'Montserrat, sans-serif',
      body: 'Inter, sans-serif'
    },
    preview: 'bg-green-500'
  },
  {
    id: 'sunset-orange',
    name: 'Sunset Orange',
    description: 'Warm and energetic orange theme',
    colors: {
      primary: '#f97316',
      secondary: '#ea580c',
      background: '#fff7ed',
      surface: '#ffffff',
      text: '#431407',
      accent: '#8b5cf6'
    },
    gradients: {
      primary: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
      secondary: 'linear-gradient(135deg, #fb923c 0%, #f97316 100%)'
    },
    fonts: {
      heading: 'Roboto, sans-serif',
      body: 'Inter, sans-serif'
    },
    preview: 'bg-orange-500'
  }
];

const ThemeCustomizer: React.FC<{
  onThemeApply: (theme: Theme) => void;
  currentTheme?: Theme;
}> = ({ onThemeApply, currentTheme }) => {
  const [selectedTheme, setSelectedTheme] = useState<Theme>(currentTheme || themes[0]);
  const [customColors, setCustomColors] = useState(selectedTheme.colors);
  const [isCustomizing, setIsCustomizing] = useState(false);

  const handleThemeSelect = (theme: Theme) => {
    setSelectedTheme(theme);
    setCustomColors(theme.colors);
    setIsCustomizing(false);
  };

  const handleApplyTheme = () => {
    const themeToApply = isCustomizing 
      ? { ...selectedTheme, colors: customColors }
      : selectedTheme;
    
    onThemeApply(themeToApply);
    toast.success(`${themeToApply.name} theme applied!`);
  };

  const handleCopyTheme = () => {
    const themeData = {
      ...selectedTheme,
      colors: customColors
    };
    
    navigator.clipboard.writeText(JSON.stringify(themeData, null, 2));
    toast.success('Theme configuration copied to clipboard!');
  };

  const generateThemeCode = (theme: Theme) => {
    return `// Theme: ${theme.name}
const theme = {
  colors: {
    primary: '${theme.colors.primary}',
    secondary: '${theme.colors.secondary}',
    background: '${theme.colors.background}',
    surface: '${theme.colors.surface}',
    text: '${theme.colors.text}',
    accent: '${theme.colors.accent}'
  },
  gradients: {
    primary: '${theme.gradients.primary}',
    secondary: '${theme.gradients.secondary}'
  },
  fonts: {
    heading: '${theme.fonts.heading}',
    body: '${theme.fonts.body}'
  }
};

// Apply theme to your component
const App = () => {
  return React.createElement('div', {
    style: {
      minHeight: '100vh',
      background: theme.gradients.primary,
      fontFamily: theme.fonts.body,
      color: theme.colors.text
    }
  }, [
    // Your app content here
  ]);
};`;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Palette className="w-6 h-6 text-primary-600" />
            <h2 className="text-2xl font-bold text-gray-900">Theme Customizer</h2>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsCustomizing(!isCustomizing)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isCustomizing 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {isCustomizing ? 'Custom Mode' : 'Customize'}
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Theme Selection */}
        <div className="w-1/2 p-6 overflow-y-auto border-r border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Choose a Theme</h3>
          <div className="grid grid-cols-1 gap-4">
            {themes.map((theme) => (
              <motion.div
                key={theme.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedTheme.id === theme.id
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleThemeSelect(theme)}
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900">{theme.name}</h4>
                  {selectedTheme.id === theme.id && (
                    <Check className="w-5 h-5 text-primary-600" />
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-3">{theme.description}</p>
                <div className="flex space-x-2">
                  <div 
                    className="w-6 h-6 rounded-full border border-gray-300"
                    style={{ backgroundColor: theme.colors.primary }}
                  />
                  <div 
                    className="w-6 h-6 rounded-full border border-gray-300"
                    style={{ backgroundColor: theme.colors.secondary }}
                  />
                  <div 
                    className="w-6 h-6 rounded-full border border-gray-300"
                    style={{ backgroundColor: theme.colors.accent }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Theme Preview & Customization */}
        <div className="w-1/2 p-6 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Theme Preview</h3>
            <div className="flex space-x-2">
              <button
                onClick={handleCopyTheme}
                className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-1"
              >
                <Copy className="w-4 h-4" />
                <span>Copy</span>
              </button>
              <button
                onClick={handleApplyTheme}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Apply Theme</span>
              </button>
            </div>
          </div>

          {/* Theme Preview */}
          <div className="mb-6">
            <div 
              className="p-6 rounded-lg border border-gray-200"
              style={{
                background: selectedTheme.gradients.primary,
                fontFamily: selectedTheme.fonts.body
              }}
            >
              <h4 
                className="text-xl font-bold mb-2"
                style={{ 
                  color: selectedTheme.colors.text,
                  fontFamily: selectedTheme.fonts.heading
                }}
              >
                {selectedTheme.name} Preview
              </h4>
              <p 
                className="text-sm mb-4"
                style={{ color: selectedTheme.colors.text }}
              >
                This is how your app will look with the {selectedTheme.name} theme.
              </p>
              <div className="flex space-x-2">
                <button
                  className="px-4 py-2 rounded-lg text-sm font-medium"
                  style={{
                    background: selectedTheme.colors.surface,
                    color: selectedTheme.colors.text
                  }}
                >
                  Primary Button
                </button>
                <button
                  className="px-4 py-2 rounded-lg text-sm font-medium border"
                  style={{
                    background: 'transparent',
                    color: selectedTheme.colors.text,
                    borderColor: selectedTheme.colors.text
                  }}
                >
                  Secondary Button
                </button>
              </div>
            </div>
          </div>

          {/* Color Customization */}
          {isCustomizing && (
            <div className="space-y-4">
              <h4 className="font-semibold">Customize Colors</h4>
              {Object.entries(customColors).map(([key, value]) => (
                <div key={key} className="flex items-center space-x-3">
                  <label className="text-sm font-medium text-gray-700 w-20 capitalize">
                    {key}:
                  </label>
                  <input
                    type="color"
                    value={value}
                    onChange={(e) => setCustomColors(prev => ({
                      ...prev,
                      [key]: e.target.value
                    }))}
                    className="w-12 h-8 rounded border border-gray-300"
                  />
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => setCustomColors(prev => ({
                      ...prev,
                      [key]: e.target.value
                    }))}
                    className="flex-1 px-3 py-1 text-sm border border-gray-300 rounded"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Generated Code */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold">Theme Code</h4>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(generateThemeCode(selectedTheme));
                  toast.success('Theme code copied!');
                }}
                className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              >
                Copy Code
              </button>
            </div>
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm font-mono overflow-x-auto">
              <pre>{generateThemeCode(selectedTheme)}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeCustomizer; 