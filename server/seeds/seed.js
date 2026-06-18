const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User');
const Employee = require('../models/Employee');
const JobTitle = require('../models/JobTitle');
const PayGrade = require('../models/PayGrade');
const WorkShift = require('../models/WorkShift');
const LeaveType = require('../models/LeaveType');
const Organization = require('../models/Organization');
const Asset = require('../models/Asset');
const AssetAssignment = require('../models/AssetAssignment');
const Ticket = require('../models/Ticket');
const ExitRequest = require('../models/ExitRequest');
const Role = require('../models/Role');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/indianic_hrm');
    console.log('Connected to MongoDB');

    await Promise.all([
      User.deleteMany({}),
      Employee.deleteMany({}),
      JobTitle.deleteMany({}),
      PayGrade.deleteMany({}),
      WorkShift.deleteMany({}),
      LeaveType.deleteMany({}),
      Organization.deleteMany({}),
      Asset.deleteMany({}),
      AssetAssignment.deleteMany({}),
      Ticket.deleteMany({}),
      ExitRequest.deleteMany({}),
      Role.deleteMany({})
    ]);
    console.log('Cleared existing data');

    const jobTitles = await JobTitle.insertMany([
      { title: 'Chief Executive Officer', description: 'Top executive' },
      { title: 'Chief Technical Officer', description: 'Technical lead' },
      { title: 'IT Manager', description: 'IT department head' },
      { title: 'Senior Developer', description: 'Senior software engineer' },
      { title: 'Junior Developer', description: 'Junior software engineer' },
      { title: 'HR Manager', description: 'Human resources manager' },
      { title: 'HR Assistant', description: 'HR support' },
      { title: 'Accountant', description: 'Finance and accounting' },
      { title: 'Marketing Specialist', description: 'Marketing department' },
      { title: 'Sales Representative', description: 'Sales team member' }
    ]);

    const payGrades = await PayGrade.insertMany([
      { name: 'Executive Level', currencyEntries: [{ currency: 'USD', minSalary: 150000, maxSalary: 300000 }] },
      { name: 'Senior Level', currencyEntries: [{ currency: 'USD', minSalary: 80000, maxSalary: 150000 }] },
      { name: 'Mid Level', currencyEntries: [{ currency: 'USD', minSalary: 50000, maxSalary: 90000 }] },
      { name: 'Entry Level', currencyEntries: [{ currency: 'USD', minSalary: 30000, maxSalary: 55000 }] }
    ]);

    const workShifts = await WorkShift.insertMany([
      { name: 'General Shift', startTime: '09:00', endTime: '18:00', hoursPerDay: 8 },
      { name: 'Morning Shift', startTime: '06:00', endTime: '14:00', hoursPerDay: 8 },
      { name: 'Evening Shift', startTime: '14:00', endTime: '22:00', hoursPerDay: 8 },
      { name: 'Night Shift', startTime: '22:00', endTime: '06:00', hoursPerDay: 8 }
    ]);

    const adminEmp = await Employee.create({
      employeeId: 'EMP0001',
      firstName: 'Admin',
      lastName: 'User',
      fullName: 'Admin User',
      jobTitle: jobTitles[0]._id,
      payGrade: payGrades[0]._id,
      workShift: workShifts[0]._id,
      workEmail: 'admin@indianic.com',
      contactNumber: '+1-555-0100',
      department: 'Administration'
    });

    const emp2 = await Employee.create({
      employeeId: 'EMP0002',
      firstName: 'John',
      lastName: 'Doe',
      fullName: 'John Doe',
      jobTitle: jobTitles[2]._id,
      payGrade: payGrades[1]._id,
      workShift: workShifts[0]._id,
      workEmail: 'john@indianic.com',
      contactNumber: '+1-555-0101',
      department: 'IT'
    });

    const emp3 = await Employee.create({
      employeeId: 'EMP0003',
      firstName: 'Jane',
      lastName: 'Smith',
      fullName: 'Jane Smith',
      jobTitle: jobTitles[5]._id,
      payGrade: payGrades[1]._id,
      workShift: workShifts[0]._id,
      workEmail: 'jane@indianic.com',
      contactNumber: '+1-555-0102',
      department: 'Human Resources'
    });

    await Employee.insertMany([
      {
        employeeId: 'EMP0004', firstName: 'Michael', lastName: 'Johnson',
        fullName: 'Michael Johnson', jobTitle: jobTitles[3]._id,
        payGrade: payGrades[2]._id, workShift: workShifts[0]._id,
        workEmail: 'michael@indianic.com', contactNumber: '+1-555-0103',
        department: 'IT', supervisor: adminEmp._id
      },
      {
        employeeId: 'EMP0005', firstName: 'Emily', lastName: 'Brown',
        fullName: 'Emily Brown', jobTitle: jobTitles[6]._id,
        payGrade: payGrades[2]._id, workShift: workShifts[0]._id,
        workEmail: 'emily@indianic.com', contactNumber: '+1-555-0104',
        department: 'Human Resources', supervisor: emp3._id
      },
      {
        employeeId: 'EMP0006', firstName: 'David', lastName: 'Wilson',
        fullName: 'David Wilson', jobTitle: jobTitles[4]._id,
        payGrade: payGrades[3]._id, workShift: workShifts[1]._id,
        workEmail: 'david@indianic.com', contactNumber: '+1-555-0105',
        department: 'IT', supervisor: emp2._id
      },
      {
        employeeId: 'EMP0007', firstName: 'Sarah', lastName: 'Taylor',
        fullName: 'Sarah Taylor', jobTitle: jobTitles[8]._id,
        payGrade: payGrades[2]._id, workShift: workShifts[0]._id,
        workEmail: 'sarah@indianic.com', contactNumber: '+1-555-0106',
        department: 'Marketing'
      },
      {
        employeeId: 'EMP0008', firstName: 'Robert', lastName: 'Anderson',
        fullName: 'Robert Anderson', jobTitle: jobTitles[7]._id,
        payGrade: payGrades[2]._id, workShift: workShifts[0]._id,
        workEmail: 'robert@indianic.com', contactNumber: '+1-555-0107',
        department: 'Finance'
      },
      {
        employeeId: 'EMP0009', firstName: 'Lisa', lastName: 'Martinez',
        fullName: 'Lisa Martinez', jobTitle: jobTitles[9]._id,
        payGrade: payGrades[2]._id, workShift: workShifts[0]._id,
        workEmail: 'lisa@indianic.com', contactNumber: '+1-555-0108',
        department: 'Sales'
      }
    ]);

    await User.create([
      { username: 'admin', password: 'admin123', role: 'admin', employeeId: adminEmp._id },
      { username: 'john', password: 'john123', role: 'ess', employeeId: emp2._id },
      { username: 'jane', password: 'jane123', role: 'ess', employeeId: emp3._id }
    ]);

    await LeaveType.insertMany([
      { name: 'Annual Leave', color: '#76BC21' },
      { name: 'Sick Leave', color: '#FF7B1D' },
      { name: 'Personal Leave', color: '#4A90D9' },
      { name: 'Maternity Leave', color: '#E87DA0' },
      { name: 'Paternity Leave', color: '#5D9CEC' },
      { name: 'Study Leave', color: '#8E44AD' }
    ]);

    await Organization.create({
      name: 'IndiaNIC HRM',
      email: 'info@indianichrm.com',
      phone: '+1-555-0000',
      address: '123 HR Street',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'United States'
    });

    const assets = await Asset.insertMany([
      { name: 'MacBook Pro 16"', type: 'laptop', brand: 'Apple', model: 'M3 Pro', serialNumber: 'SN-MBP-001', purchaseDate: new Date('2025-01-15'), purchasePrice: 2499, warrantyExpiry: new Date('2028-01-15'), status: 'assigned', location: 'IT Dept' },
      { name: 'Dell UltraSharp 27"', type: 'monitor', brand: 'Dell', model: 'U2723QE', serialNumber: 'SN-DEL-001', purchaseDate: new Date('2025-02-01'), purchasePrice: 619, warrantyExpiry: new Date('2028-02-01'), status: 'available', location: 'IT Dept' },
      { name: 'iPhone 15 Pro', type: 'phone', brand: 'Apple', model: 'A3101', serialNumber: 'SN-IPH-001', purchaseDate: new Date('2025-03-01'), purchasePrice: 1099, warrantyExpiry: new Date('2027-03-01'), status: 'assigned', location: 'HR Dept' },
      { name: 'iPad Air 11"', type: 'tablet', brand: 'Apple', model: 'M2', serialNumber: 'SN-IPD-001', purchaseDate: new Date('2025-04-01'), purchasePrice: 599, warrantyExpiry: new Date('2028-04-01'), status: 'available', location: 'Sales Dept' },
      { name: 'Logitech Zone Wireless', type: 'headset', brand: 'Logitech', model: 'Zone 900', serialNumber: 'SN-LOG-001', purchaseDate: new Date('2025-01-10'), purchasePrice: 299, status: 'maintenance', location: 'IT Dept' },
      { name: 'ThinkPad X1 Carbon', type: 'laptop', brand: 'Lenovo', model: 'Gen 12', serialNumber: 'SN-LNV-001', purchaseDate: new Date('2025-05-01'), purchasePrice: 1899, warrantyExpiry: new Date('2028-05-01'), status: 'available', location: 'Finance Dept' },
    ]);

    await AssetAssignment.create([
      { asset: assets[0]._id, employee: emp2._id, assignedDate: new Date('2025-06-01'), notes: 'Development work laptop', assignedBy: adminEmp._id },
      { asset: assets[2]._id, employee: emp3._id, assignedDate: new Date('2025-06-15'), notes: 'Company phone', assignedBy: adminEmp._id },
    ]);

    await Ticket.create([
      { subject: 'VPN not connecting from home office', description: 'Unable to establish VPN connection since yesterday. Need urgent help.', category: 'IT', priority: 'high', status: 'open', createdBy: emp2._id },
      { subject: 'New keyboard and mouse request', description: 'Requesting ergonomic keyboard and mouse for new workstation.', category: 'Facilities', priority: 'low', status: 'open', createdBy: emp3._id },
      { subject: 'Payroll discrepancy in March', description: 'Missing overtime pay for week of March 10-14.', category: 'HR', priority: 'urgent', status: 'resolved', createdBy: emp2._id, resolution: 'Overtime hours were processed correctly. Please check payslip portal for updated breakdown.', resolvedAt: new Date('2026-03-20') },
      { subject: 'Server room AC maintenance needed', description: 'Temperature in server room rising above acceptable levels.', category: 'Facilities', priority: 'high', status: 'in_progress', createdBy: adminEmp._id, assignedTo: adminEmp._id },
      { subject: 'Software license renewal', description: 'JetBrains license expiring next month. Requesting renewal approval.', category: 'IT', priority: 'medium', status: 'assigned', createdBy: emp2._id, assignedTo: adminEmp._id },
    ]);

    await ExitRequest.create([
      { employee: emp2._id, type: 'resignation', reason: 'Relocating to another city for family reasons', lastWorkingDay: new Date('2026-07-15'), status: 'pending' },
      { employee: emp3._id, type: 'resignation', reason: 'Accepted position at another company', lastWorkingDay: new Date('2026-06-30'), status: 'approved', reviewedBy: adminEmp._id, reviewedAt: new Date('2026-06-10') },
    ]);

    const modules = ['admin', 'pim', 'leave', 'time', 'recruitment', 'training', 'performance', 'directory', 'maintenance', 'buzz', 'assets'];
    const actions = ['read', 'create', 'update', 'delete', 'write', 'approve', 'import', 'export'];
    await Role.create([
      {
        name: 'admin', displayName: 'Administrator', description: 'Full system access', isSystem: true, priority: 100,
        permissions: modules.flatMap(m => actions.map(a => ({ module: m, action: a }))),
      },
      {
        name: 'ess', displayName: 'Employee Self-Service', description: 'Basic employee access', isSystem: true, priority: 10,
        permissions: [
          { module: 'pim', action: 'read' }, { module: 'pim', action: 'update' },
          { module: 'leave', action: 'read' }, { module: 'leave', action: 'create' }, { module: 'leave', action: 'write' },
          { module: 'time', action: 'read' }, { module: 'time', action: 'create' },
          { module: 'recruitment', action: 'read' },
          { module: 'training', action: 'read' },
          { module: 'performance', action: 'read' },
          { module: 'directory', action: 'read' },
          { module: 'buzz', action: 'read' },
        ],
      },
    ]);

    console.log('Seed data inserted successfully!');
    console.log('Admin login: admin / admin123');
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedData();
