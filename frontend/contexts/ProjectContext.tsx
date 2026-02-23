'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  codeGenerated?: string;
}

interface ProjectContextType {
  messages: Message[];
  isGenerating: boolean;
  currentCode: string;
  setCurrentCode: (code: string) => void;
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  setIsGenerating: (val: boolean) => void;
  generateCode: (prompt: string) => Promise<void>;
  clearMessages: () => void;
}

const DEFAULT_CODE = `import React from 'react';

export default function App() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <h1 className="text-4xl font-bold text-white">
        Welcome to MechaStream
      </h1>
    </div>
  );
}`;

const ProjectContext = createContext<ProjectContextType | null>(null);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentCode, setCurrentCode] = useState(DEFAULT_CODE);

  const addMessage = useCallback((msg: Omit<Message, 'id' | 'timestamp'>) => {
    setMessages((prev) => [
      ...prev,
      {
        ...msg,
        id: crypto.randomUUID?.() ?? `msg_${Date.now()}`,
        timestamp: Date.now(),
      },
    ]);
  }, []);

  const generateCode = useCallback(async (prompt: string) => {
    setIsGenerating(true);
    addMessage({ role: 'user', content: prompt });

    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          operation: 'generate',
          code: currentCode,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || `API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.code) {
        setCurrentCode(data.code);
        addMessage({
          role: 'assistant',
          content: 'Code generated successfully! Check the editor.',
          codeGenerated: data.code,
        });
      } else if (data.error) {
        addMessage({ role: 'assistant', content: `Error: ${data.error}` });
      } else {
        addMessage({ role: 'assistant', content: data.explanation || 'No code returned.' });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to generate code.';
      addMessage({
        role: 'assistant',
        content: `${message} Make sure Ollama is running (ollama serve) with Qwen3.`,
      });
    } finally {
      setIsGenerating(false);
    }
  }, [currentCode, addMessage]);

  const clearMessages = useCallback(() => setMessages([]), []);

  const value: ProjectContextType = {
    messages,
    isGenerating,
    currentCode,
    setCurrentCode,
    addMessage,
    setIsGenerating,
    generateCode,
    clearMessages,
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within ProjectProvider');
  }
  return context;
}

export function useProjectOptional() {
  return useContext(ProjectContext);
}
