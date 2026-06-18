const Employee = require('../models/Employee');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

exports.getDirectory = asyncHandler(async (req, res) => {
  const { search, department, jobTitle } = req.query;
  let query = { isActive: true };
  if (search) {
    query.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { fullName: { $regex: search, $options: 'i' } },
      { workEmail: { $regex: search, $options: 'i' } }
    ];
  }
  if (department) query.department = department;
  if (jobTitle) query.jobTitle = jobTitle;
  const employees = await Employee.find(query)
    .populate('jobTitle')
    .populate('supervisor', 'firstName lastName fullName')
    .select('firstName lastName middleName fullName jobTitle department workEmail contactNumber profilePic');
  res.json(employees);
});
