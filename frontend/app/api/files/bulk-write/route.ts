import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface FileData {
  path: string;
  content: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { files, projectName } = body;

    if (!Array.isArray(files)) {
      return NextResponse.json({ error: 'Files array is required' }, { status: 400 });
    }

    console.log(`📁 Writing ${files.length} files to filesystem${projectName ? ` for project: ${projectName}` : ''}`);

    // Write each file
    for (const file of files) {
      if (!file.path || typeof file.content !== 'string') {
        console.error('Invalid file data:', file);
        continue;
      }

      // If projectName is provided, create files in projects/{projectName}/ directory
      // Otherwise, use the path as-is (for direct backend/ paths)
      let filePath;
      if (projectName) {
        filePath = path.join(process.cwd(), 'projects', projectName, file.path);
      } else {
        filePath = path.join(process.cwd(), file.path);
      }

      const fileDir = path.dirname(filePath);

      // Create directory if it doesn't exist
      if (!fs.existsSync(fileDir)) {
        fs.mkdirSync(fileDir, { recursive: true });
        console.log(`📁 Created directory: ${fileDir}`);
      }

      // Write file
      fs.writeFileSync(filePath, file.content, 'utf-8');
      console.log(`✅ Wrote file: ${file.path}`);
    }

    return NextResponse.json({
      success: true,
      message: `Successfully wrote ${files.length} files`,
      projectName,
      files: files.map(f => f.path)
    });

  } catch (error) {
    console.error('Bulk write error:', error);
    return NextResponse.json(
      { error: 'Failed to write files' },
      { status: 500 }
    );
  }
}
