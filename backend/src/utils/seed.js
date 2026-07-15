/**
 * utils/seed.js
 * -----------------------------------------------------------------------
 * Seeds two demo users (one employee, one admin) so the app can be
 * evaluated immediately after deployment without a manual sign-up flow.
 * Run with: node src/utils/seed.js
 * -----------------------------------------------------------------------
 */

require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');

const seedUsers = [
  {
    username: 'employee1',
    password: 'Employee@123',
    role: 'employee',
    fullName: 'Jordan Ellis',
    department: 'Marketing',
  },
  {
    username: 'admin1',
    password: 'Admin@123',
    role: 'admin',
    fullName: 'Riley Chen',
    department: 'IT Operations',
  },
];

const run = async () => {
  await connectDB();

  for (const userData of seedUsers) {
    const existing = await User.findOne({ username: userData.username });
    if (existing) {
      console.log(`[Seed] User "${userData.username}" already exists, skipping.`);
      continue;
    }
    await User.create(userData);
    console.log(`[Seed] Created user "${userData.username}" (${userData.role}).`);
  }

  console.log('[Seed] Done.');
  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error('[Seed] Failed:', err);
  process.exit(1);
});
