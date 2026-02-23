import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const SKIP_DIRS = new Set(['node_modules', '.git', '__pycache__', '.next', '.venv', 'venv']);

interface TreeNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: TreeNode[];
}

function buildTree(dir: string, baseDir: string, relativePrefix: string): TreeNode[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const nodes: TreeNode[] = [];

  for (const e of entries) {
    const rel = relativePrefix ? `${relativePrefix}/${e.name}` : e.name;
    const full = path.join(dir, e.name);

    if (e.isDirectory()) {
      if (SKIP_DIRS.has(e.name)) continue;
      const children = buildTree(full, baseDir, rel);
      nodes.push({ name: e.name, path: rel, type: 'directory', children });
    } else {
      nodes.push({ name: e.name, path: rel, type: 'file' });
    }
  }

  nodes.sort((a, b) => {
    if (a.type !== b.type) return a.type === 'directory' ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
  return nodes;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    if (!projectId) {
      return NextResponse.json({ error: 'projectId required' }, { status: 400 });
    }

    const projectDir = path.resolve(process.cwd(), 'projects', projectId);
    if (!fs.existsSync(projectDir) || !fs.statSync(projectDir).isDirectory()) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const tree = buildTree(projectDir, projectDir, '');
    return NextResponse.json(tree);
  } catch (e) {
    console.error('File tree error:', e);
    return NextResponse.json({ error: 'Failed to list project files' }, { status: 500 });
  }
}
