import { exec } from 'child_process';
import { promisify } from 'util';
import { NextResponse } from 'next/server';
import path from 'path';

const execAsync = promisify(exec);

export async function POST() {
  try {
    const rootDir = path.join(process.cwd(), '..');
    // Run scan.mjs from the root directory
    const { stdout, stderr } = await execAsync('node scan.mjs', { cwd: rootDir });
    
    console.log('Scan Output:', stdout);
    if (stderr) console.error('Scan Error:', stderr);
    
    return NextResponse.json({ 
      success: true, 
      output: stdout,
      errors: stderr 
    });
  } catch (error) {
    console.error('Scan API Failure:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
