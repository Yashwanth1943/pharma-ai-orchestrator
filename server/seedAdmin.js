require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./src/models/User');

const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const adminExists = await User.findOne({ email: 'admin@pharma.com' });
    
    if (adminExists) {
      console.log('Admin already exists');
      process.exit();
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    await User.create({
      name: 'System Admin',
      email: 'admin@pharma.com',
      password: hashedPassword,
      role: 'Admin',
    });

    console.log('Admin account created: admin@pharma.com / admin123');
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedAdmin();
