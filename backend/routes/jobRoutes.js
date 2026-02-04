const express = require('express');
const router = express.Router();
const {
  createJob,
  getAllJobs,
  getJobById,
  updateJob,
  deleteJob,
  getMyJobs,
  getJobStats
} = require('../controllers/jobController');
const { authenticateToken } = require('../middleware/authenticateToken');
const { authorizeRoles } = require('../middleware/authorizeRoles');

// Public routes
router.get('/', getAllJobs);
router.get('/:id', getJobById);

// Protected routes
router.use(authenticateToken);

// Employer only routes
router.post('/', authorizeRoles('employer'), createJob);
router.put('/:id', authorizeRoles('employer'), updateJob);
router.delete('/:id', authorizeRoles('employer'), deleteJob);
router.get('/employer/my-jobs', authorizeRoles('employer'), getMyJobs);
router.get('/employer/stats', authorizeRoles('employer'), getJobStats);

module.exports = router;