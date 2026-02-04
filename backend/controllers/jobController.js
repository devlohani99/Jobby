const Job = require('../model/Job');
const Application = require('../model/Application');
const mongoose = require('mongoose');

// Create a new job (Employers only)
exports.createJob = async (req, res) => {
  try {
    const jobData = {
      ...req.body,
      postedBy: req.user.id
    };

    const job = new Job(jobData);
    await job.save();

    res.status(201).json({
      success: true,
      message: 'Job posted successfully',
      job
    });
  } catch (error) {
    console.error('Error creating job:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create job'
    });
  }
};

// Get all jobs with filtering and search
exports.getAllJobs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      category,
      location,
      employmentType,
      jobType,
      minSalary,
      maxSalary,
      experience,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build filter object
    const filter = { isActive: true };

    if (search) {
      filter.$text = { $search: search };
    }

    if (category) {
      filter.category = category;
    }

    if (location) {
      filter.$or = [
        { 'location.city': new RegExp(location, 'i') },
        { 'location.state': new RegExp(location, 'i') }
      ];
    }

    if (employmentType) {
      filter.employmentType = employmentType;
    }

    if (jobType) {
      filter.jobType = jobType;
    }

    if (minSalary || maxSalary) {
      filter['salary.min'] = {};
      if (minSalary) filter['salary.min'].$gte = parseInt(minSalary);
      if (maxSalary) filter['salary.max'].$lte = parseInt(maxSalary);
    }

    if (experience) {
      filter['experience.min'] = { $lte: parseInt(experience) };
    }

    // Build sort object
    const sort = {};
    if (search && !sortBy) {
      sort.score = { $meta: 'textScore' };
    } else {
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    }

    const jobs = await Job.find(filter)
      .populate('postedBy', 'name')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Job.countDocuments(filter);

    res.json({
      success: true,
      jobs,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        total,
        hasNext: skip + jobs.length < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch jobs'
    });
  }
};

// Get single job by ID
exports.getJobById = async (req, res) => {
  try {
    const jobId = req.params.id;
    
    // Check if this is a remote job ID (starts with "remote_" or is just "remote")
    if (jobId.startsWith('remote_') || jobId === 'remote') {
      return res.status(400).json({
        success: false,
        message: 'Remote jobs should be accessed directly via their original URL'
      });
    }

    // Validate if jobId is a valid ObjectId format
    if (!jobId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid job ID format'
      });
    }

    const job = await Job.findById(jobId)
      .populate('postedBy', 'name email')
      .lean();

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Increment view count
    await Job.findByIdAndUpdate(jobId, { $inc: { viewsCount: 1 } });

    res.json({
      success: true,
      job: {
        ...job,
        viewsCount: job.viewsCount + 1
      }
    });
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch job'
    });
  }
};

// Update job (Employers only)
exports.updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check if user owns the job
    if (job.postedBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this job'
      });
    }

    const updatedJob = await Job.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('postedBy', 'name');

    res.json({
      success: true,
      message: 'Job updated successfully',
      job: updatedJob
    });
  } catch (error) {
    console.error('Error updating job:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update job'
    });
  }
};

// Delete job (Employers only)
exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check if user owns the job
    if (job.postedBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this job'
      });
    }

    // Soft delete - just mark as inactive
    await Job.findByIdAndUpdate(req.params.id, { isActive: false });

    res.json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete job'
    });
  }
};

// Get jobs posted by current employer
exports.getMyJobs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status = 'all'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const filter = { postedBy: req.user.id };

    if (status === 'active') {
      filter.isActive = true;
    } else if (status === 'inactive') {
      filter.isActive = false;
    }

    const jobs = await Job.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Job.countDocuments(filter);

    // Get application counts for each job
    const jobsWithStats = await Promise.all(
      jobs.map(async (job) => {
        const applicationCount = await Application.countDocuments({ job: job._id });
        return {
          ...job,
          applicationCount
        };
      })
    );

    res.json({
      success: true,
      jobs: jobsWithStats,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        total,
        hasNext: skip + jobs.length < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Error fetching my jobs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch your jobs'
    });
  }
};

// Get job statistics (for employer dashboard)
exports.getJobStats = async (req, res) => {
  try {
    const employerId = req.user.id;

    const stats = await Job.aggregate([
      { $match: { postedBy: new mongoose.Types.ObjectId(employerId) } },
      {
        $group: {
          _id: null,
          totalJobs: { $sum: 1 },
          activeJobs: {
            $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
          },
          totalViews: { $sum: '$viewsCount' },
          totalApplications: { $sum: '$applicationsCount' }
        }
      }
    ]);

    const result = stats[0] || {
      totalJobs: 0,
      activeJobs: 0,
      totalViews: 0,
      totalApplications: 0
    };

    res.json({
      success: true,
      stats: result
    });
  } catch (error) {
    console.error('Error fetching job stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics'
    });
  }
};