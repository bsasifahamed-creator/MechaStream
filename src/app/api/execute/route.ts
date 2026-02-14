import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, language: requestedLanguage, prompt, projectName } = body;

    console.log('🎯 Processing request:', { 
      hasCode: !!code, 
      hasPrompt: !!prompt, 
      hasProjectName: !!projectName,
      inputLength: code?.length || prompt?.length || 0 
    });

    // If we have a projectName, run the project from the projects directory
    if (projectName) {
      console.log(`🚀 Running project: ${projectName}`);
      console.log(`📁 Looking for project directory: ${path.join(process.cwd(), 'projects', projectName)}`);

      const projectDir = path.join(process.cwd(), 'projects', projectName);

      if (!fs.existsSync(projectDir)) {
        return NextResponse.json({ 
          error: `Project "${projectName}" not found. Please generate the project first.` 
        }, { status: 404 });
      }

      // Check for backend directory
      const backendDir = path.join(projectDir, 'backend');
      if (fs.existsSync(backendDir)) {
        console.log('🐍 Flask project detected, running from projects directory...');
        try {
          const appPyPath = path.join(backendDir, 'app.py');
          if (!fs.existsSync(appPyPath)) {
            return NextResponse.json({ 
              error: 'Backend app.py not found in project' 
            }, { status: 404 });
          }

          const requirementsPath = path.join(backendDir, 'requirements.txt');
          if (fs.existsSync(requirementsPath)) {
            console.log('📦 Installing Flask dependencies...');
            try {
              await execAsync(`cd "${backendDir}" && pip install -r requirements.txt`);
              console.log('✅ Dependencies installed successfully');
  } catch (error) {
              console.log('⚠️ Dependencies installation warning:', error);
            }
          }

          console.log('🌐 Starting Flask server...');

          // Find a free port between 5000-5010
          const { execSync } = require('child_process');
          const isPortInUse = (p: number) => {
            try {
              const out = execSync(`netstat -an | findstr :${p}`, { stdio: 'pipe' }).toString();
              return out.includes(':'.concat(String(p)));
            } catch (_) {
              return false;
            }
          };

          let port = 5000;
          for (let candidate = 5000; candidate <= 5010; candidate++) {
            if (!isPortInUse(candidate)) {
              port = candidate;
      break;
            }
          }
          console.log(`🔌 Selected port ${port} for Flask`);
          
    const { spawn } = require('child_process');
    
    const flaskProcess = spawn('python', ['app.py'], { 
            cwd: backendDir,
            stdio: ['pipe', 'pipe', 'pipe'],
            env: { ...process.env, FLASK_PORT: port.toString() }
    });
    
    let flaskOutput = '';
    let flaskError = '';
    
    flaskProcess.stdout.on('data', (data: Buffer) => {
      const output = data.toString();
      flaskOutput += output;
            console.log('Flask:', output.trim());
    });
    
    flaskProcess.stderr.on('data', (data: Buffer) => {
      const error = data.toString();
      flaskError += error;
            console.log('Flask Error:', error.trim());
          });

          // Wait for server to start
          await new Promise(resolve => setTimeout(resolve, 5000));

          // Check if Flask server started successfully
          const isRunning = flaskOutput.includes('Running on') || 
                           flaskOutput.includes('Debug mode') || 
                           flaskOutput.includes('* Running on') ||
                           flaskOutput.includes('* Debug mode') ||
                           flaskOutput.includes('Serving Flask app') ||
                           !flaskError.includes('Error') && !flaskError.includes('Traceback');

          if (isRunning) {
          console.log('✅ Flask server started successfully');
            console.log('Flask output:', flaskOutput);
            if (flaskError) console.log('Flask warnings:', flaskError);
            
            // Kill process after 5 minutes to prevent port conflicts
    setTimeout(() => {
      flaskProcess.kill();
      console.log('🔄 Flask server stopped');
            }, 300000);
        
        return NextResponse.json({
          success: true,
              output: `Flask project "${projectName}" running successfully!`,
              serverUrl: `http://localhost:${port}`,
              frontendUrl: `http://localhost:${port}`,
              backendUrl: `http://localhost:${port}`,
              projectType: 'flask',
              message: `Project is running on http://localhost:${port}`
        });
      } else {
            flaskProcess.kill();
            console.error('Flask failed to start. Output:', flaskOutput);
            console.error('Flask errors:', flaskError);
            return NextResponse.json({ 
              error: `Failed to start Flask server. Output: ${flaskOutput}. Errors: ${flaskError}` 
            }, { status: 500 });
          }
        } catch (error) {
          console.error('❌ Flask execution error:', error);
          return NextResponse.json({ 
            error: 'Failed to execute Flask project' 
          }, { status: 500 });
        }
      } else {
        // Check for frontend directory
        const frontendDir = path.join(projectDir, 'frontend');
        if (fs.existsSync(frontendDir)) {
          console.log('🌐 Static frontend project detected...');
          
          // Start a simple HTTP server for the frontend
          const { spawn } = require('child_process');
          const httpServer = spawn('python', ['-m', 'http.server', '3000'], {
            cwd: frontendDir,
            stdio: ['pipe', 'pipe', 'pipe']
          });

          // Wait for server to start
          await new Promise(resolve => setTimeout(resolve, 2000));

          console.log('✅ Static server started successfully');
          
          // Kill process after 5 minutes
          setTimeout(() => { 
            httpServer.kill(); 
            console.log('🔄 Static server stopped'); 
          }, 300000);
      
      return NextResponse.json({
        success: true,
            output: `Static project "${projectName}" running successfully!`,
            serverUrl: 'http://localhost:3000',
            frontendUrl: 'http://localhost:3000',
            backendUrl: null,
            projectType: 'static',
            message: 'Project is running on http://localhost:3000'
          });
        } else {
          return NextResponse.json({ 
            error: 'No backend or frontend directory found in project' 
          }, { status: 400 });
        }
      }
    }

    // If no projectName, return error - we need project-based execution
      return NextResponse.json({
      error: 'No project name provided. Please generate a project first.' 
    }, { status: 400 });
    
  } catch (error) {
    console.error('❌ Execution error:', error);
    return NextResponse.json(
      { error: 'Failed to execute code' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Hybrid execution service running',
    platform: process.platform,
    // Removed piston_api and timeout as they are no longer used
  });
} 