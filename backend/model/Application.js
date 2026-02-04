const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  coverLetter: {
    type: String,
    maxLength: [2000, 'Cover letter cannot exceed 2000 characters']
  },
  profileData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  status: {
    type: String,
    enum: [
      'submitted',
      'under-review',
      'shortlisted',
      'interview-scheduled',
      'interviewed',
      'selected',
      'rejected',
      'withdrawn'
    ],
    default: 'submitted'
  },
  timeline: [{
    status: {
      type: String,
      enum: [
        'submitted',
        'under-review',
        'shortlisted',
        'interview-scheduled',
        'interviewed',
        'selected',
        'rejected',
        'withdrawn'
      ]
    },
    date: {
      type: Date,
      default: Date.now
    },
    notes: String
  }],
  interviewDetails: {
    date: Date,
    time: String,
    mode: {
      type: String,
      enum: ['in-person', 'video', 'phone'],
      default: 'video'
    },
    location: String,
    meetingLink: String,
    instructions: String
  },
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comments: String,
    strengths: [String],
    improvements: [String]
  },
  salaryExpectation: {
    amount: Number,
    currency: {
      type: String,
      default: 'INR',
      enum: ['INR', 'USD', 'EUR']
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound index to prevent duplicate applications
applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });
applicationSchema.index({ applicant: 1, status: 1 });
applicationSchema.index({ job: 1, status: 1 });
applicationSchema.index({ createdAt: -1 });

// Virtual for application age
applicationSchema.virtual('appliedAgo').get(function() {
  const now = new Date();
  const applied = new Date(this.createdAt);
  const diffTime = Math.abs(now - applied);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
});

// Pre-save middleware to update timeline
applicationSchema.pre('save', function(next) {
  // If status changed, add to timeline
  if (this.isModified('status')) {
    this.timeline.push({
      status: this.status,
      date: new Date()
    });
  }
  next();
});

// Static methods
applicationSchema.statics.getApplicationsByJob = function(jobId) {
  return this.find({ job: jobId })
    .populate('applicant', 'name email')
    .sort({ createdAt: -1 });
};

applicationSchema.statics.getApplicationsByApplicant = function(applicantId) {
  return this.find({ applicant: applicantId })
    .populate('job', 'title company location salary')
    .sort({ createdAt: -1 });
};

applicationSchema.statics.getApplicationStats = function(jobId) {
  return this.aggregate([
    { $match: { job: mongoose.Types.ObjectId(jobId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
};

// Instance methods
applicationSchema.methods.updateStatus = function(newStatus, notes = '') {
  this.status = newStatus;
  this.timeline.push({
    status: newStatus,
    date: new Date(),
    notes
  });
  return this.save();
};

applicationSchema.methods.scheduleInterview = function(interviewDetails) {
  this.status = 'interview-scheduled';
  this.interviewDetails = interviewDetails;
  this.timeline.push({
    status: 'interview-scheduled',
    date: new Date(),
    notes: `Interview scheduled for ${interviewDetails.date}`
  });
  return this.save();
};

applicationSchema.methods.addFeedback = function(feedback) {
  this.feedback = feedback;
  return this.save();
};

module.exports = mongoose.model('Application', applicationSchema);