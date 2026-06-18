const express = require('express');
const router = express.Router();
const { protect, requirePermission } = require('../middleware/auth');
const {
  getVacancies, createVacancy, updateVacancy, deleteVacancy,
  getCandidates, createCandidate, updateCandidate, deleteCandidate,
  importVacancies, importCandidates
} = require('../controllers/recruitmentController');

router.get('/vacancies', protect, requirePermission('recruitment:read'), getVacancies);
router.post('/vacancies', protect, requirePermission('recruitment:create'), createVacancy);
router.put('/vacancies/:id', protect, requirePermission('recruitment:update'), updateVacancy);
router.delete('/vacancies/:id', protect, requirePermission('recruitment:delete'), deleteVacancy);

router.post('/vacancies/import', protect, requirePermission('recruitment:create'), importVacancies);
router.post('/candidates/import', protect, requirePermission('recruitment:create'), importCandidates);

router.get('/candidates', protect, requirePermission('recruitment:read'), getCandidates);
router.post('/candidates', protect, requirePermission('recruitment:create'), createCandidate);
router.put('/candidates/:id', protect, requirePermission('recruitment:update'), updateCandidate);
router.delete('/candidates/:id', protect, requirePermission('recruitment:delete'), deleteCandidate);

module.exports = router;
