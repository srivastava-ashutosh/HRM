const Employee = require('../models/Employee');
const User = require('../models/User');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

exports.getEmployees = asyncHandler(async (req, res) => {
  const { search, department } = req.query;
  let query = { isActive: true };
  if (search) {
    query.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { employeeId: { $regex: search, $options: 'i' } },
      { fullName: { $regex: search, $options: 'i' } }
    ];
  }
  if (department) query.department = department;
  const employees = await Employee.find(query)
    .populate('jobTitle')
    .populate('supervisor', 'firstName lastName fullName')
    .sort({ createdAt: -1 });
  res.json(employees);
});

exports.getEmployee = asyncHandler(async (req, res) => {
  const employee = await Employee.findById(req.params.id)
    .populate('jobTitle')
    .populate('payGrade')
    .populate('workShift')
    .populate('supervisor', 'firstName lastName fullName');
  if (!employee) throw new AppError('Employee not found', 404);
  res.json(employee);
});

exports.createEmployee = asyncHandler(async (req, res) => {
  const { createUser, username, password, role } = req.body;
  const employee = await Employee.create(req.body);
  if (createUser && username) {
    await User.create({
      username,
      password: password || 'changeme123',
      role: role || 'ess',
      employeeId: employee._id
    });
  }
  res.status(201).json(employee);
});

exports.updateEmployee = asyncHandler(async (req, res) => {
  const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!employee) throw new AppError('Employee not found', 404);
  res.json(employee);
});

exports.deleteEmployee = asyncHandler(async (req, res) => {
  await Employee.findByIdAndUpdate(req.params.id, { isActive: false });
  await User.findOneAndUpdate({ employeeId: req.params.id }, { status: false });
  res.json({ message: 'Employee deleted' });
});

exports.getSupervisors = asyncHandler(async (req, res) => {
  const employees = await Employee.find({ isActive: true }).select('firstName lastName fullName employeeId');
  res.json(employees);
});

exports.importEmployees = asyncHandler(async (req, res) => {
  const employees = [];
  for (const data of req.body) {
    const emp = new Employee(data);
    await emp.save();
    employees.push(emp);
  }
  res.status(201).json({ count: employees.length });
});
