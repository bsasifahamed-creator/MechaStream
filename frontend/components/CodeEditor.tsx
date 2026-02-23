'use client';

import React, { useRef, useEffect } from 'react';
import Editor, { Monaco } from '@monaco-editor/react';

interface CodeEditorProps {
  code: string;
  onChange: (code: string | undefined) => void;
  language?: string;
}

const defineMonochromeTheme = (monaco: Monaco) => {
  monaco.editor.defineTheme('monochrome', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'keyword', foreground: '3B82F6' }, // Blue for keywords
      { token: 'string', foreground: '10B981' }, // Green for strings
      { token: 'number', foreground: 'F59E0B' }, // Yellow for numbers
      { token: 'comment', foreground: '6B7280' }, // Medium grey for comments
      { token: 'type', foreground: 'FFFFFF' }, // White for types
      { token: 'variable', foreground: 'FFFFFF' }, // White for variables
      { token: 'function', foreground: 'FFFFFF' }, // White for functions
    ],
    colors: {
      'editor.background': '#1A1A1A', // mono-dark-bg
      'editor.foreground': '#FFFFFF', // mono-white
      'editor.lineHighlightBackground': '#2A2A2A', // subtle blue background for current line
      'editorCursor.foreground': '#FFFFFF', // mono-white
      'editorLineNumber.foreground': '#6B7280', // mono-medium-grey
      'editorLineNumber.activeForeground': '#FFFFFF', // mono-white
      'editor.selectionBackground': '#3B82F640', // blue with transparency
      'editor.inactiveSelectionBackground': '#3B82F620', // blue with less transparency
    },
  });
};

export default function CodeEditor({ code, onChange, language = 'javascript' }: CodeEditorProps) {
  const editorRef = useRef<{ dispose: () => void } | null>(null);

  useEffect(() => {
    return () => {
      if (editorRef.current) {
        try {
          editorRef.current.dispose();
        } catch (_) {
          // ignore if already disposed
        }
        editorRef.current = null;
      }
    };
  }, []);

  const handleEditorDidMount = (editor: any, monaco: Monaco) => {
    editorRef.current = editor;
    defineMonochromeTheme(monaco);
    monaco.editor.setTheme('monochrome');
  };

  return (
    <div className="relative h-full flex flex-col">
      {/* Editor Header */}
      <div className="bg-mono-dark-bg border-b border-mono-border-grey px-4 py-2 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-mono-medium-grey">Language:</span>
          <span className="text-sm text-mono-white font-medium">{language}</span>
        </div>
      </div>

      {/* Code Editor */}
      <div className="flex-1">
        <Editor
          height="100%"
          language={language}
          value={code}
          onChange={onChange}
          onMount={handleEditorDidMount}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            fontFamily: 'JetBrains Mono',
            lineNumbers: 'on',
            roundedSelection: false,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            wordWrap: 'on',
            tabSize: 2,
            insertSpaces: true,
          }}
        />
      </div>
    </div>
  );
}
