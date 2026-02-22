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

// Employer routes (protected)
router.get(
  '/employer/my-jobs',
  authenticateToken,
  authorizeRoles('employer'),
  getMyJobs
);

router.get(
  '/employer/stats',
  authenticateToken,
  authorizeRoles('employer'),
  getJobStats
);

router.post('/', authenticateToken, authorizeRoles('employer'), createJob);
router.put('/:id', authenticateToken, authorizeRoles('employer'), updateJob);
router.delete('/:id', authenticateToken, authorizeRoles('employer'), deleteJob);

// Public job detail route (defined last so it doesn't capture employer paths)
router.get('/:id', getJobById);

module.exports = router;