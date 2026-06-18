const express = require('express');
const router = express.Router();
const { protect, adminOnly, requirePermission } = require('../middleware/auth');
const Role = require('../models/Role');

router.use(protect, adminOnly);

const MODULE_DEFINITIONS = [
  { module: 'admin', label: 'Admin', description: 'User management, job titles, pay grades, organization settings' },
  { module: 'pim', label: 'PIM', description: 'Employee information management' },
  { module: 'leave', label: 'Leave', description: 'Leave requests, types, entitlements, holidays' },
  { module: 'time', label: 'Time', description: 'Timesheets and attendance' },
  { module: 'recruitment', label: 'Recruitment', description: 'Vacancies and candidates' },
  { module: 'performance', label: 'Performance', description: 'Performance reviews' },
  { module: 'buzz', label: 'Buzz', description: 'Social board posts and comments' },
  { module: 'directory', label: 'Directory', description: 'Employee directory' },
  { module: 'maintenance', label: 'Maintenance', description: 'System maintenance' },
  { module: 'dashboard', label: 'Dashboard', description: 'Dashboard overview' },
];

const ACTIONS = ['read', 'write', 'create', 'update', 'delete', 'approve', 'export', 'import'];

router.get('/', requirePermission('admin:read'), async (req, res) => {
  try {
    const roles = await Role.find().sort({ priority: 1 });
    res.json(roles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/modules', requirePermission('admin:read'), async (req, res) => {
  res.json({ modules: MODULE_DEFINITIONS, actions: ACTIONS });
});

router.post('/', requirePermission('admin:create'), async (req, res) => {
  try {
    const { name, displayName, description, permissions } = req.body;
    if (!name || !displayName) return res.status(400).json({ message: 'Name and display name are required' });
    const exists = await Role.findOne({ name });
    if (exists) return res.status(400).json({ message: 'Role name already exists' });
    const role = await Role.create({ name, displayName, description, permissions, isSystem: false });
    res.status(201).json(role);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', requirePermission('admin:update'), async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) return res.status(404).json({ message: 'Role not found' });
    if (role.isSystem && req.body.name && req.body.name !== role.name) {
      return res.status(400).json({ message: 'Cannot rename system roles' });
    }
    Object.assign(role, req.body);
    await role.save();
    res.json(role);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', requirePermission('admin:delete'), async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) return res.status(404).json({ message: 'Role not found' });
    if (role.isSystem) return res.status(400).json({ message: 'Cannot delete system role' });
    const usersWithRole = await require('../models/User').countDocuments({ role: role.name });
    if (usersWithRole > 0) return res.status(400).json({ message: `Cannot delete role: ${usersWithRole} user(s) are assigned to it` });
    await Role.findByIdAndDelete(req.params.id);
    res.json({ message: 'Role deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
