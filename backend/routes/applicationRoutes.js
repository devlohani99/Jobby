const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {
  applyForJob,
  getJobApplications,
  getMyApplications,
  updateApplicationStatus,
  getApplicationById,
  withdrawApplication,
  getApplicationStats
} = require('../controllers/applicationController');
const { authenticateToken } = require('../middleware/authenticateToken');
const { authorizeRoles } = require('../middleware/authorizeRoles');

// Configure multer for file uploads
const uploadDir = path.join(__dirname, '..', 'uploads', 'resumes');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${req.user.id}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF and DOC/DOCX files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// All routes require authentication
router.use(authenticateToken);

// Job seeker routes
router.post('/apply/:jobId', authorizeRoles('jobseeker'), upload.single('resume'), applyForJob);
router.get('/my-applications', authorizeRoles('jobseeker'), getMyApplications);
router.patch('/withdraw/:applicationId', authorizeRoles('jobseeker'), withdrawApplication);

// Employer routes
router.get('/job/:jobId', authorizeRoles('employer'), getJobApplications);
router.patch('/status/:applicationId', authorizeRoles('employer'), updateApplicationStatus);
router.get('/stats/:jobId', authorizeRoles('employer'), getApplicationStats);

// Shared routes
router.get('/:applicationId', getApplicationById);

module.exports = router;