const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/User');
const users = [
  ['Adaeze Okafor', 'admin@choircloud.com', ['admin'], 'Alto'],
  ['Tunde Bakare', 'president@choircloud.com', ['president'], 'Tenor'],
  ['Grace Eze', 'secretary@choircloud.com', ['secretary'], 'Soprano'],
  ['Samuel Adeyemi', 'provost@choircloud.com', ['provost'], 'Bass'],
  ['Ruth Chukwu', 'custodian@choircloud.com', ['custodian'], 'Alto'],
  ['David Olawale', 'electoral@choircloud.com', ['electoral'], 'Tenor'],
  ['Miriam Bello', 'miriam@choircloud.com', [], 'Soprano'],
  ['Joshua Nnamdi', 'joshua@choircloud.com', [], 'Bass'],
  ['Esther Adeola', 'esther@choircloud.com', [], 'Alto'],
  ['Peter Femi', 'peter@choircloud.com', [], 'Tenor'],
];
(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const hash = await bcrypt.hash('demo123', 10);
  for (const [name, email, roles, section] of users)
    await User.updateOne({ email }, { name, email, roles, section, passwordHash: hash, status: 'active' }, { upsert: true });
  console.log('✅ Seeded 10 users (password: demo123)');
  process.exit(0);
})();