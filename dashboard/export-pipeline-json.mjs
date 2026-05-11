#!/usr/bin/env node
import { readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { dirname, join, resolve } from 'path';

const rootDir = process.argv[2] ? resolve(process.argv[2]) : resolve('..');
const candidates = [
  join(rootDir, 'applications.md'),
  join(rootDir, 'data', 'applications.md'),
];

const applicationFile = candidates.find((path) => existsSync(path));
if (!applicationFile) {
  console.error('Error: cannot find applications.md in root or data/.');
  process.exit(1);
}

const raw = await readFile(applicationFile, 'utf-8');
const lines = raw.split(/\r?\n/);
const tableLines = lines.filter((line) => line.trim().startsWith('|'));
if (tableLines.length === 0) {
  console.error('Error: applications.md does not contain a markdown table.');
  process.exit(1);
}

function splitRow(line) {
  return line
    .trim()
    .replace(/^\||\|$/g, '')
    .split('|')
    .map((cell) => cell.trim());
}

const headerIndex = tableLines.findIndex((line) => !/^\|?\s*[-:]+\s*\|/.test(line.replace(/\|/g, '|').trim()));
const header = splitRow(tableLines[headerIndex] || tableLines[0]);
const columns = header.map((cell) => cell.toLowerCase().replace(/[^a-z0-9]+/g, '_'));
const rows = tableLines
  .slice(headerIndex + 2)
  .map(splitRow)
  .filter((cells) => cells.length >= columns.length);

const data = rows.map((cells) => {
  const row = {};
  columns.forEach((key, index) => {
    row[key] = cells[index] || '';
  });
  row.score = (() => {
    const match = (row.score || row.score_raw || '').match(/(\d+\.?\d*)/);
    return match ? Number(match[1]) : null;
  })();
  row.report_path = (() => {
    const report = row.report || row.report_link || '';
    const match = report.match(/\(([^)]+)\)/);
    return match ? match[1] : '';
  })();
  row.report_number = (() => {
    const report = row.report || row.report_link || '';
    const match = report.match(/\[(\d+)\]/);
    return match ? match[1] : '';
  })();
  row.job_url = (() => {
    const candidates = [row.notes || '', row.report || '', row.report_path || ''];
    for (const text of candidates) {
      const match = text.match(/https?:\/\/[^\s)\]]+/);
      if (match) return match[0];
    }
    return '';
  })();
  return row;
});

const outPath = join(dirname(new URL(import.meta.url).pathname), 'pipeline.json');
await writeFile(outPath, JSON.stringify({ source: applicationFile, generated_at: new Date().toISOString(), rows: data }, null, 2), 'utf-8');
console.log(`Generated ${outPath} with ${data.length} pipeline entries.`);
