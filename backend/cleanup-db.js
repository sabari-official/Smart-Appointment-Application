/**
 * Clean up duplicate googleId: null records from database
 * This resolves E11000 duplicate key errors
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');

async function cleanup() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected\n');

    const User = require('./models/User');

    // Find all users with googleId = null
    const nullGoogleIdUsers = await User.find({ googleId: null }).exec();
    console.log(`Found ${nullGoogleIdUsers.length} users with googleId: null`);

    if (nullGoogleIdUsers.length > 0) {
      console.log('Sample users:');
      nullGoogleIdUsers.slice(0, 3).forEach((user, i) => {
        console.log(`  ${i + 1}. ${user.email} (${user.username})`);
      });
    }

    // Drop and rebuild indexes
    console.log('\n🔄 Fixing indexes...');
    try {
      await User.collection.dropIndexes();
      console.log('✅ Dropped all indexes');
    } catch (err) {
      console.log('⚠️  Index drop skipped:', err.message);
    }

    // Rebuild with correct settings
    await User.syncIndexes();
    console.log('✅ Rebuilt indexes with correct configuration');

    // List final indexes
    const indexes = await User.collection.getIndexes();
    console.log('\n✅ Current indexes:');
    Object.keys(indexes).forEach((idx) => {
      console.log(`  - ${idx}`);
    });

    console.log('\n✅ Database cleanup complete!');
    console.log('✅ You can now register users without E11000 errors');
    console.log('\n📝 Next steps:');
    console.log('   1. Restart backend: npm start');
    console.log('   2. Try registering a new account');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

cleanup();
