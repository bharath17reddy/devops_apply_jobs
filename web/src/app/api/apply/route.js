import { readFile, writeFile } from 'fs/promises';
import { exec } from 'child_process';
import path from 'path';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { id, ids } = await request.json();
    const targetIds = ids || (id ? [id] : []);
    
    if (targetIds.length === 0) {
      return NextResponse.json({ success: true, message: 'No IDs provided' });
    }

    const dataDir = path.join(process.cwd(), '..', 'data');
    const filePath = path.join(dataDir, 'applications.md');
    
    const content = await readFile(filePath, 'utf8');
    const lines = content.split('\n');
    
    const updatedLines = lines.map(line => {
      if (!line.trim().startsWith('|')) return line;
      const parts = line.split('|').map(p => p.trim());
      if (targetIds.includes(parts[1])) {
        // Mark status as Applied
        parts[6] = 'Applied';
        
        // Trigger autonomous agent (async, non-blocking)
        const jobUrlMatch = parts[8].match(/https?:\/\/[^\s)\]]+/);
        const jobUrl = jobUrlMatch ? jobUrlMatch[0] : null;
        if (jobUrl) {
          const agentPath = path.join(process.cwd(), '..', 'apply-agent.mjs');
          exec(`node ${agentPath} "${jobUrl}" "${parts[3]}" "${parts[4]}"`, (err, stdout, stderr) => {
             console.log(`Agent started for ${parts[3]}`);
          });
        }

        // Reconstruct line
        return `| ${parts.slice(1, -1).join(' | ')} |`;
      }
      return line;
    });

    await writeFile(filePath, updatedLines.join('\n'), 'utf8');
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
