import 'dotenv/config';
import { createTransport } from 'nodemailer';

const CONFIG = {
  from: process.env.EMAIL_FROM,
  to: process.env.EMAIL_TO,
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    requireTLS: true, // Use TLS
    auth: {
      user: process.env.EMAIL_FROM,
      pass: process.env.EMAIL_PASSWORD,
    },
  },
};

async function main() {
  console.log('Testing email configuration...\n');
  console.log('From:', CONFIG.from);
  console.log('To:', CONFIG.to);
  console.log('SMTP:', CONFIG.smtp.host + ':' + CONFIG.smtp.port);
  console.log('Password:', CONFIG.smtp.auth.pass ? '****' + CONFIG.smtp.auth.pass.slice(-4) : '(not set)');
  console.log('');

  if (!CONFIG.smtp.auth.pass) {
    console.log('❌ EMAIL_PASSWORD is not set!');
    console.log('\nMake sure your .env file has EMAIL_PASSWORD set.');
    console.log('For Gmail, you need an App Password (not your regular password).');
    process.exit(1);
  }

  try {
    console.log('Connecting to SMTP server...');
    const transporter = createTransport(CONFIG.smtp);

    console.log('Sending test email...');
    await transporter.sendMail({
      from: CONFIG.from,
      to: CONFIG.to,
      subject: '✅ Website Monitor Test Email',
      text: `This is a test email from your website change detector.

If you receive this, your email configuration is working correctly!

Configuration:
- SMTP: ${CONFIG.smtp.host}:${CONFIG.smtp.port}
- From: ${CONFIG.from}
- To: ${CONFIG.to}

Time: ${new Date().toISOString()}
`,
    });

    console.log('\n✅ Test email sent successfully!');
    console.log(`Check your inbox at ${CONFIG.to}`);
  } catch (error) {
    console.log('\n❌ Failed to send email:', error.message);
    
    if (error.code === 'EAUTH') {
      console.log('\n💡 Authentication failed. For Gmail:');
      console.log('   1. Make sure 2FA is enabled on your Google account');
      console.log('   2. Go to: https://myaccount.google.com/apppasswords');
      console.log('   3. Generate an App Password for "Mail"');
      console.log('   4. Use that password in .env (not your regular password)');
    }
    
    process.exit(1);
  }
}

main();

