#!/usr/bin/env node
import { chromium } from 'playwright';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import yaml from 'js-yaml';
import nodemailer from 'nodemailer';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '.env') });

const profile = yaml.load(readFileSync(join(__dirname, 'config', 'profile.yml'), 'utf-8'));
const { candidate } = profile;

async function sendNotification(company, role, success, error = null) {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const to = process.env.MAIL_TO || candidate.email;

  if (!host || !user || !pass || !to) {
    console.log('Email config missing, skipping notification.');
    return;
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  const subject = success 
    ? `🚀 Applied Successfully: ${role} @ ${company}`
    : `❌ Application Failed: ${role} @ ${company}`;

  const text = success
    ? `Your autonomous agent successfully applied for the ${role} position at ${company}.`
    : `An error occurred while applying for ${role} at ${company}:\n\n${error}`;

  await transporter.sendMail({
    from: process.env.MAIL_FROM || to,
    to,
    subject,
    text,
  });
}

async function applyGreenhouse(page, url) {
  console.log(`Navigating to ${url}...`);
  await page.goto(url, { waitUntil: 'networkidle' });
  
  // If we're on the job description page, we might need to click "Apply"
  const applyButton = await page.$('a[href*="#app"], #apply_button, .apply-button');
  if (applyButton) {
    console.log('Clicking Apply button...');
    await applyButton.click();
    await page.waitForTimeout(2000);
  }

  console.log('Filling application form...');
  
  // Wait for the form to be visible
  try {
    await page.waitForSelector('#first_name', { timeout: 10000 });
  } catch (e) {
    throw new Error('Could not find the application form. Please ensure the URL leads directly to a Greenhouse application or contains an "Apply" button.');
  }
  
  // Basic info
  await page.fill('#first_name', candidate.full_name.split(' ')[0]);
  await page.fill('#last_name', candidate.full_name.split(' ').slice(1).join(' '));
  await page.fill('#email', candidate.email);
  await page.fill('#phone', candidate.phone);
  
  // LinkedIn - handle multiple possible selectors
  const linkedinSelectors = ['input[name*="linkedin"]', 'input[label*="LinkedIn"]', '#job_application_answers_attributes_0_text_value'];
  for (const selector of linkedinSelectors) {
    if (await page.$(selector)) {
      await page.fill(selector, candidate.linkedin);
      break;
    }
  }

  // Resume upload
  const resumeInput = await page.$('input[type="file"][name*="resume"]');
  if (resumeInput) {
     const cvPath = join(__dirname, 'cv.pdf');
     if (existsSync(cvPath)) {
        console.log('Uploading CV...');
        await resumeInput.setInputFiles(cvPath);
     } else {
        console.warn('cv.pdf not found in root. Skipping resume upload.');
     }
  }

  // Submit
  if (process.env.LIVE_APPLY === 'true') {
    await page.click('#submit_app');
    console.log('Application submitted successfully.');
  } else {
    console.log('Dry run: Submission skipped. Set LIVE_APPLY=true to enable.');
  }
}

async function main() {
  const url = process.argv[2];
  const company = process.argv[3] || 'Unknown';
  const role = process.argv[4] || 'Software Engineer';

  if (!url) {
    console.error('Usage: node apply-agent.mjs <url> [company] [role]');
    process.exit(1);
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    if (url.includes('greenhouse.io')) {
      await applyGreenhouse(page, url);
    } else {
      throw new Error('Unsupported job board. Only Greenhouse is supported for now.');
    }

    await sendNotification(company, role, true);
    console.log(`Successfully applied to ${company}`);
  } catch (err) {
    console.error(`Application failed: ${err.message}`);
    await sendNotification(company, role, false, err.message);
  } finally {
    await browser.close();
  }
}

main();
