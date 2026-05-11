import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), '..', 'data');

export async function getApplications() {
  try {
    const filePath = path.join(DATA_DIR, 'applications.md');
    const content = fs.readFileSync(filePath, 'utf8');
    
    const lines = content.split('\n').filter(line => line.trim().startsWith('|'));
    
    // Skip headers and separators
    const dataLines = lines.slice(2);
    
    return dataLines.map(line => {
      const parts = line.split('|').map(p => p.trim());
      const reportContent = parts[8] || '';
      const urlMatch = reportContent.match(/https?:\/\/[^\s)\]]+/);
      
      return {
        id: parts[1],
        date: parts[2],
        company: parts[3],
        role: parts[4],
        score: parts[5],
        status: parts[6],
        pdf: parts[7] === '✅',
        report: parts[8],
        url: urlMatch ? urlMatch[0] : '#'
      };
    }).filter(app => app.company);
  } catch (error) {
    console.error('Error fetching applications:', error);
    return [];
  }
}

export async function getPipeline() {
  try {
    const filePath = path.join(DATA_DIR, 'pipeline.md');
    const content = fs.readFileSync(filePath, 'utf8');
    
    const sections = content.split('## ');
    const pipeline = {
      pending: [],
      processed: []
    };

    sections.forEach(section => {
      if (section.startsWith('Pending')) {
        const lines = section.split('\n').slice(1);
        pipeline.pending = lines
          .filter(line => line.trim().startsWith('- [ ]'))
          .map(line => parsePipelineItem(line));
      } else if (section.startsWith('Processed')) {
        const lines = section.split('\n').slice(1);
        pipeline.processed = lines
          .filter(line => line.trim().startsWith('- [x]'))
          .map(line => parsePipelineItem(line));
      }
    });

    return pipeline;
  } catch (error) {
    console.error('Error fetching pipeline:', error);
    return { pending: [], processed: [] };
  }
}


export async function getEligibleJobs() {
  const apps = await getApplications();
  return apps.filter(app => {
    const score = parseFloat(app.score) || 0;
    const status = (app.status || '').toLowerCase();
    const ineligibleStatuses = ['applied', 'responded', 'interview', 'offer', 'rejected', 'discarded', 'skip'];
    return score >= 3.9 && !ineligibleStatuses.some(s => status.includes(s));
  });
}

function parsePipelineItem(line) {
  // Format: - [ ] URL | Company | Role | Extra...
  const content = line.replace('- [ ] ', '').replace('- [x] ', '');
  const parts = content.split('|').map(p => p.trim());
  return {
    url: parts[0],
    company: parts[1],
    role: parts[2],
    meta: parts.slice(3).join(' | ')
  };
}
