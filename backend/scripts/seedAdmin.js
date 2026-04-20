const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config({ path: '../.env' });

async function seedAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    const adminEmail = 'admin@smartagri.com';
    let admin = await User.findOne({ email: adminEmail });
    if (admin) {
      console.log('Admin already exists. Updating password...');
    } else {
      admin = new User({ email: adminEmail, role: 'admin' });
    }

    admin.name = 'System Administrator';
    admin.role = 'admin';
    admin.password = await bcrypt.hash('admin123', 10);
    admin.phone = '0000000000';
    admin.state = 'Admin';
    admin.district = 'Admin';
    admin.cropType = 'None';
    admin.soilType = 'None';
    admin.landSize = '0';
    
    await admin.save();
    console.log('Admin user seeded successfully! Email: admin@smartagri.com, Pass: admin123');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
}

seedAdmin();
