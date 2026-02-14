'use client';

import React from 'react';
import { Folder, File, ChevronRight, ChevronDown } from 'lucide-react';

interface FileSystemProps {
  files: {[key: string]: string};
  selectedFile: string;
  onFileSelect: (fileName: string) => void;
  currentProject?: string;
}

export default function FileSystem({ files, selectedFile, onFileSelect, currentProject }: FileSystemProps) {
  const [expandedFolders, setExpandedFolders] = React.useState<{[key: string]: boolean}>({
    'backend': true,
    'frontend': true
  });

  const toggleFolder = (folderName: string) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderName]: !prev[folderName]
    }));
  };

  // Organize files into folders based on type
  const fileStructure: {[key: string]: {[key: string]: string}} = {};

  Object.keys(files).forEach(fileName => {
    let folder = 'other';
    if (fileName.endsWith('.py') || fileName === 'requirements.txt') {
      folder = 'backend';
    } else if (fileName.endsWith('.html') || fileName.endsWith('.css') || fileName.endsWith('.js')) {
      folder = 'frontend';
    }

    if (!fileStructure[folder]) {
      fileStructure[folder] = {};
    }
    fileStructure[folder][fileName] = files[fileName];
  });

  return (
    <div className="w-64 bg-mono-sidebar-bg border-r border-mono-border-grey overflow-y-auto">
      <div className="p-4 border-b border-mono-border-grey">
        <h3 className="text-sm font-medium text-mono-white">Project Files</h3>
        {currentProject && (
          <p className="text-xs text-mono-medium-grey mt-1">{currentProject}</p>
        )}
      </div>
      
      <div className="p-2">
        {Object.entries(fileStructure).map(([folderName, folderFiles]) => (
          <div key={folderName} className="mb-2">
            <button
              onClick={() => toggleFolder(folderName)}
              className="flex items-center space-x-1 text-sm text-mono-medium-grey hover:text-mono-white w-full p-1 rounded hover:bg-mono-light-grey"
            >
              {expandedFolders[folderName] ? (
                <ChevronDown size={14} />
              ) : (
                <ChevronRight size={14} />
              )}
              <Folder size={14} />
              <span className="capitalize">{folderName}</span>
            </button>
            
            {expandedFolders[folderName] && (
              <div className="ml-6 mt-1 space-y-1">
                {Object.keys(folderFiles).map((fileName) => (
                  <button
                    key={fileName}
                    onClick={() => onFileSelect(fileName)}
                    className={`flex items-center space-x-1 text-xs w-full p-1 rounded transition-colors ${
                      selectedFile === fileName
                        ? 'bg-mono-accent-blue text-mono-white'
                        : 'text-mono-medium-grey hover:text-mono-white hover:bg-mono-light-grey'
                    }`}
                  >
                    <File size={12} />
                    <span>{fileName}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
