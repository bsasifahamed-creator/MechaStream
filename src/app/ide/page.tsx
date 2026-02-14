'use client';

import React, { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Folder, MessageCircle } from 'lucide-react';
import ProjectFileTree from '@/components/ProjectFileTree';
import IDETerminal from '@/components/IDETerminal';
import ConversationalChatbot from '@/components/ConversationalChatbot';

const CodeEditor = dynamic(() => import('@/components/CodeEditor'), {
  ssr: false,
  loading: () => <div className="h-full flex items-center justify-center bg-[#1A1A1A] text-gray-500">Loading editor…</div>,
});

function langFromPath(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase() || '';
  const map: Record<string, string> = {
    ts: 'typescript', tsx: 'typescript', js: 'javascript', jsx: 'javascript',
    py: 'python', css: 'css', html: 'html', json: 'json', md: 'markdown',
    cs: 'csharp', csx: 'csharp', vb: 'vb',  // C# / .NET
  };
  return map[ext] || 'plaintext';
}

function IDEPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get('project') || '';
  const initialPrompt = searchParams.get('prompt') || '';
  const openChat = searchParams.get('openChat') === '1';
  const fromBuild = Boolean(initialPrompt?.trim());

  const [projectName, setProjectName] = useState(projectId);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [openFiles, setOpenFiles] = useState<{ path: string; content: string }[]>([]);
  const [fileContents, setFileContents] = useState<Record<string, string>>({});
  const [treeKey, setTreeKey] = useState(0);
  const [runLoading, setRunLoading] = useState(false);
  const [sidebarView, setSidebarView] = useState<'files' | 'chat'>((openChat || fromBuild) ? 'chat' : 'files');
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activePath = openFiles.length ? openFiles[openFiles.length - 1].path : null;
  const activeContent = activePath ? (fileContents[activePath] ?? '') : '';

  const refreshTree = useCallback(() => {
    setTreeKey((k) => k + 1);
  }, []);

  const loadFile = useCallback(
    async (path: string) => {
      if (!projectId) return;
      if (fileContents[path] !== undefined) {
        setOpenFiles((prev) => {
          const exist = prev.filter((f) => f.path !== path);
          return [...exist, { path, content: fileContents[path] }];
        });
        setSelectedPath(path);
        return;
      }
      try {
        const res = await fetch(
          `/api/files/read?projectName=${encodeURIComponent(projectId)}&path=${encodeURIComponent(path)}`
        );
        if (!res.ok) throw new Error('Failed to load file');
        const data = await res.json();
        const content = data.content ?? '';
        setFileContents((c) => ({ ...c, [path]: content }));
        setOpenFiles((prev) => {
          const exist = prev.filter((f) => f.path !== path);
          return [...exist, { path, content }];
        });
        setSelectedPath(path);
      } catch (e) {
        console.error(e);
      }
    },
    [projectId, fileContents]
  );

  const closeTab = (path: string) => {
    const next = openFiles.filter((f) => f.path !== path);
    setOpenFiles(next);
    setSelectedPath(next.length ? next[next.length - 1].path : null);
  };

  const handleEditorChange = (value: string | undefined) => {
    if (!activePath) return;
    const v = value ?? '';
    setFileContents((c) => ({ ...c, [activePath]: v }));

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    const pathToSave = activePath;
    const contentToSave = v;
    saveTimeoutRef.current = setTimeout(async () => {
      if (!projectId) return;
      try {
        await fetch('/api/files/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ projectId, path: pathToSave, content: contentToSave }),
        });
      } catch (e) {
        console.error('Save failed', e);
      }
      saveTimeoutRef.current = null;
    }, 600);
  };

  const handleRun = async () => {
    if (!projectId || runLoading) return;
    setRunLoading(true);
    try {
      const res = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectName: projectId, language: 'python' }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Run failed');
      const frontend = data.frontendUrl || data.serverUrl;
      const backend = data.backendUrl || data.serverUrl;
      const url = `/simulation?project=${encodeURIComponent(projectId)}&frontend=${encodeURIComponent(frontend || '')}&backend=${encodeURIComponent(backend || '')}`;
      router.push(url);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Run failed');
    } finally {
      setRunLoading(false);
    }
  };

  useEffect(() => {
    if (!projectId) return;
    const stored = localStorage.getItem(`ide-project-name-${projectId}`);
    setProjectName(stored && stored.trim() ? stored : projectId);
  }, [projectId]);

  // Refetch file tree so newly generated files appear (longer delay when coming from Build)
  useEffect(() => {
    if (!projectId) return;
    const delay = fromBuild ? 800 : 400;
    const t1 = setTimeout(() => setTreeKey((k) => k + 1), delay);
    const t2 = fromBuild ? setTimeout(() => setTreeKey((k) => k + 1), 1600) : undefined;
    return () => {
      clearTimeout(t1);
      if (t2) clearTimeout(t2);
    };
  }, [projectId, fromBuild]);

  // When coming from Build, open first generated file so user sees code
  const fromBuildOpenedRef = useRef(false);
  useEffect(() => {
    if (!projectId || !fromBuild || fromBuildOpenedRef.current) return;
    fromBuildOpenedRef.current = true;
    const t = setTimeout(() => loadFile('backend/app.py'), 1200);
    return () => clearTimeout(t);
  }, [projectId, fromBuild, loadFile]);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, []);

  if (!projectId) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#0F0F0F] text-gray-400">
        <p>No project selected.</p>
        <Link href="/" className="mt-4 text-blue-400 hover:underline">
          Create a project from the home page
        </Link>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#0F0F0F]">
      <header className="h-14 flex-shrink-0 border-b border-gray-700 flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <input
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            onBlur={() => {
              if (projectName.trim() && projectName !== projectId) {
                localStorage.setItem(`ide-project-name-${projectId}`, projectName.trim());
              }
            }}
            className="text-xl font-bold bg-transparent border-none outline-none text-white w-64"
            placeholder="Project name"
          />
          <span className="text-xs text-gray-500" title="New build: prompt in chat + auto-open file">v2</span>
          <Link href="/" className="text-sm text-gray-400 hover:text-white">
            Home
          </Link>
          <Link href={`/export?project=${encodeURIComponent(projectId)}`} className="text-sm text-gray-400 hover:text-white">
            Export
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setSidebarView('files')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                sidebarView === 'files'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              <Folder size={16} />
              Files
            </button>
            <button
              onClick={() => setSidebarView('chat')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                sidebarView === 'chat'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              <MessageCircle size={16} />
              Chat
            </button>
          </div>
          <button
            onClick={handleRun}
            disabled={runLoading}
            className="px-4 py-2 rounded-sm bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50 flex items-center gap-2"
          >
            {runLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Running…
              </>
            ) : (
              <>Run</>
            )}
          </button>
        </div>
      </header>

      <div className="flex-1 flex min-h-0">
        {/* Left column: editor + terminal stacked */}
        <div className="flex-1 flex flex-col min-w-0 border-r border-gray-700">
          {/* Editor tabs */}
          <div className="flex items-center gap-1 px-2 py-1 border-b border-gray-700 bg-[#1A1A1A] overflow-x-auto">
            {openFiles.map((f) => (
              <div
                key={f.path}
                className={
                  'flex items-center gap-1 px-2 py-1 rounded-t text-sm ' +
                  (selectedPath === f.path ? 'bg-[#0F0F0F] text-white' : 'text-gray-400 hover:text-gray-200')
                }
              >
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPath(f.path);
                    setOpenFiles((prev) => {
                      const idx = prev.findIndex((x) => x.path === f.path);
                      if (idx < 0) return prev;
                      const next = [...prev];
                      const [t] = next.splice(idx, 1);
                      next.push(t);
                      return next;
                    });
                  }}
                  className="truncate max-w-[140px]"
                >
                  {f.path.split('/').pop()}
                </button>
                <button
                  type="button"
                  onClick={() => closeTab(f.path)}
                  className="text-gray-500 hover:text-white"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          {/* Editor body */}
          <div className="flex-1 min-h-0">
            {activePath ? (
              <CodeEditor
                code={activeContent}
                onChange={handleEditorChange}
                language={langFromPath(activePath)}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                Open a file from the project tree
              </div>
            )}
          </div>

          {/* Narrow terminal only under editor */}
          <div className="h-44 flex-shrink-0 border-t border-gray-700 bg-[#0F0F0F]">
            <IDETerminal projectId={projectId} onRefreshTree={refreshTree} />
          </div>
        </div>

        {/* Right column: files/chat sidebar spanning full height */}
        <div className="w-80 flex-shrink-0 flex flex-col min-h-0">
          {sidebarView === 'files' ? (
            <ProjectFileTree
              key={treeKey}
              projectId={projectId}
              selectedPath={selectedPath}
              onSelectFile={loadFile}
              onRefresh={refreshTree}
            />
          ) : (
            <ConversationalChatbot
              isCodeIDE={true}
              currentProject={projectId}
              initialPrompt={initialPrompt}
              onCodeGenerated={(code, projectName) => {
                console.log('Code generated:', code, projectName);
              }}
              onPromptUpdate={(prompt) => {
                console.log('Prompt updated:', prompt);
              }}
              onChangeApplied={() => {
                refreshTree();
              }}
              refreshFiles={(projectName) => {
                if (projectName === projectId) {
                  refreshTree();
                }
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default function IDEPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen flex items-center justify-center bg-[#0F0F0F] text-gray-400">
          Loading…
        </div>
      }
    >
      <IDEPageContent />
    </Suspense>
  );
}
