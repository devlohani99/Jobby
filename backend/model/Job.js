const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true,
    maxLength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Job description is required'],
    maxLength: [5000, 'Description cannot exceed 5000 characters']
  },
  company: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true
  },
  location: {
    city: {
      type: String,
      required: true,
      trim: true
    },
    state: {
      type: String,
      required: true,
      trim: true
    },
    country: {
      type: String,
      required: true,
      default: 'India',
      trim: true
    },
    remote: {
      type: Boolean,
      default: false
    }
  },
  salary: {
    min: {
      type: Number,
      min: [0, 'Minimum salary cannot be negative'],
      default: 0
    },
    max: {
      type: Number,
      min: [0, 'Maximum salary cannot be negative'],
      default: 0
    },
    currency: {
      type: String,
      default: 'INR',
      enum: ['INR', 'USD', 'EUR']
    }
  },
  experience: {
    min: {
      type: Number,
      min: [0, 'Experience cannot be negative'],
      default: 0
    },
    max: {
      type: Number,
      min: [0, 'Experience cannot be negative']
    }
  },
  skills: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  employmentType: {
    type: String,
    required: true,
    enum: ['full-time', 'part-time', 'contract', 'internship', 'freelance'],
    default: 'full-time'
  },
  jobType: {
    type: String,
    required: true,
    enum: ['on-site', 'remote', 'hybrid'],
    default: 'on-site'
  },
  category: {
    type: String,
    required: true,
    enum: [
      'software-development',
      'data-science',
      'design',
      'marketing',
      'sales',
      'finance',
      'hr',
      'operations',
      'healthcare',
      'education',
      'manufacturing',
      'retail',
      'consulting',
      'legal',
      'media',
      'hospitality',
      'real-estate',
      'construction',
      'automotive',
      'other'
    ]
  },
  requirements: [{
    type: String,
    trim: true
  }],
  benefits: [{
    type: String,
    trim: true
  }],
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  applicationsCount: {
    type: Number,
    default: 0
  },
  viewsCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  deadline: {
    type: Date,
    validate: {
      validator: function(value) {
        return !value || value > new Date();
      },
      message: 'Application deadline should be in the future'
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
jobSchema.index({ title: 'text', description: 'text', skills: 'text' });
jobSchema.index({ 'location.city': 1, 'location.state': 1 });
jobSchema.index({ category: 1, employmentType: 1 });
jobSchema.index({ createdAt: -1 });
jobSchema.index({ postedBy: 1 });
jobSchema.index({ isActive: 1 });

// Virtual for job age
jobSchema.virtual('postedAgo').get(function() {
  const now = new Date();
  const posted = new Date(this.createdAt);
  const diffTime = Math.abs(now - posted);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
});

// Virtual for salary range
jobSchema.virtual('salaryRange').get(function() {
  if (!this.salary.min && !this.salary.max) return 'Not disclosed';
  if (this.salary.min && this.salary.max) {
    return `${this.salary.currency} ${this.salary.min.toLocaleString()} - ${this.salary.max.toLocaleString()}`;
  }
  if (this.salary.min) {
    return `${this.salary.currency} ${this.salary.min.toLocaleString()}+`;
  }
  return `Up to ${this.salary.currency} ${this.salary.max.toLocaleString()}`;
});

// Pre-save middleware
jobSchema.pre('save', function(next) {
  // Ensure skills are unique and clean
  if (this.skills) {
    this.skills = [...new Set(this.skills.filter(skill => skill.trim()))];
  }
  
  // Clean requirements and benefits
  if (this.requirements) {
    this.requirements = this.requirements.filter(req => req.trim());
  }
  if (this.benefits) {
    this.benefits = this.benefits.filter(benefit => benefit.trim());
  }
  
  next();
});

// Static methods
jobSchema.statics.findActiveJobs = function() {
  return this.find({ isActive: true });
};

jobSchema.statics.findByCategory = function(category) {
  return this.find({ category, isActive: true });
};

jobSchema.statics.searchJobs = function(query) {
  return this.find({
    $text: { $search: query },
    isActive: true
  }).sort({ score: { $meta: 'textScore' } });
};

// Instance methods
jobSchema.methods.incrementViews = function() {
  this.viewsCount += 1;
  return this.save();
};

jobSchema.methods.incrementApplications = function() {
  this.applicationsCount += 1;
  return this.save();
};

module.exports = mongoose.model('Job', jobSchema);