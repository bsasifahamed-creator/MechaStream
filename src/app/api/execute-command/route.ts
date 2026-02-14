import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface FileOperation {
  operation: 'create' | 'update' | 'delete' | 'add-component' | 'modify' | 'read' | 'list';
  projectName: string;
  filePath: string;
  content?: string;
  componentName?: string;
  componentCode?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { command, projectName, filePath, content, operation, componentName, componentCode } = body;

    if (!projectName) {
      return NextResponse.json({ error: 'Project name is required' }, { status: 400 });
    }

    const projectDir = path.join(process.cwd(), 'projects', projectName);
    
    if (!fs.existsSync(projectDir)) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    let result: any = { success: true, message: '' };

    switch (operation) {
      case 'list': {
        const listFiles = (dir: string): string[] => {
          const files: string[] = [];
          const items = fs.readdirSync(dir);
          for (const item of items) {
            const full = path.join(dir, item);
            if (fs.statSync(full).isDirectory()) {
              files.push(...listFiles(full));
            } else {
              files.push(path.relative(projectDir, full));
            }
          }
          return files;
        };
        result.files = listFiles(projectDir);
        result.message = '✅ Listed project files';
        break;
      }
      case 'read': {
        if (!filePath) {
          return NextResponse.json({ error: 'File path is required' }, { status: 400 });
        }
        const full = path.join(projectDir, filePath);
        if (!fs.existsSync(full)) {
          return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }
        const contentStr = fs.readFileSync(full, 'utf-8');
        result.message = `✅ Read file: ${filePath}`;
        result.content = contentStr;
        break;
      }
      case 'create':
        // Create a new file
        if (!filePath || !content) {
          return NextResponse.json({ error: 'File path and content are required' }, { status: 400 });
        }
        
        const fullPath = path.join(projectDir, filePath);
        const fileDir = path.dirname(fullPath);
        
        if (!fs.existsSync(fileDir)) {
          fs.mkdirSync(fileDir, { recursive: true });
        }
        
        fs.writeFileSync(fullPath, content);
        result.message = `✅ Created file: ${filePath}`;
        break;

      case 'update':
        // Update an existing file
        if (!filePath || !content) {
          return NextResponse.json({ error: 'File path and content are required' }, { status: 400 });
        }
        
        const updatePath = path.join(projectDir, filePath);
        if (!fs.existsSync(updatePath)) {
          return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }
        
        fs.writeFileSync(updatePath, content);
        result.message = `✅ Updated file: ${filePath}`;
        break;

      case 'add-component':
        // Add a React component to an existing file
        if (!filePath || !componentName || !componentCode) {
          return NextResponse.json({ error: 'File path, component name, and component code are required' }, { status: 400 });
        }
        
        const componentPath = path.join(projectDir, filePath);
        if (!fs.existsSync(componentPath)) {
          return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }
        
        let fileContent = fs.readFileSync(componentPath, 'utf-8');
        
        // Add the component code before the last closing tag or at the end
        if (fileContent.includes('</script>')) {
          fileContent = fileContent.replace('</script>', `\n\n// ${componentName} Component\n${componentCode}\n\n</script>`);
        } else {
          fileContent += `\n\n// ${componentName} Component\n${componentCode}`;
        }
        
        fs.writeFileSync(componentPath, fileContent);
        result.message = `✅ Added component "${componentName}" to ${filePath}`;
        break;

      case 'modify':
        // Modify specific parts of a file
        if (!filePath || !content) {
          return NextResponse.json({ error: 'File path and content are required' }, { status: 400 });
        }
        
        const modifyPath = path.join(projectDir, filePath);
        if (!fs.existsSync(modifyPath)) {
          return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }
        
        fs.writeFileSync(modifyPath, content);
        result.message = `✅ Modified file: ${filePath}`;
        break;

      case 'delete':
        // Delete a file
        if (!filePath) {
          return NextResponse.json({ error: 'File path is required' }, { status: 400 });
        }
        
        const deletePath = path.join(projectDir, filePath);
        if (!fs.existsSync(deletePath)) {
          return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }
        
        fs.unlinkSync(deletePath);
        result.message = `✅ Deleted file: ${filePath}`;
        break;

      default:
        return NextResponse.json({ error: 'Invalid operation' }, { status: 400 });
    }

    // Get updated file list
    const getFileList = (dir: string): string[] => {
      const files: string[] = [];
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const relativePath = path.relative(projectDir, fullPath);
        
        if (fs.statSync(fullPath).isDirectory()) {
          files.push(...getFileList(fullPath).map(f => f));
        } else {
          files.push(relativePath);
        }
      }
      
      return files;
    };

    result.files = getFileList(projectDir);
    result.projectName = projectName;

    return NextResponse.json(result);

  } catch (error) {
    console.error('File operation error:', error);
    return NextResponse.json(
      { error: 'Failed to execute file operation' },
      { status: 500 }
    );
  }
}
