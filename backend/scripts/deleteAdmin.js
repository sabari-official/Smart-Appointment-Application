/**
 * ONE TIME ONLY: Delete the existing admin so you can create a new one.
 * Usage: node scripts/deleteAdmin.js
 *
 * After running this, use createAdmin.js to create a new admin with new username and password.
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

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    const existing = await User.findOne({ role: 'admin' });
    if (!existing) {
      console.log('No admin found. Nothing to delete.');
      rl.close();
      process.exit(0);
      return;
    }

    console.log('Existing admin found:');
    console.log('  Username:', existing.username || '(not set)');
    console.log('  Name:', existing.name);
    console.log('');
    const confirm = await question('Delete this admin? Type YES to confirm: ');

    if (confirm.trim().toUpperCase() !== 'YES') {
      console.log('❌ Cancelled. Admin not deleted.');
      rl.close();
      process.exit(0);
      return;
    }

    await User.deleteOne({ _id: existing._id });
    console.log('\n✅ Admin deleted. Run createAdmin.js to create a new admin.\n');
    rl.close();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    rl.close();
    process.exit(1);
  }
}

run();
