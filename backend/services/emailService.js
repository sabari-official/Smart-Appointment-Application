const nodemailer = require('nodemailer');
const { generateEmailBody } = require('./aiService');

let transporter = null;
let transporterVerified = false;

function getTransporter() {
  if (transporter) return transporter;
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  if (!user || !pass) {
    console.warn('⚠️  EMAIL_USER or EMAIL_PASS not set - emails will not be sent');
    console.warn('   EMAIL_USER:', user ? '✓ set' : '✗ missing');
    console.warn('   EMAIL_PASS:', pass ? '✓ set' : '✗ missing');
    return null;
  }
  console.log('📧 Creating email transporter...');
  console.log('   Host:', process.env.EMAIL_HOST || 'smtp.gmail.com');
  console.log('   Port:', process.env.EMAIL_PORT || 587);
  console.log('   User:', user);
  console.log('   Pass:', pass ? `${pass.substring(0, 4)}****` : 'NOT SET');

  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: { user, pass },
    tls: {
      rejectUnauthorized: false,
    },
  });
  return transporter;
}

// Verify SMTP connection on first use
async function verifyTransporter() {
  if (transporterVerified) return true;
  const trans = getTransporter();
  if (!trans) return false;
  try {
    await trans.verify();
    console.log('✅ SMTP connection verified successfully');
    transporterVerified = true;
    return true;
  } catch (err) {
    console.error('❌ SMTP connection verification FAILED:', err.message);
    console.error('   This usually means your EMAIL_PASS (App Password) is incorrect.');
    console.error('   Make sure there are no extra spaces or comments in your .env file.');
    // Reset transporter so it can be recreated with correct credentials
    transporter = null;
    transporterVerified = false;
    return false;
  }
}

async function sendMail({ to, subject, text, html }) {
  const trans = getTransporter();
  if (!trans) {
    const errMsg = 'Email not configured - EMAIL_USER or EMAIL_PASS missing';
    console.error(`❌ ${errMsg}`);
    throw new Error(errMsg);
  }

  // Verify SMTP connection on first send
  if (!transporterVerified) {
    const verified = await verifyTransporter();
    if (!verified) {
      throw new Error('SMTP authentication failed - check your EMAIL_PASS (App Password)');
    }
  }

  try {
    const info = await trans.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject: subject || 'Smart Appointment',
      text: text || '',
      html: html || (text ? text.replace(/\n/g, '<br>') : ''),
    });
    console.log(`✅ Email sent successfully to ${to} (messageId: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error(`❌ Email send FAILED to ${to}:`, err.message);
    // Reset transporter in case credentials changed
    transporter = null;
    transporterVerified = false;
    throw new Error(`Failed to send email: ${err.message}`);
  }
}

async function sendOTP(email, code) {
  return sendMail({
    to: email,
    subject: 'Your verification code - Smart Appointment',
    text: `Your OTP is: ${code}. It expires in 10 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #6c63ff; text-align: center;">Smart Appointment</h2>
        <div style="background: #f8f9fa; border-radius: 10px; padding: 30px; text-align: center;">
          <p style="color: #333; font-size: 16px;">Your verification code is:</p>
          <h1 style="color: #6c63ff; font-size: 36px; letter-spacing: 8px; margin: 20px 0;">${code}</h1>
          <p style="color: #666; font-size: 14px;">This code expires in <strong>10 minutes</strong>.</p>
        </div>
        <p style="color: #999; font-size: 12px; text-align: center; margin-top: 20px;">
          If you didn't request this code, please ignore this email.
        </p>
      </div>
    `,
  });
}

async function sendAppointmentEmail({ to, userName, providerName, date, time, action }) {
  const body = await generateEmailBody({ userName, providerName, date, time, action });
  const subject = `Appointment ${action} - ${providerName}`;
  return sendMail({ to, subject, text: body });
}

module.exports = {
  sendMail,
  sendOTP,
  sendAppointmentEmail,
  verifyTransporter,
};
