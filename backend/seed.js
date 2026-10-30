require('dotenv').config();
const bcrypt = require('bcrypt');
const connectDB = require('./config/db');
const Admin = require('./models/Admin');

const defaultUsers = [
  {
    name: 'MPK Malkapur',
    email: 'mpkmalkapur@gmail.com',
    password: 'mpkmalkapur',
  },
  {
    name: 'System Admin',
    email: 'system@gmail.com',
    password: 'system',
  },
  {
    name: 'Owner',
    email: 'owner@gmail.com',
    password: 'owner',
  },
];

const seedUsers = async (options = { updateExistingPassword: true }) => {
  for (const user of defaultUsers) {
    const emailLower = user.email.toLowerCase().trim();
    const existing = await Admin.findOne({
      email: { $regex: new RegExp(`^${emailLower}$`, 'i') },
    });

    const hashedPassword = await bcrypt.hash(user.password, 10);

    if (!existing) {
      await Admin.create({
        name: user.name,
        email: emailLower,
        password: hashedPassword,
        settings: {},
      });
      console.log(`[Seed] Created user: ${user.email}`);
    } else {
      if (options.updateExistingPassword) {
        existing.password = hashedPassword;
        if (!existing.name) existing.name = user.name;
        await existing.save();
        console.log(`[Seed] Updated password for user: ${user.email}`);
      } else {
        console.log(`[Seed] User already exists: ${user.email}`);
      }
    }
  }
};

if (require.main === module) {
  (async () => {
    try {
      await connectDB();
      await seedUsers({ updateExistingPassword: true });
      console.log('Database seeded with default users successfully.');
      process.exit(0);
    } catch (error) {
      console.error('Failed to seed users:', error.message);
      process.exit(1);
    }
  })();
}

module.exports = { seedUsers, defaultUsers };

