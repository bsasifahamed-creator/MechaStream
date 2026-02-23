'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Send, Bot, Paperclip, Mic, Sparkles } from 'lucide-react';
import { AI_Prompt } from './ui/animated-ai-input';

function getPromptFromUrl(): string {
  if (typeof window === 'undefined') return '';
  try {
    return new URLSearchParams(window.location.search).get('prompt')?.trim() || '';
  } catch {
    return '';
  }
}

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  suggestions?: string[];
  shouldGenerateProject?: boolean;
  projectPrompt?: string;
}

interface ConversationalChatbotProps {
  isCodeIDE?: boolean;
  onCodeGenerated?: (code: string, projectName?: string) => void;
  /** Called when a full project was generated (multi-file); IDE can switch to Files and open a file */
  onProjectGenerated?: (projectName: string, firstFilePath?: string) => void;
  onPromptUpdate?: (prompt: string) => void;
  currentProject?: string;
  onChangeApplied?: () => void;
  refreshFiles?: (projectName: string) => void;
  /** When provided (e.g. from homepage), show in chat and get AI response on open */
  initialPrompt?: string;
}

export default function ConversationalChatbot({
  isCodeIDE = false,
  onCodeGenerated,
  onProjectGenerated,
  onPromptUpdate,
  currentProject,
  onChangeApplied,
  refreshFiles,
  initialPrompt,
}: ConversationalChatbotProps) {

  const router = useRouter();
  const promptFromUrl = getPromptFromUrl() || initialPrompt?.trim() || '';
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: isCodeIDE
        ? 'Hello! I\'m your interactive coding assistant. I can help you create, modify, and improve code through conversation. What would you like to work on?'
        : 'Welcome to MechaStream! I\'m here to help you create amazing projects. What would you like to build today?',
      timestamp: new Date(0)
    }
  ]);
  const sentPromptRef = useRef<string | null>(null);

  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId] = useState(() => `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load conversation history when switching between pages (skip when we have prompt from URL)
  useEffect(() => {
    if (getPromptFromUrl() || initialPrompt?.trim()) return;
    const loadConversation = async () => {
      try {
        const response = await fetch(`/api/conversation?conversationId=${conversationId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.messages && data.messages.length > 1) {
            setMessages(data.messages);
          }
        }
      } catch (error) {
        console.error('Error loading conversation:', error);
      }
    };
    loadConversation();
  }, [conversationId, isCodeIDE, initialPrompt]);

  // When opened from Build: show prompt in chat then fetch AI response (read URL so it always works)
  useEffect(() => {
    const prompt = getPromptFromUrl() || initialPrompt?.trim() || '';
    if (!prompt || !isCodeIDE || sentPromptRef.current === prompt) return;
    sentPromptRef.current = prompt;
    setMessages((prev) => {
      if (prev.some((m) => m.role === 'user' && m.content === prompt)) return prev;
      return [...prev, { id: 'build-prompt', role: 'user', content: prompt, timestamp: new Date() }];
    });
    let cancelled = false;
    setIsLoading(true);
    (async () => {
      try {
        const res = await fetch('/api/conversation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: prompt, conversationId, isCodeIDE, projectName: currentProject })
        });
        if (cancelled) return;
        const data = await res.json().catch(() => ({}));
        const reply = typeof data.message === 'string' && data.message.trim()
          ? data.message
          : "I couldn't generate a response. Start Ollama (ollama serve) and try again.";
        setMessages((prev) => [...prev, {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: reply,
          timestamp: new Date(),
          suggestions: data.suggestions,
          shouldGenerateProject: data.shouldGenerateProject,
          projectPrompt: data.projectPrompt
        }]);
        if (data.shouldGenerateProject && data.projectPrompt) {
          try {
            handleProjectGeneration(data.projectPrompt);
          } catch (_) {}
        }
      } catch (e) {
        if (!cancelled) setMessages((prev) => [...prev, { id: `err-${Date.now()}`, role: 'assistant', content: 'Sorry, something went wrong. Try again.', timestamp: new Date() }]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [isCodeIDE, initialPrompt, currentProject, conversationId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (messageText: string, skipAddingUserMessage = false) => {
    if (!messageText || !messageText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date()
    };

    if (!skipAddingUserMessage) setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // In IDE: run code generation in parallel with conversation so code appears even if chat is slow
      const conversationPromise = fetch('/api/conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          conversationId,
          isCodeIDE,
          projectName: currentProject
        })
      });

      let codeGenPromise: Promise<void> | null = null;
      if (isCodeIDE && onCodeGenerated) {
        codeGenPromise = (async () => {
          setMessages(prev => [...prev, {
            id: `code-gen-start-${Date.now()}`,
            role: 'assistant',
            content: '⚙️ Generating code...',
            timestamp: new Date(),
          }]);
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 180000); // 3 min — match server timeout
          try {
            const codeRes = await fetch('/api/ai', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ prompt: messageText.trim(), operation: 'generate', features: [] }),
              signal: controller.signal,
            });
            clearTimeout(timeoutId);
            const codeData = await codeRes.json().catch(() => ({}));
            const code = (codeData.code || '').trim();
            const success = codeData.success !== false;
            const isFilesJson = code.trimStart().startsWith('{"files":');
            // Only treat as "echoed prompt" if it's clearly the same text with no code structure
            const hasCodeStructure = /import\s|export\s|function\s|const\s|=>\s*\{|<\w+|useState|useEffect|return\s*\(/.test(code);
            const looksLikePrompt =
              code.length > 15 &&
              (code === messageText.trim() || code.startsWith(messageText.trim().slice(0, 60))) &&
              !hasCodeStructure;
            if (code && success && !isFilesJson && !looksLikePrompt) {
              onCodeGenerated(code, currentProject || undefined);
              if (refreshFiles && currentProject) refreshFiles(currentProject);
              if (onChangeApplied) onChangeApplied();
              setMessages(prev => [...prev, {
                id: `code-${Date.now()}`,
                role: 'assistant',
                content: '✅ Code generated and applied to the editor.',
                timestamp: new Date(),
              }]);
            } else if (looksLikePrompt) {
              setMessages(prev => [...prev, {
                id: `code-skip-${Date.now()}`,
                role: 'assistant',
                content: '⚠️ No valid code was generated (response looked like your prompt). Try "Create a simple React counter" or ensure Ollama is running (ollama serve) with qwen2.5-coder:7b.',
                timestamp: new Date(),
              }]);
            } else if (codeData.error || !codeRes.ok) {
              setMessages(prev => [...prev, {
                id: `code-err-${Date.now()}`,
                role: 'assistant',
                content: `⚠️ Code generation: ${codeData.error || `HTTP ${codeRes.status}`}. Make sure Ollama is running (ollama serve) and OLLAMA_CODE_MODEL is set (e.g. qwen2.5-coder:7b).`,
                timestamp: new Date(),
              }]);
            } else if (!code && success) {
              setMessages(prev => [...prev, {
                id: `code-empty-${Date.now()}`,
                role: 'assistant',
                content: '⚠️ No code was returned. The model may still be loading—try again in a moment, or use a shorter prompt like "Create a React counter with + and - buttons".',
                timestamp: new Date(),
              }]);
            }
          } catch (e) {
            clearTimeout(timeoutId);
            setMessages(prev => [...prev, {
              id: `code-err-${Date.now()}`,
              role: 'assistant',
              content: `⚠️ Code generation failed: ${e instanceof Error ? e.message : 'network error'}. (Ollama may need 1–2 min for code.)`,
              timestamp: new Date(),
            }]);
          }
        })();
      }

      // Don't block forever on conversation — race with 65s timeout so UI doesn't stay on "Thinking..."
      const CONV_TIMEOUT_MS = 65000;
      let response: Response;
      let data: { message?: string; suggestions?: string[]; shouldGenerateProject?: boolean; projectPrompt?: string | null };
      try {
        response = await Promise.race([
          conversationPromise,
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Conversation timeout')), CONV_TIMEOUT_MS)
          ),
        ]) as Response;
        if (!response.ok) throw new Error('Failed to get response');
        data = await response.json();
      } catch (convErr) {
        const timeoutMsg = convErr instanceof Error && convErr.message === 'Conversation timeout';
        const replyText = timeoutMsg
          ? "Chat is taking longer than expected. Code generation is still running — check the editor in a moment. If nothing appears, ensure Ollama is running (ollama serve) and try again."
          : (convErr instanceof Error ? convErr.message : 'Request failed.');
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: replyText,
          timestamp: new Date(),
        }]);
        if (codeGenPromise) await codeGenPromise;
        return;
      }

      const replyText = typeof data.message === 'string' && data.message.trim()
        ? data.message
        : "I didn't get a response. Try again or make sure Ollama is running (ollama serve).";

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: replyText,
        timestamp: new Date(),
        suggestions: data.suggestions,
        shouldGenerateProject: data.shouldGenerateProject,
        projectPrompt: data.projectPrompt
      }]);

      if (codeGenPromise) {
        await codeGenPromise;
      } else if (data.shouldGenerateProject && data.projectPrompt) {
        await handleProjectGeneration(data.projectPrompt);
      }

    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProjectGeneration = async (projectPrompt: string) => {
    setMessages(prev => [...prev, {
      id: `proj-gen-start-${Date.now()}`,
      role: 'assistant',
      content: '⚙️ Generating code with AI...',
      timestamp: new Date(),
    }]);
    try {
      let files: { path: string; content: string }[] = [];

      // In IDE: prefer single React component from Ollama (operation: 'generate')
      if (isCodeIDE) {
        const aiGenerateResponse = await fetch('/api/ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: projectPrompt, operation: 'generate', features: [] })
        });
        if (aiGenerateResponse.ok) {
          const aiGenerateData = await aiGenerateResponse.json();
          const singleCode = (aiGenerateData.code || '').trim();
          if (singleCode && !singleCode.startsWith('{')) {
            if (onCodeGenerated) onCodeGenerated(singleCode, currentProject || undefined);
            if (refreshFiles && currentProject) refreshFiles(currentProject);
            if (onChangeApplied) onChangeApplied();
            setMessages(prev => [...prev, {
              id: (Date.now() + 1).toString(),
              role: 'assistant',
              content: '✅ Code generated and applied to the editor. Check your active file or App.tsx.',
              timestamp: new Date()
            }]);
            return;
          }
        }
      }

      // Try /api/chat first (returns { files })
      const chatResponse = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: projectPrompt })
      });

      if (chatResponse.ok) {
        const jsonData = await chatResponse.json();
        if (Array.isArray(jsonData.files) && jsonData.files.length > 0) {
          files = jsonData.files;
        }
      }

      // Fallback: use /api/ai (code generation) and parse code response
      if (files.length === 0) {
        const aiResponse = await fetch('/api/ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: projectPrompt, features: [] })
        });
        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          const raw = (aiData.code || '').trim();
          try {
            const start = raw.indexOf('{');
            const end = raw.lastIndexOf('}');
            const jsonStr = start >= 0 && end > start ? raw.slice(start, end + 1) : raw;
            const parsed = JSON.parse(jsonStr);
            if (parsed?.files && Array.isArray(parsed.files)) {
              files = parsed.files.filter((f: { path?: string; content?: string }) => f?.path && typeof f?.content === 'string');
            }
          } catch (_) {}
        }
      }

      if (files.length === 0) {
        throw new Error('No code could be generated. Try again or check that an AI provider (e.g. Ollama) is available.');
      }

      // Write files (when in Code IDE, write to current project)
      const bulkWriteBody: { files: { path: string; content: string }[]; projectName?: string } = { files };
      if (isCodeIDE && currentProject) bulkWriteBody.projectName = currentProject;
      const bulkWriteResponse = await fetch('/api/files/bulk-write', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bulkWriteBody)
      });

      if (!bulkWriteResponse.ok) {
        throw new Error('Failed to write files');
      }

      const projectName = (isCodeIDE && currentProject) ? currentProject : projectPrompt.toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 20);

      // Success message
      const successMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: `✅ Code generated successfully! ${files.length} file(s) written. Refresh the file tree to see them.`,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, successMessage]);

      // Navigate to IDE if on home page (open chatbot by default)
      if (!isCodeIDE) {
        localStorage.setItem("user_prompt", projectPrompt);
        localStorage.setItem("generated_project", projectName);
        localStorage.setItem("generated_code", '');
        localStorage.setItem("generated_files", JSON.stringify(files));
        router.push(`/ide?project=${encodeURIComponent(projectName)}&openChat=1`);
      } else {
        // Refresh files in IDE and switch to code view
        if (refreshFiles) refreshFiles(projectName);
        if (onChangeApplied) onChangeApplied();
        if (onCodeGenerated) onCodeGenerated('', projectName);
        if (onPromptUpdate) onPromptUpdate(projectPrompt);
        const firstPath = files.length > 0 ? files[0].path : undefined;
        if (onProjectGenerated) onProjectGenerated(projectName, firstPath);
      }

    } catch (error) {
      console.error('Project generation error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: 'Failed to generate the project. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input && input.trim() && !isLoading) {
      handleSendMessage(input);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  const formatMessage = (message: Message) => {
    const lines = message.content.split('\n');
    const formattedLines = lines.map((line, index) => {
      if (line.startsWith('📁') || line.startsWith('💻') || line.startsWith('🎯') || line.startsWith('✅')) {
        return <div key={index} className="font-semibold text-mono-accent-blue">{line}</div>;
      }
      if (line.startsWith('  -')) {
        return <div key={index} className="ml-4 text-mono-medium-grey">{line}</div>;
      }
      return <div key={index}>{line}</div>;
    });

    return <div className="space-y-1">{formattedLines}</div>;
  };

  return (
    <div className="flex flex-col h-full bg-mono-black text-mono-white">
      {/* Header */}
      <div className="p-4 border-b border-mono-border-grey bg-mono-sidebar-bg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-mono-accent-blue">
              <Bot size={16} />
            </div>
            <div>
              <h3 className="font-semibold text-mono-white">MechaStream AI</h3>
              <p className="text-sm text-mono-medium-grey">
                {isCodeIDE ? 'Interactive coding assistant' : 'Project creation guide'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {(promptFromUrl || getPromptFromUrl()) && (
        <div className="px-4 py-2 border-b border-mono-border-grey bg-mono-accent-blue/10 text-sm">
          <span className="text-mono-medium-grey">Build prompt:</span>{' '}
          <span className="text-mono-white font-medium">{promptFromUrl || getPromptFromUrl()}</span>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-mono-black">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex items-start space-x-2 max-w-[80%] ${
              message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
            }`}>
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                message.role === 'user'
                  ? 'bg-mono-accent-blue text-mono-white'
                  : 'bg-mono-medium-grey text-mono-white'
              }`}>
                {message.role === 'user' ? '👤' : <Bot size={16} />}
              </div>
              <div className={`rounded-sm px-4 py-2 ${
                message.role === 'user'
                  ? 'bg-mono-accent-blue text-mono-white'
                  : 'bg-mono-sidebar-bg text-mono-white'
              }`}>
                <div className="flex-1">
                  {formatMessage(message)}
                  {message.suggestions && message.suggestions.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {message.suggestions.map((suggestion, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="block w-full text-left p-2 bg-mono-black hover:bg-mono-accent-blue/20 rounded text-xs text-mono-medium-grey hover:text-mono-white transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-mono-sidebar-bg text-mono-white rounded-sm p-3">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-mono-accent-blue border-t-transparent rounded-full animate-spin"></div>
                <span>Thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-mono-border-grey bg-mono-sidebar-bg">
        <AI_Prompt
          onSend={(message, model) => handleSendMessage(message)}
          placeholder={isCodeIDE ? "Ask me anything about your code..." : "Describe what you want to build..."}
          disabled={isLoading}
        />
      </div>
    </div>
  );
}
