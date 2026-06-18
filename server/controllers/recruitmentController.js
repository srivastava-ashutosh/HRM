const Vacancy = require('../models/Vacancy');
const Candidate = require('../models/Candidate');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

exports.getVacancies = asyncHandler(async (req, res) => {
  const vacancies = await Vacancy.find().populate('jobTitle').populate('hiringManager', 'firstName lastName fullName').sort({ createdAt: -1 });
  res.json(vacancies);
});

exports.createVacancy = asyncHandler(async (req, res) => {
  const vacancy = await Vacancy.create(req.body);
  res.status(201).json(vacancy);
});

exports.updateVacancy = asyncHandler(async (req, res) => {
  const vacancy = await Vacancy.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(vacancy);
});

exports.deleteVacancy = asyncHandler(async (req, res) => {
  await Vacancy.findByIdAndDelete(req.params.id);
  res.json({ message: 'Vacancy deleted' });
});

exports.getCandidates = asyncHandler(async (req, res) => {
  const { vacancy, status } = req.query;
  let query = {};
  if (vacancy) query.vacancy = vacancy;
  if (status) query.status = status;
  const candidates = await Candidate.find(query).populate('vacancy').sort({ dateOfApplication: -1 });
  res.json(candidates);
});

exports.createCandidate = asyncHandler(async (req, res) => {
  const candidate = await Candidate.create(req.body);
  res.status(201).json(candidate);
});

exports.updateCandidate = asyncHandler(async (req, res) => {
  const candidate = await Candidate.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(candidate);
});

exports.deleteCandidate = asyncHandler(async (req, res) => {
  await Candidate.findByIdAndDelete(req.params.id);
  res.json({ message: 'Candidate deleted' });
});

exports.importVacancies = asyncHandler(async (req, res) => {
  const items = await Vacancy.insertMany(req.body);
  res.status(201).json({ count: items.length });
});

exports.importCandidates = asyncHandler(async (req, res) => {
  const items = await Candidate.insertMany(req.body);
  res.status(201).json({ count: items.length });
});
