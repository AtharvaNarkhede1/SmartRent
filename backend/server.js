require('dotenv').config();
const connectDB = require('./config/db');
const app = require('./app');
const { seedUsers } = require('./seed');

const PORT = process.env.PORT || 5001;
connectDB().then(async () => {
  try {
    await seedUsers({ updateExistingPassword: false });
  } catch (error) {
    console.error('Initial user seed check error:', error.message);
  }
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
