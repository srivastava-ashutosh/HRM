const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const Role = require('../models/Role');

const MODULES = ['admin', 'pim', 'leave', 'time', 'recruitment', 'performance', 'buzz', 'directory', 'maintenance', 'dashboard'];
const ACTIONS = ['read', 'write', 'create', 'update', 'delete', 'approve', 'export', 'import'];

const allPermissions = MODULES.flatMap(m => ACTIONS.map(a => ({ module: m, action: a })));

const roles = [
  {
    name: 'admin',
    displayName: 'Administrator',
    description: 'Full system access with all permissions',
    isSystem: true,
    priority: 1,
    permissions: allPermissions,
  },
  {
    name: 'ess',
    displayName: 'Employee (ESS)',
    description: 'Standard employee self-service access',
    isSystem: true,
    priority: 10,
    permissions: MODULES.filter(m => !['admin', 'maintenance'].includes(m)).flatMap(m =>
      ['read', 'export'].map(a => ({ module: m, action: a }))
    ).concat([
      { module: 'pim', action: 'read' },
      { module: 'pim', action: 'update' },
      { module: 'leave', action: 'create' },
      { module: 'leave', action: 'read' },
      { module: 'time', action: 'create' },
      { module: 'time', action: 'read' },
      { module: 'buzz', action: 'create' },
      { module: 'buzz', action: 'read' },
    ]),
  },
  {
    name: 'supervisor',
    displayName: 'Supervisor',
    description: 'Can manage subordinates and approve requests',
    isSystem: true,
    priority: 5,
    permissions: MODULES.filter(m => !['admin', 'maintenance'].includes(m)).flatMap(m =>
      ['read', 'write', 'export'].map(a => ({ module: m, action: a }))
    ).concat([
      { module: 'leave', action: 'approve' },
      { module: 'time', action: 'approve' },
      { module: 'performance', action: 'create' },
      { module: 'performance', action: 'approve' },
    ]),
  },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/indianic_hrm');
    console.log('Connected to MongoDB');

    await Role.deleteMany({});
    const created = await Role.insertMany(roles);
    console.log(`Seeded ${created.length} roles`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seed();
