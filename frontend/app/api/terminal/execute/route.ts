import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const SKIP_DIRS = new Set(['node_modules', '.git', '__pycache__', '.next']);

function resolveDir(projectRoot: string, currentDir: string): string {
  const resolved = path.resolve(projectRoot, currentDir || '.');
  if (!resolved.startsWith(projectRoot)) {
    return projectRoot;
  }
  return resolved;
}

function toProjectRelative(projectRoot: string, fullPath: string): string {
  const rel = path.relative(projectRoot, fullPath);
  return rel ? rel.split(path.sep).join('/') : '';
}

function formatPwd(projectId: string, relativeDir: string): string {
  const segments = ['', 'projects', projectId];
  if (relativeDir) segments.push(relativeDir);
  return '/' + segments.join('/').replace(/\/+/g, '/');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { projectId, command, currentDir = '' } = body;

    if (!projectId || typeof command !== 'string') {
      return NextResponse.json(
        { error: 'projectId and command are required' },
        { status: 400 }
      );
    }

    const projectRoot = path.join(process.cwd(), 'projects', projectId);
    if (!fs.existsSync(projectRoot) || !fs.statSync(projectRoot).isDirectory()) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const cwd = resolveDir(projectRoot, currentDir);
    const parts = command.trim().split(/\s+/);
    const cmd = (parts[0] || '').toLowerCase();
    const arg = parts.slice(1).join(' ').trim();

    let output = '';
    let newDir: string | null = null;

    switch (cmd) {
      case 'pwd': {
        const rel = toProjectRelative(projectRoot, cwd);
        output = formatPwd(projectId, rel);
        break;
      }

      case 'ls':
      case 'dir': {
        const entries = fs.readdirSync(cwd, { withFileTypes: true });
        const names: string[] = [];
        for (const e of entries) {
          if (e.isDirectory() && SKIP_DIRS.has(e.name)) continue;
          names.push(e.isDirectory() ? e.name + '/' : e.name);
        }
        output = names.sort().join('  ');
        break;
      }

      case 'cd': {
        if (!arg || arg === '~') {
          newDir = '';
          output = formatPwd(projectId, '');
          break;
        }
        const target = path.resolve(cwd, arg);
        if (!target.startsWith(projectRoot)) {
          output = `cd: ${arg}: outside project`;
          break;
        }
        if (!fs.existsSync(target)) {
          output = `cd: ${arg}: No such file or directory`;
          break;
        }
        if (!fs.statSync(target).isDirectory()) {
          output = `cd: ${arg}: Not a directory`;
          break;
        }
        newDir = toProjectRelative(projectRoot, target);
        output = formatPwd(projectId, newDir);
        break;
      }

      case 'cat': {
        if (!arg) {
          output = 'cat: missing operand';
          break;
        }
        const filePath = path.resolve(cwd, arg);
        if (!filePath.startsWith(projectRoot)) {
          output = `cat: ${arg}: outside project`;
          break;
        }
        if (!fs.existsSync(filePath)) {
          output = `cat: ${arg}: No such file or directory`;
          break;
        }
        const stat = fs.statSync(filePath);
        if (!stat.isFile()) {
          output = `cat: ${arg}: Is a directory`;
          break;
        }
        output = fs.readFileSync(filePath, 'utf-8');
        break;
      }

      case 'mkdir': {
        if (!arg) {
          output = 'mkdir: missing operand';
          break;
        }
        const dirPath = path.resolve(cwd, arg);
        if (!dirPath.startsWith(projectRoot)) {
          output = `mkdir: ${arg}: outside project`;
          break;
        }
        fs.mkdirSync(dirPath, { recursive: true });
        output = '';
        break;
      }

      case 'touch': {
        if (!arg) {
          output = 'touch: missing operand';
          break;
        }
        const touchPath = path.resolve(cwd, arg);
        if (!touchPath.startsWith(projectRoot)) {
          output = `touch: ${arg}: outside project`;
          break;
        }
        const touchDir = path.dirname(touchPath);
        if (!fs.existsSync(touchDir)) {
          fs.mkdirSync(touchDir, { recursive: true });
        }
        fs.writeFileSync(touchPath, '');
        output = '';
        break;
      }

      case 'rm': {
        if (!arg) {
          output = 'rm: missing operand';
          break;
        }
        const rmPath = path.resolve(cwd, arg);
        if (!rmPath.startsWith(projectRoot)) {
          output = `rm: ${arg}: outside project`;
          break;
        }
        if (!fs.existsSync(rmPath)) {
          output = `rm: ${arg}: No such file or directory`;
          break;
        }
        fs.rmSync(rmPath, { recursive: true });
        output = '';
        break;
      }

      case 'clear':
        output = '';
        break;

      default:
        output = `command not found: ${cmd}. Supported: pwd, ls, cd, cat, mkdir, touch, rm, clear`;
    }

    return NextResponse.json({
      output,
      newDir,
      error: null,
    });
  } catch (e) {
    console.error('Terminal execute error:', e);
    const msg = e instanceof Error ? e.message : 'Command failed';
    return NextResponse.json({ output: '', newDir: null, error: msg }, { status: 500 });
  }
}
