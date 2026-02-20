require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

async function setupAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const User = require('./models/User');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('Admin already exists:');
      console.log(`  Username: ${existingAdmin.username}`);
      console.log(`  Email: ${existingAdmin.email}`);
      console.log('\nTo reset admin password, delete admin and re-run this script.');
      process.exit(0);
    }

    // Create admin
    const admin = await User.create({
      name: 'System Admin',
      username: 'admin',
      email: 'admin@smartappointment.com',
      password: 'Admin@123',
      role: 'admin',
      isVerified: true,
      termsAccepted: true,
      termsAcceptedAt: new Date(),
    });

    console.log('\n✅ Admin account created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`  Username: admin`);
    console.log(`  Password: Admin@123`);
    console.log(`  Email: admin@smartappointment.com`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n⚠️  Change admin password after first login!');

    process.exit(0);
  } catch (err) {
    console.error('Setup admin error:', err.message);
    process.exit(1);
  }
}

setupAdmin();
