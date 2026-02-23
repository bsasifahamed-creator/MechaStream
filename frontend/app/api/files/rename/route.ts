import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

function resolveProjectPath(projectId: string, filePath: string): string {
  const root = path.join(process.cwd(), 'projects', projectId);
  const resolved = path.resolve(root, filePath.replace(/^\/+/, ''));
  if (!resolved.startsWith(root)) {
    throw new Error('Path escapes project directory');
  }
  return resolved;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { projectId, oldPath, newPath } = body;

    if (!projectId || !oldPath || !newPath) {
      return NextResponse.json(
        { error: 'projectId, oldPath, and newPath are required' },
        { status: 400 }
      );
    }

    const oldFull = resolveProjectPath(projectId, oldPath);
    const newFull = resolveProjectPath(projectId, newPath);

    if (!fs.existsSync(oldFull)) {
      return NextResponse.json({ error: 'Source not found' }, { status: 404 });
    }

    const newDir = path.dirname(newFull);
    if (!fs.existsSync(newDir)) {
      fs.mkdirSync(newDir, { recursive: true });
    }

    fs.renameSync(oldFull, newFull);
    return NextResponse.json({ success: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Failed to rename';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
