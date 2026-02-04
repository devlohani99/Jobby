const Application = require('../model/Application');
const Job = require('../model/Job');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs').promises;

// Apply for a job (Job seekers only)
exports.applyForJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { coverLetter, salaryExpectation, profileData } = req.body;

    // Check if this is a remote job (should not be applied for through our system)
    if (jobId.startsWith('remote_')) {
      return res.status(400).json({
        success: false,
        message: 'Remote jobs should be applied for directly on the company website'
      });
    }

    // Check if job exists and is active
    const job = await Job.findById(jobId);
    if (!job || !job.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Job not found or no longer active'
      });
    }

    // Check if user already applied
    const existingApplication = await Application.findOne({
      job: jobId,
      applicant: req.user.id
    });

    if (existingApplication) {
      return res.status(409).json({
        success: false,
        message: 'You have already applied for this job'
      });
    }

    // Create application
    const applicationData = {
      job: jobId,
      applicant: req.user.id,
      coverLetter,
      salaryExpectation,
      profileData: profileData || {}
    };

    // Handle resume upload if present
    if (req.file) {
      applicationData.resume = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        path: req.file.path,
        size: req.file.size,
        mimetype: req.file.mimetype
      };
    }

    const application = new Application(applicationData);
    await application.save();

    // Increment job application count
    await Job.findByIdAndUpdate(jobId, { $inc: { applicationsCount: 1 } });

    // Populate job details for response
    await application.populate('job', 'title company');

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      application
    });
  } catch (error) {
    console.error('Error applying for job:', error);
    
    // Clean up uploaded file if error occurs
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting file:', unlinkError);
      }
    }

    res.status(500).json({
      success: false,
      message: 'Failed to submit application'
    });
  }
};

// Get applications for a specific job (Employers only)
exports.getJobApplications = async (req, res) => {
  try {
    const { jobId } = req.params;
    const {
      page = 1,
      limit = 10,
      status = 'all',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Verify job exists and user owns it
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    if (job.postedBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view applications for this job'
      });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const filter = { job: jobId };

    if (status !== 'all') {
      filter.status = status;
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const applications = await Application.find(filter)
      .populate('applicant', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Application.countDocuments(filter);

    res.json({
      success: true,
      applications,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        total,
        hasNext: skip + applications.length < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Error fetching job applications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch applications'
    });
  }
};

// Get user's applications (Job seekers only)
exports.getMyApplications = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status = 'all',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const filter = { applicant: req.user.id };

    if (status !== 'all') {
      filter.status = status;
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const applications = await Application.find(filter)
      .populate('job', 'title company location salary employmentType')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Application.countDocuments(filter);

    res.json({
      success: true,
      applications,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        total,
        hasNext: skip + applications.length < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Error fetching my applications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch your applications'
    });
  }
};

// Update application status (Employers only)
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status, notes, interviewDetails, feedback } = req.body;

    const application = await Application.findById(applicationId)
      .populate('job', 'postedBy title');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check if user owns the job
    if (application.job.postedBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this application'
      });
    }

    // Update status
    if (status) {
      application.status = status;
      application.timeline.push({
        status,
        date: new Date(),
        notes
      });
    }

    // Update interview details if provided
    if (interviewDetails && status === 'interview-scheduled') {
      application.interviewDetails = interviewDetails;
    }

    // Update feedback if provided
    if (feedback) {
      application.feedback = feedback;
    }

    await application.save();

    res.json({
      success: true,
      message: 'Application status updated successfully',
      application
    });
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update application status'
    });
  }
};

// Get single application details
exports.getApplicationById = async (req, res) => {
  try {
    const { applicationId } = req.params;

    const application = await Application.findById(applicationId)
      .populate('job', 'title company location salary')
      .populate('applicant', 'name email')
      .lean();

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check authorization
    const isOwner = application.applicant._id.toString() === req.user.id;
    const isEmployer = application.job.postedBy && application.job.postedBy.toString() === req.user.id;

    if (!isOwner && !isEmployer) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this application'
      });
    }

    res.json({
      success: true,
      application
    });
  } catch (error) {
    console.error('Error fetching application:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch application'
    });
  }
};

// Withdraw application (Job seekers only)
exports.withdrawApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;

    const application = await Application.findById(applicationId);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check if user owns the application
    if (application.applicant.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to withdraw this application'
      });
    }

    // Check if application can be withdrawn
    if (['selected', 'rejected'].includes(application.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot withdraw application at this stage'
      });
    }

    // Update status to withdrawn
    application.status = 'withdrawn';
    application.timeline.push({
      status: 'withdrawn',
      date: new Date(),
      notes: 'Application withdrawn by candidate'
    });

    await application.save();

    // Decrement job application count
    await Job.findByIdAndUpdate(application.job, { $inc: { applicationsCount: -1 } });

    res.json({
      success: true,
      message: 'Application withdrawn successfully'
    });
  } catch (error) {
    console.error('Error withdrawing application:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to withdraw application'
    });
  }
};

// Get application statistics (for employer)
exports.getApplicationStats = async (req, res) => {
  try {
    const { jobId } = req.params;

    // Verify job ownership
    const job = await Job.findById(jobId);
    if (!job || job.postedBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const stats = await Application.aggregate([
      { $match: { job: mongoose.Types.ObjectId(jobId) } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Convert to object with default values
    const statusCounts = {
      submitted: 0,
      'under-review': 0,
      shortlisted: 0,
      'interview-scheduled': 0,
      interviewed: 0,
      selected: 0,
      rejected: 0,
      withdrawn: 0
    };

    stats.forEach(stat => {
      statusCounts[stat._id] = stat.count;
    });

    const total = Object.values(statusCounts).reduce((sum, count) => sum + count, 0);

    res.json({
      success: true,
      stats: {
        total,
        byStatus: statusCounts
      }
    });
  } catch (error) {
    console.error('Error fetching application stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch application statistics'
    });
  }
};