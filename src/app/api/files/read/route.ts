import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

// Helper function to recursively read directory
function readDirectory(dir: string, relativePath: string = '', files: { [key: string]: string } = {}) {
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const relPath = relativePath ? path.join(relativePath, item) : item;
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      // Skip common directories that shouldn't be shown in the file tree
      if (!['node_modules', '.git', '__pycache__', '.next'].includes(item)) {
        readDirectory(fullPath, relPath, files);
      }
    } else {
      // Read file content
      try {
        const content = fs.readFileSync(fullPath, 'utf-8');
        files[relPath] = content;
      } catch (error) {
        console.warn(`Could not read file ${relPath}:`, error);
        // Still include the file but with empty content
        files[relPath] = '';
      }
    }
  }

  return files;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const projectName = searchParams.get('projectName');
    const singlePath = searchParams.get('path');

    if (!projectName) {
      return NextResponse.json({ error: 'projectName is required' }, { status: 400 });
    }

    const projectDir = path.resolve(process.cwd(), 'projects', projectName);

    if (!fs.existsSync(projectDir)) {
      return NextResponse.json({ error: `Project "${projectName}" not found` }, { status: 404 });
    }

    if (singlePath) {
      const full = path.resolve(projectDir, singlePath.replace(/^\/+/, ''));
      if (!full.startsWith(projectDir) || !fs.existsSync(full) || !fs.statSync(full).isFile()) {
        return NextResponse.json({ error: 'File not found' }, { status: 404 });
      }
      const content = fs.readFileSync(full, 'utf-8');
      return NextResponse.json({ success: true, path: singlePath, content });
    }

    const files = readDirectory(projectDir);

    return NextResponse.json({
      success: true,
      projectName,
      files
    });

  } catch (error) {
    console.error('Read files error:', error);
    return NextResponse.json(
      { error: 'Failed to read files' },
      { status: 500 }
    );
  }
}
