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
    const { projectId, path: filePath, content } = body;

    if (!projectId || !filePath || typeof content !== 'string') {
      return NextResponse.json(
        { error: 'projectId, path, and content are required' },
        { status: 400 }
      );
    }

    const full = resolveProjectPath(projectId, filePath);
    const dir = path.dirname(full);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(full, content, 'utf-8');

    return NextResponse.json({ success: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Failed to save file';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
