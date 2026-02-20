/**
 * Fix MongoDB indexes for User collection
 * Run this once to clean up and rebuild indexes
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');

async function fixIndexes() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected');

    const db = mongoose.connection;
    
    // Drop the problematic unique index on googleId if it exists
    try {
      await db.collection('users').dropIndex('googleId_1');
      console.log('✅ Dropped old googleId_1 index');
    } catch (err) {
      if (err.code === 27) {
        console.log('ℹ️  googleId_1 index doesn\'t exist (already dropped)');
      } else {
        console.log('⚠️  Could not drop googleId_1:', err.message);
      }
    }

    // Now rebuild indexes through Mongoose
    console.log('\nRebuilding User model indexes...');
    const User = require('./models/User');
    
    // Clear existing indexes
    try {
      await User.collection.dropIndexes();
      console.log('✅ Dropped all old indexes');
    } catch (err) {
      console.log('⚠️  Could not drop indexes:', err.message);
    }

    // Rebuild indexes
    await User.syncIndexes();
    console.log('✅ Rebuilt all indexes with correct configuration');

    // List final indexes
    const indexes = await User.collection.getIndexes();
    console.log('\n✅ Final indexes:');
    Object.keys(indexes).forEach((idx) => {
      console.log('  -', idx, ':', indexes[idx]);
    });

    console.log('\n✅ All indexes fixed successfully!');
    console.log('✅ You can now register multiple users without E11000 errors');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

fixIndexes();
