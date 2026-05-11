#!/usr/bin/env node
import { readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { execFile } from 'child_process';
import { dirname, join, resolve } from 'path';

const args = process.argv.slice(2);
const markApplied = args.includes('--mark');
const openUrls = args.includes('--open');
const root = args.find((arg) => !arg.startsWith('--')) || '.';
const basePath = resolve(root);
const candidates = [join(basePath, 'applications.md'), join(basePath, 'data', 'applications.md')];
const filePath = candidates.find((path) => existsSync(path));
if (!filePath) {
  console.error('Error: cannot find applications.md in root or data/.');
  process.exit(1);
}

const raw = await readFile(filePath, 'utf-8');
const lines = raw.split(/\r?\n/);
const rows = [];
let header = [];
for (const line of lines) {
  if (!line.trim().startsWith('|')) continue;
  const cells = line.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
  if (cells.every((cell) => /^[-\s:]+$/.test(cell))) continue;
  if (header.length === 0) {
    header = cells.map((c) => c.toLowerCase().replace(/[^a-z0-9]+/g, '_'));
    continue;
  }
  if (cells.length < header.length) continue;
  const row = {};
  header.forEach((key, index) => {
    row[key] = cells[index] || '';
  });
  row.score = (() => {
    const match = (row.score || '').match(/(\d+\.?\d*)/);
    return match ? Number(match[1]) : null;
  })();
  row.report_path = (() => {
    const report = row.report || '';
    const match = report.match(/\(([^)]+)\)/);
    return match ? match[1] : '';
  })();
  row.job_url = (() => {
    const text = [row.notes || '', row.report || ''].join(' ');
    const match = text.match(/https?:\/\/[^\s)\]]+/);
    return match ? match[0] : '';
  })();
  rows.push(row);
}

const eligible = rows.filter((app) => {
  const score = app.score || 0;
  const status = (app.status || '').toLowerCase();
  return score >= 3.9 && !['applied', 'responded', 'interview', 'offer', 'rejected', 'discarded', 'skip'].some((s) => status.includes(s));
});

if (eligible.length === 0) {
  console.log('No eligible jobs with score >= 3.9 found.');
  process.exit(0);
}

console.log(`Found ${eligible.length} eligible job(s) with score >= 3.9:`);
eligible.forEach((app, index) => {
  console.log(`${index + 1}. ${app.company || '<unknown>'} — ${app.role || '<unknown>'} — score ${app.score || 'N/A'} — status: ${app.status || 'N/A'}`);
  if (app.job_url) console.log(`   URL: ${app.job_url}`);
});

if (markApplied) {
  const updatedLines = lines.map((line) => {
    if (!line.trim().startsWith('|')) return line;
    const cells = line.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
    if (cells.length < header.length) return line;
    const row = {};
    header.forEach((key, index) => { row[key] = cells[index] || ''; });
    const score = (() => {
      const match = (row.score || '').match(/(\d+\.?\d*)/);
      return match ? Number(match[1]) : 0;
    })();
    const status = (row.status || '').toLowerCase();
    const shouldMark = score >= 3.9 && !['applied', 'responded', 'interview', 'offer', 'rejected', 'discarded', 'skip'].some((s) => status.includes(s));
    if (!shouldMark) return line;

    const newCells = cells.map((cell, index) => {
      const key = header[index];
      if (key === 'status') return 'Applied';
      return cell;
    });
    return `| ${newCells.join(' | ')} |`;
  });
  await writeFile(filePath, updatedLines.join('\n'), 'utf-8');
  console.log(`Updated ${filePath} and marked ${eligible.length} item(s) as Applied.`);
}

if (openUrls) {
  for (const app of eligible) {
    const url = app.job_url;
    if (!url) continue;
    console.log(`Opening ${url}`);
    const command = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'cmd' : 'xdg-open';
    const args = process.platform === 'win32' ? ['/c', 'start', '', url] : [url];
    execFile(command, args, (err) => {
      if (err) console.error(`Failed to open ${url}:`, err.message);
    });
  }
}
