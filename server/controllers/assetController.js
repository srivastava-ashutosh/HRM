const Asset = require('../models/Asset');
const AssetAssignment = require('../models/AssetAssignment');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { sendSuccess, sendPaginated } = require('../utils/response');
const paginate = require('../utils/paginate');

exports.getAssets = asyncHandler(async (req, res) => {
  const result = await paginate(Asset, {}, {
    ...req.query,
    searchFields: ['name', 'brand', 'model', 'serialNumber', 'location'],
    sort: '-createdAt',
  });
  sendPaginated(res, result.data, { page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages });
});

exports.getAsset = asyncHandler(async (req, res) => {
  const asset = await Asset.findById(req.params.id);
  if (!asset) throw new AppError('Asset not found', 404);
  const currentAssignment = await AssetAssignment.findOne({ asset: asset._id, returnedDate: null })
    .populate('employee', 'firstName lastName fullName employeeId')
    .lean();
  sendSuccess(res, { asset, currentAssignment });
});

exports.createAsset = asyncHandler(async (req, res) => {
  const asset = await Asset.create(req.body);
  sendSuccess(res, asset, 'Asset created', 201);
});

exports.updateAsset = asyncHandler(async (req, res) => {
  const asset = await Asset.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!asset) throw new AppError('Asset not found', 404);
  sendSuccess(res, asset, 'Asset updated');
});

exports.deleteAsset = asyncHandler(async (req, res) => {
  await Asset.findByIdAndUpdate(req.params.id, { status: 'retired' });
  sendSuccess(res, null, 'Asset retired');
});

exports.assignAsset = asyncHandler(async (req, res) => {
  const { assetId, employeeId, notes } = req.body;
  const asset = await Asset.findById(assetId);
  if (!asset) throw new AppError('Asset not found', 404);
  if (asset.status === 'retired') throw new AppError('Cannot assign retired asset', 400);
  if (asset.status === 'maintenance') throw new AppError('Asset is under maintenance', 400);

  const active = await AssetAssignment.findOne({ asset: assetId, returnedDate: null });
  if (active) throw new AppError('Asset is already assigned', 400);

  const assignment = await AssetAssignment.create({
    asset: assetId,
    employee: employeeId,
    assignedBy: req.user._id,
    notes: notes || '',
  });
  await Asset.findByIdAndUpdate(assetId, { status: 'assigned' });

  const populated = await assignment.populate([
    { path: 'asset', select: 'name type brand model serialNumber' },
    { path: 'employee', select: 'firstName lastName fullName employeeId' },
  ]);
  sendSuccess(res, populated, 'Asset assigned', 201);
});

exports.returnAsset = asyncHandler(async (req, res) => {
  const { assetId, condition, notes } = req.body;
  const assignment = await AssetAssignment.findOne({ asset: assetId, returnedDate: null });
  if (!assignment) throw new AppError('Asset is not currently assigned', 400);

  assignment.returnedDate = new Date();
  assignment.condition = condition || assignment.condition;
  if (notes) assignment.notes = notes;
  await assignment.save();

  const newStatus = req.body.status || 'available';
  await Asset.findByIdAndUpdate(assetId, { status: newStatus });
  sendSuccess(res, await assignment.populate([
    { path: 'asset', select: 'name type brand model' },
    { path: 'employee', select: 'firstName lastName fullName' },
  ]), 'Asset returned');
});

exports.getAssignments = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.assetId) filter.asset = req.query.assetId;
  if (req.query.employeeId) filter.employee = req.query.employeeId;
  if (req.query.active === 'true') filter.returnedDate = null;

  const result = await paginate(AssetAssignment, filter, {
    ...req.query,
    populate: [
      { path: 'asset', select: 'name type brand model serialNumber' },
      { path: 'employee', select: 'firstName lastName fullName employeeId department' },
    ],
    sort: '-createdAt',
  });
  sendPaginated(res, result.data, { page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages });
});

exports.getMyAssets = asyncHandler(async (req, res) => {
  const employeeId = req.user.employeeId?._id || req.user.employeeId;
  if (!employeeId) throw new AppError('No employee profile linked', 400);

  const assignments = await AssetAssignment.find({ employee: employeeId, returnedDate: null })
    .populate('asset', 'name type brand model serialNumber purchaseDate warrantyExpiry')
    .sort({ assignedDate: -1 })
    .lean();
  sendSuccess(res, assignments);
});
