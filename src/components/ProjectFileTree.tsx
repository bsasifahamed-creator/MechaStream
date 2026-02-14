'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Folder, FolderOpen, File, ChevronRight, ChevronDown } from 'lucide-react';

export interface TreeNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: TreeNode[];
}

interface ProjectFileTreeProps {
  projectId: string;
  selectedPath: string | null;
  onSelectFile: (path: string) => void;
  onRefresh?: () => void;
  className?: string;
}

async function fetchTree(projectId: string): Promise<TreeNode[]> {
  const res = await fetch(`/api/files/tree/${encodeURIComponent(projectId)}`);
  if (!res.ok) throw new Error('Failed to load file tree');
  return res.json();
}

export default function ProjectFileTree({
  projectId,
  selectedPath,
  onSelectFile,
  onRefresh,
  className = '',
}: ProjectFileTreeProps) {
  const [tree, setTree] = useState<TreeNode[]>([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    path: string;
    type: 'file' | 'directory';
    x: number;
    y: number;
  } | null>(null);
  const [renaming, setRenaming] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const load = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTree(projectId);
      setTree(data);
      setExpanded((prev) => {
        const next = { ...prev };
        data.forEach((n) => {
          if (n.type === 'directory') next[n.path] = true;
        });
        return next;
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const handleClick = () => {
      setContextMenu(null);
      setRenaming(null);
    };
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  const toggle = (path: string) => {
    setExpanded((prev) => ({ ...prev, [path]: !prev[path] }));
  };

  const handleRename = async (oldPath: string, newName: string) => {
    if (!newName.trim()) {
      setRenaming(null);
      return;
    }
    const segs = oldPath.split('/');
    segs.pop();
    const base = segs.join('/');
    const newPath = base ? `${base}/${newName}` : newName;
    if (newPath === oldPath) {
      setRenaming(null);
      return;
    }
    try {
      const res = await fetch('/api/files/rename', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, oldPath, newPath }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Rename failed');
      if (onRefresh) onRefresh();
      load();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Rename failed');
    }
    setRenaming(null);
  };

  const handleDelete = async (path: string) => {
    if (!confirm('Delete "' + path + '"?')) return;
    try {
      const res = await fetch('/api/files/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, path }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Delete failed');
      if (onRefresh) onRefresh();
      load();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Delete failed');
    }
    setContextMenu(null);
  };

  const startRename = (path: string) => {
    const parts = path.split('/');
    setRenaming(path);
    setRenameValue(parts[parts.length - 1] || '');
    setContextMenu(null);
  };

  const renderNode = (node: TreeNode, depth: number) => {
    const isExpanded = expanded[node.path];
    const isSelected = selectedPath === node.path;
    const isDir = node.type === 'directory';

    if (renaming === node.path) {
      return (
        <div
          key={node.path}
          className="flex items-center py-0.5 pl-2"
          style={{ paddingLeft: 8 + depth * 16 }}
        >
          <input
            type="text"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRename(node.path, renameValue);
              if (e.key === 'Escape') setRenaming(null);
            }}
            onBlur={() => handleRename(node.path, renameValue)}
            className="flex-1 min-w-0 text-xs bg-gray-800 text-white border border-gray-600 rounded px-1 py-0.5"
            autoFocus
          />
        </div>
      );
    }

    return (
      <div key={node.path}>
        <div
          className={
            'group flex items-center gap-1 py-0.5 px-1 rounded cursor-pointer ' +
            (isSelected ? 'bg-blue-600/30 text-white' : 'hover:bg-gray-700/50 text-gray-300')
          }
          style={{ paddingLeft: 8 + depth * 16 }}
          onClick={() => {
            if (isDir) toggle(node.path);
            else onSelectFile(node.path);
          }}
          onContextMenu={(e) => {
            e.preventDefault();
            setContextMenu({
              path: node.path,
              type: node.type,
              x: e.clientX,
              y: e.clientY,
            });
          }}
        >
          {isDir ? (
            <>
              <button
                className="p-0 border-0 bg-transparent cursor-pointer text-current"
                onClick={(e) => {
                  e.stopPropagation();
                  toggle(node.path);
                }}
              >
                {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>
              {isExpanded ? <FolderOpen size={14} /> : <Folder size={14} />}
            </>
          ) : (
            <File size={14} className="flex-shrink-0 ml-5" />
          )}
          <span className="truncate flex-1 text-sm">{node.name}</span>
        </div>
        {isDir && isExpanded && node.children && (
          <div>{node.children.map((c) => renderNode(c, depth + 1))}</div>
        )}
      </div>
    );
  };

  return (
    <div
      className={
        'flex flex-col h-full bg-[#0F0F0F] border-l border-gray-700 overflow-hidden ' + className
      }
    >
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-700">
        <span className="text-sm font-medium text-gray-300">Project</span>
        <button type="button" onClick={() => load()} className="text-xs text-gray-500 hover:text-gray-300">
          Refresh
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-1">
        {loading && <div className="text-sm text-gray-500 p-2">Loading...</div>}
        {error && <div className="text-sm text-red-400 p-2">{error}</div>}
        {!loading && !error && tree.map((n) => renderNode(n, 0))}
      </div>
      {contextMenu && (
        <div
          className="fixed z-50 bg-gray-800 border border-gray-600 rounded shadow-lg py-1 min-w-[120px]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <button
            type="button"
            className="w-full text-left px-3 py-1.5 text-sm text-gray-200 hover:bg-gray-700"
            onClick={() => startRename(contextMenu.path)}
          >
            Rename
          </button>
          <button
            type="button"
            className="w-full text-left px-3 py-1.5 text-sm text-red-400 hover:bg-gray-700"
            onClick={() => handleDelete(contextMenu.path)}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
