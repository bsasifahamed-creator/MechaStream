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
    const { projectId, path: filePath } = body;

    if (!projectId || !filePath) {
      return NextResponse.json(
        { error: 'projectId and path are required' },
        { status: 400 }
      );
    }

    const full = resolveProjectPath(projectId, filePath);
    if (!fs.existsSync(full)) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    fs.rmSync(full, { recursive: true });
    return NextResponse.json({ success: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Failed to delete';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
