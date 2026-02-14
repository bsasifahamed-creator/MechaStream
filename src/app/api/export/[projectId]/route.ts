import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import archiver from 'archiver';

const SKIP = new Set(['node_modules', '.git', '__pycache__', '.next', '.venv', 'venv']);

function* walk(dir: string, root: string): Generator<{ full: string; rel: string }> {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    const rel = path.relative(root, full).split(path.sep).join('/');
    if (e.isDirectory()) {
      if (SKIP.has(e.name)) continue;
      yield* walk(full, root);
    } else {
      yield { full, rel };
    }
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const type = req.nextUrl.searchParams.get('type') || 'zip';
    if (type !== 'zip') {
      return NextResponse.json({ error: 'Only type=zip supported' }, { status: 400 });
    }

    const projectDir = path.join(process.cwd(), 'projects', projectId);
    if (!fs.existsSync(projectDir) || !fs.statSync(projectDir).isDirectory()) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const archive = archiver('zip', { zlib: { level: 9 } });
    const chunks: Buffer[] = [];
    archive.on('data', (c: Buffer) => chunks.push(c));

    await new Promise<void>((resolve, reject) => {
      archive.on('end', resolve);
      archive.on('error', reject);
      for (const { full, rel } of walk(projectDir, projectDir)) {
        archive.file(full, { name: `${projectId}/${rel}` });
      }
      archive.finalize();
    });

    const body = Buffer.concat(chunks);
    return new NextResponse(body, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${projectId}.zip"`,
        'Content-Length': String(body.length),
      },
    });
  } catch (e) {
    console.error('Export error:', e);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}
