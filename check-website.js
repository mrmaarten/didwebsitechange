import 'dotenv/config';
import { createHash } from 'crypto';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createTransport } from 'nodemailer';
import * as cheerio from 'cheerio';

// Get directory of this script
const __dirname = dirname(fileURLToPath(import.meta.url));

// Configuration
const CONFIG = {
  url: process.env.WATCH_URL || 'https://www.veem.nl/nl/ruimte-vrij',
  hashFile: join(__dirname, 'last-hash.txt'),
  contentFile: join(__dirname, 'last-content.txt'),

  // Email settings (use environment variables)
  email: {
    from: process.env.EMAIL_FROM,
    to: process.env.EMAIL_TO,
    smtp: {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      auth: {
        user: process.env.EMAIL_FROM,
        pass: process.env.EMAIL_PASSWORD,
      },
    },
  },
};

async function fetchContent(url) {
  console.log(`Fetching ${url}...`);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  // Remove non-content elements
  $('script, style, nav, footer, header, noscript').remove();

  // Get main content text, normalized
  const text = $('body')
    .text()
    .replace(/\s+/g, ' ')
    .trim();

  return text;
}

function getHash(content) {
  return createHash('sha256').update(content, 'utf8').digest('hex');
}

function loadPreviousHash() {
  if (existsSync(CONFIG.hashFile)) {
    return readFileSync(CONFIG.hashFile, 'utf8').trim();
  }
  return null;
}

function saveHash(hash) {
  writeFileSync(CONFIG.hashFile, hash);
}

function saveContent(content) {
  writeFileSync(CONFIG.contentFile, content);
}

async function sendEmail(subject, body) {
  if (!CONFIG.email.smtp.auth.pass) {
    console.log('⚠️  EMAIL_PASSWORD not set, skipping email notification');
    console.log('Subject:', subject);
    console.log('Body:', body);
    return;
  }

  const transporter = createTransport(CONFIG.email.smtp);

  await transporter.sendMail({
    from: CONFIG.email.from,
    to: CONFIG.email.to,
    subject,
    text: body,
  });

  console.log(`📧 Email sent to ${CONFIG.email.to}`);
}

async function main() {
  const timestamp = new Date().toISOString();
  console.log(`\n[${timestamp}] Checking website...`);

  try {
    const content = await fetchContent(CONFIG.url);
    const currentHash = getHash(content);
    const previousHash = loadPreviousHash();

    if (previousHash === null) {
      console.log('📸 First run - saving initial snapshot');
      saveHash(currentHash);
      saveContent(content);
      return;
    }

    if (currentHash !== previousHash) {
      console.log('🔔 Website changed!');
      saveHash(currentHash);
      saveContent(content);

      await sendEmail(
        '🔔 Website Changed: ' + CONFIG.url,
        `The website has changed!

URL: ${CONFIG.url}
Time: ${timestamp}

Previous hash: ${previousHash}
New hash: ${currentHash}

Go check it out!
`
      );
    } else {
      console.log('✅ No changes detected');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);

    await sendEmail(
      '⚠️ Website Monitor Error',
      `Error checking ${CONFIG.url}:

${error.message}

Stack trace:
${error.stack}
`
    );
  }
}

main();

