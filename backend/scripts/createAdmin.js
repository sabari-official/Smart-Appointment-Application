/**
 * Interactive script to create the first admin user (ONE TIME ONLY).
 * Usage: node scripts/createAdmin.js
 *
 * Admin uses USERNAME + PASSWORD only (no email).
 * Username can contain letters, numbers, and special characters.
 *
 * Customers and providers use EMAIL + PASSWORD on the login page.
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const readline = require('readline');
const User = require('../models/User');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

function validatePassword(password) {
  const errors = [];
  if (password.length < 8) {
    errors.push('at least 8 characters');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('at least 1 capital letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('at least 1 small letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('at least 1 number');
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('at least 1 special character');
  }
  return errors;
}

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    const existing = await User.findOne({ role: 'admin' });
    if (existing) {
      console.log('❌ Admin already exists. Username:', existing.username || '(legacy)');
      console.log('   Only one admin can be created. Use the existing admin account to login.');
      rl.close();
      process.exit(0);
      return;
    }

    console.log('=== Create Admin Account (ONE TIME ONLY) ===');
    console.log('Admin logs in with USERNAME + PASSWORD (no email).\n');

    const usernameRaw = await question('Enter admin username (any characters, any length): ');
    const username = usernameRaw ? String(usernameRaw).trim() : '';
    if (!username || username.length === 0) {
      console.log('❌ Username cannot be empty');
      rl.close();
      process.exit(1);
      return;
    }

    const usernameExists = await User.findOne({ username });
    if (usernameExists) {
      console.log('❌ This username is already taken');
      rl.close();
      process.exit(1);
      return;
    }

    console.log('\nPassword requirements:');
    console.log('  - Minimum 8 characters');
    console.log('  - At least 1 capital letter (A-Z)');
    console.log('  - At least 1 small letter (a-z)');
    console.log('  - At least 1 number (0-9)');
    console.log('  - At least 1 special character (!@#$%^&* etc.)\n');
    const password = await question('Enter admin password: ');
    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      console.log('❌ Password must have:');
      passwordErrors.forEach((err) => console.log('   -', err));
      rl.close();
      process.exit(1);
      return;
    }

    const nameRaw = await question('Enter admin name: ');
    const name = nameRaw ? nameRaw.trim() : '';
    if (!name || name.length === 0) {
      console.log('❌ Admin name is required');
      rl.close();
      process.exit(1);
      return;
    }

    console.log('\n--- Summary ---');
    console.log('Username:', username);
    console.log('Name:', name);
    console.log('Password:', '*'.repeat(password.length));
    const confirm = await question('\nCreate this admin account? (yes/no): ');

    if (confirm.toLowerCase() !== 'yes' && confirm.toLowerCase() !== 'y') {
      console.log('❌ Cancelled');
      rl.close();
      process.exit(0);
      return;
    }

    await User.create({
      name: name.trim(),
      username,
      password,
      role: 'admin',
      isVerified: true,
      termsAccepted: true,
      termsAcceptedAt: new Date(),
    });

    console.log('\n✅ Admin created successfully!');
    console.log('   Login with USERNAME:', username, 'and your password.');
    console.log('   (On the login page, use the username field for admin.)\n');
    rl.close();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    rl.close();
    process.exit(1);
  }
}

run();
