import { useState, useEffect } from 'react';
import { jobAPI, applicationAPI } from '../services/api';
import JobApplicationModal from './JobApplicationModal';


const styles = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes slideIn {
    from { opacity: 0; transform: translateX(-30px); }
    to { opacity: 1; transform: translateX(0); }
  }
  
  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }
  
  @keyframes bounce {
    0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
    40% { transform: translateY(-10px); }
    60% { transform: translateY(-5px); }
  }
  
  .animate-fadeIn {
    animation: fadeIn 0.6s ease-out forwards;
  }
  
  .animate-slideIn {
    animation: slideIn 0.5s ease-out forwards;
  }
  
  .animate-pulse-subtle {
    animation: pulse 2s infinite;
  }
  
  .animate-bounce-subtle {
    animation: bounce 2s infinite;
  }
  
  .job-card {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    transform: translateY(0);
  }
  
  .job-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  }
  
  .jobby-logo {
    transition: all 0.3s ease;
  }
  
  .jobby-logo:hover {
    transform: scale(1.05) rotate(5deg);
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

const JobSeekerDashboard = ({ onNavigateHome }) => {
  const [activeTab, setActiveTab] = useState('jobs');
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [jobSource, setJobSource] = useState('local'); // 'local' or 'remote'
  const [filters, setFilters] = useState({
    category: '',
    location: '',
    employmentType: '',
    jobType: ''
  });

  // Helper function to calculate time ago
  const getTimeAgo = (dateString) => {
    const now = new Date();
    const posted = new Date(dateString);
    const diffTime = Math.abs(now - posted);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffTime / (1000 * 60));
        return diffMinutes <= 1 ? 'Just now' : `${diffMinutes} minutes ago`;
      }
      return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
    } else if (diffDays === 1) {
      return '1 day ago';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
    } else {
      const months = Math.floor(diffDays / 30);
      return months === 1 ? '1 month ago' : `${months} months ago`;
    }
  };

  useEffect(() => {
    if (activeTab === 'jobs') {
      if (jobSource === 'local') {
        fetchJobs();
      } else {
        fetchRemoteJobs();
      }
    } else if (activeTab === 'applications') {
      fetchApplications();
    }
  }, [activeTab, searchTerm, filters, jobSource]);

  
  useEffect(() => {
    if (activeTab === 'jobs' && jobSource === 'local') {
      const interval = setInterval(() => {
        fetchJobs();
      }, 30000); 

     
      const handleJobPosted = () => {
        console.log('New job posted, refreshing job list...');
        fetchJobs();
      };

      window.addEventListener('jobPosted', handleJobPosted);

      return () => {
        clearInterval(interval);
        window.removeEventListener('jobPosted', handleJobPosted);
      };
    }
  }, [activeTab, jobSource]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const params = {
        search: searchTerm || undefined,
        category: filters.category || undefined,
        location: filters.location || undefined,
        employmentType: filters.employmentType || undefined,
        jobType: filters.jobType || undefined,
        limit: 50,
        page: 1
      };
      
      // Remove undefined values
      Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);
      
      console.log('Fetching jobs with params:', params);
      const response = await jobAPI.getAllJobs(params);
      console.log('Full API response:', response);
      
      // The response should have a jobs array
      if (response && response.jobs && Array.isArray(response.jobs)) {
        console.log('Jobs received:', response.jobs.length, response.jobs);
        
        const formattedJobs = response.jobs.map(job => ({
          _id: job._id,
          title: job.title,
          company: job.company,
          location: job.location,
          salary: job.salary,
          employmentType: job.employmentType,
          jobType: job.jobType,
          description: job.description,
          requirements: job.requirements || [],
          responsibilities: job.responsibilities || [],
          skills: job.skills || [],
          benefits: job.benefits || [],
          postedAgo: job.createdAt ? getTimeAgo(job.createdAt) : 'Recently posted',
          applications: job.applicationsCount || 0,
          views: job.viewsCount || 0,
          status: job.isActive ? 'active' : 'inactive',
          category: job.category
        }));

        setJobs(formattedJobs);
      } else {
        console.error('Invalid response format:', response);
        setJobs([]);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchRemoteJobs = async () => {
    try {
      setLoading(true);
      const searchQuery = searchTerm || 'developer';
      const category = filters.category || '';
      

      const response = await fetch(
        `http://localhost:5000/api/remotive-jobs?search=${encodeURIComponent(searchQuery)}${category ? `&category=${encodeURIComponent(category)}` : ''}&limit=30`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch remote jobs');
      }

      const data = await response.json();
      const remoteJobs = data.jobs || [];
      

      const formattedJobs = remoteJobs.map(job => ({
        _id: `remote_${job.id}`,
        title: job.title,
        company: job.company_name,
        location: job.candidate_required_location || 'Remote • Worldwide',
        salary: job.salary || 'Competitive salary',
        employmentType: job.job_type || 'Full-time',
        jobType: 'Remote',
        description: job.description?.replace(/<[^>]*>/g, '') || 'No description available',
        requirements: [],
        responsibilities: [],
        skills: [],
        benefits: [],
        postedAgo: job.publication_date ? getTimeAgo(job.publication_date) : 'Recently posted',
        applications: Math.floor(Math.random() * 50),
        views: Math.floor(Math.random() * 500),
        status: 'active',
        category: job.category || 'Technology',
        isRemote: true,
        originalUrl: job.url,
        companyLogo: job.company_logo
      }));

      setJobs(formattedJobs);
    } catch (error) {
      console.error('Error fetching remote jobs:', error);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await applicationAPI.getMyApplications({ limit: 20 });
      setApplications(response.applications || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
      setApplications([
        {
          _id: '1',
          job: {
            title: 'Frontend Developer',
            company: 'Tech Solutions',
            location: { city: 'Delhi', state: 'Delhi' }
          },
          status: 'under-review',
          appliedAgo: '3 days ago'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (jobSource === 'local') {
      fetchJobs();
    } else {
      fetchRemoteJobs();
    }
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      location: '',
      employmentType: '',
      jobType: ''
    });
    setSearchTerm('');
  };

  const handleApplyJob = (job) => {
    setSelectedJob(job);
    setShowApplicationModal(true);
  };

  const handleApplicationSuccess = () => {
    setShowApplicationModal(false);
    setSelectedJob(null);
    fetchApplications(); // Refresh applications
  };

  const applyToJob = async (jobId) => {
    try {
      await applicationAPI.applyForJob(jobId, {
        coverLetter: 'I am interested in this position...'
      });
      alert('Application submitted successfully!');
    } catch (error) {
      console.error('Error applying:', error);
      alert('Error submitting application');
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Hero Header */}
      <div className="bg-linear-to-r from-blue-600 via-purple-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex justify-between items-center">
            {/* Jobby Logo and Navigation */}
            <div className="flex items-center gap-6">
              <button 
                onClick={onNavigateHome}
                className="jobby-logo flex items-center space-x-3 group cursor-pointer"
                title="Back to Homepage"
              >
                <div className="w-12 h-12 bg-linear-to-r from-purple-400 to-pink-400 rounded-xl flex items-center justify-center group-hover:shadow-lg transition-all duration-300">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold bg-linear-to-r from-white to-blue-100 bg-clip-text text-transparent group-hover:from-purple-200 group-hover:to-pink-200 transition-all duration-300">
                    Jobby
                  </h2>
                  <p className="text-blue-100 text-sm group-hover:text-purple-200 transition-colors duration-300">Job Portal Platform</p>
                </div>
              </button>
              
              <div className="h-8 w-px bg-white/20"></div>
              
              <div>
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center animate-bounce-subtle">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h1 className="text-3xl font-bold bg-linear-to-r from-white to-blue-100 bg-clip-text animate-slideIn">
                    Find Your Dream Job
                  </h1>
                </div>
                <p className="text-blue-100 text-lg animate-fadeIn">Discover opportunities that match your skills and passion</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* Job Source Toggle */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-1 border border-white/20">
                <div className="flex items-center">
                  <button
                    onClick={() => setJobSource('local')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      jobSource === 'local'
                        ? 'bg-white text-blue-600 shadow-md'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    Local Jobs
                  </button>
                  <button
                    onClick={() => setJobSource('remote')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      jobSource === 'remote'
                        ? 'bg-white text-blue-600 shadow-md'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    Remote Jobs
                  </button>
                </div>
              </div>

              <button
                onClick={jobSource === 'local' ? fetchJobs : fetchRemoteJobs}
                disabled={loading}
                className="group px-6 py-3 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white rounded-xl font-medium transition-all duration-300 flex items-center space-x-2 border border-white/20"
              >
                <svg className={`w-5 h-5 ${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>{loading ? 'Refreshing...' : 'Refresh Jobs'}</span>
              </button>
              <div className="bg-white/10 backdrop-blur-sm px-4 py-3 rounded-xl border border-white/20">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{jobs.length}</div>
                  <div className="text-blue-100 text-sm">
                    {jobSource === 'local' ? 'local jobs' : 'remote jobs'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-10">
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-2">
          <nav className="flex">
            {[
              { id: 'jobs', label: 'Browse Jobs', icon: '🔍', gradient: 'from-blue-500 to-cyan-500' },
              { id: 'applications', label: 'My Applications', icon: '📋', gradient: 'from-purple-500 to-pink-500' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-4 px-6 rounded-xl font-medium text-sm transition-all duration-300 flex items-center justify-center space-x-2 ${
                  activeTab === tab.id
                    ? `bg-gradient-to-r ${tab.gradient} text-white shadow-lg transform scale-105`
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'jobs' && (
          <div className="space-y-8">
            {/* Enhanced Search and Filters */}
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">🔍 Find Your Perfect Job</h2>
                <p className="text-gray-600">Discover opportunities tailored to your skills and preferences</p>
              </div>
              
              <form onSubmit={handleSearch} className="space-y-6">
                {/* Main Search Bar */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search by job title, company, or skills (e.g. React Developer, Google, JavaScript)..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-11 pr-32 py-4 text-lg border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-2 bottom-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center gap-2"
                  >
                    <span>Search</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>
                </div>

                {/* Advanced Filters */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">📂 Category</label>
                    <select
                      value={filters.category}
                      onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                    >
                      <option value="">All Categories</option>
                      <option value="software-development">💻 Software Development</option>
                      <option value="data-science">📊 Data Science</option>
                      <option value="design">🎨 Design</option>
                      <option value="marketing">📢 Marketing</option>
                      <option value="finance">💰 Finance</option>
                      <option value="healthcare">🏥 Healthcare</option>
                      <option value="education">🎓 Education</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">📍 Location</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        placeholder="City, State"
                        value={filters.location}
                        onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">⏰ Employment Type</label>
                    <select
                      value={filters.employmentType}
                      onChange={(e) => setFilters({ ...filters, employmentType: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                    >
                      <option value="">All Types</option>
                      <option value="full-time">Full Time</option>
                      <option value="part-time">Part Time</option>
                      <option value="contract">Contract</option>
                      <option value="internship">Internship</option>
                      <option value="freelance">Freelance</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">🏢 Work Type</label>
                    <select
                      value={filters.jobType}
                      onChange={(e) => setFilters({ ...filters, jobType: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                    >
                      <option value="">All Locations</option>
                      <option value="remote">🏠 Remote</option>
                      <option value="on-site">🏢 On-site</option>
                      <option value="hybrid">🔄 Hybrid</option>
                    </select>
                  </div>
                </div>

                {(searchTerm || Object.values(filters).some(v => v)) && (
                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <span>Clear all filters</span>
                    </button>
                  </div>
                )}
              </form>
            </div>

            {/* Job Listings */}
            {loading ? (
              <div className="flex justify-center py-16">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                    <svg className="w-8 h-8 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>
                  <p className="text-gray-600 font-medium">Finding amazing opportunities...</p>
                </div>
              </div>
            ) : jobs.length > 0 ? (
              <div className="grid gap-6">
                {jobs.map((job, index) => (
                  <div key={job._id} 
                       className="group bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 animate-fadeIn"
                       style={{ animationDelay: `${index * 100}ms` }}>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 bg-linear-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg overflow-hidden">
                          {job.companyLogo ? (
                            <img 
                              src={job.companyLogo} 
                              alt={job.company}
                              className="w-full h-full object-cover rounded-2xl"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <span className={`text-white font-bold text-xl ${job.companyLogo ? 'hidden' : 'block'}`}>
                            {(job.company || 'C').charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                              {job.title}
                            </h3>
                            {job.isRemote && (
                              <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded-full border border-green-200">
                                REMOTE
                              </span>
                            )}
                          </div>
                          <p className="text-lg text-gray-700 font-medium">{job.company}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <p className="text-gray-500">
                              {job.isRemote ? job.location : `${job.location?.city}, ${job.location?.state}`}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-xl shadow-lg">
                          <p className="text-lg font-bold">
                            {job.isRemote 
                              ? job.salary 
                              : (job.salary?.min && job.salary?.max 
                                ? `₹${(job.salary.min/100000).toFixed(1)}L - ₹${(job.salary.max/100000).toFixed(1)}L`
                                : 'Negotiable')
                            }
                          </p>
                        </div>
                        <div className="flex justify-end space-x-2 mt-3">
                          <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full border border-blue-200">
                            {job.employmentType?.replace('-', ' ').toUpperCase()}
                          </span>
                          <span className="bg-purple-100 text-purple-700 text-xs font-semibold px-3 py-1 rounded-full border border-purple-200">
                            {job.jobType?.replace('-', ' ').toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mb-4 line-clamp-2 leading-relaxed">{job.description}</p>
                    
                    {/* Skills */}
                    {job.skills && job.skills.length > 0 && (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-2">
                          {job.skills.slice(0, 4).map((skill, skillIndex) => (
                            <span key={skillIndex} className="bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 text-xs font-medium px-3 py-1 rounded-full border border-indigo-200">
                              {skill}
                            </span>
                          ))}
                          {job.skills.length > 4 && (
                            <span className="text-gray-500 text-xs font-medium px-3 py-1">
                              +{job.skills.length - 4} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Posted {job.postedAgo}</span>
                      </div>
                      <button 
                        onClick={() => job.isRemote ? window.open(job.originalUrl, '_blank') : handleApplyJob(job)}
                        className="group bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2"
                      >
                        <span>{job.isRemote ? 'View Job' : 'Apply Now'}</span>
                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-linear-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 p-16 text-center">
                <div className="w-24 h-24 bg-linear-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">No Jobs Found</h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  We couldn't find any jobs matching your criteria. Try adjusting your filters or check back later for new opportunities.
                </p>
                <button
                  onClick={clearFilters}
                  className="bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  🗑️ Clear All Filters
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'applications' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">My Applications</h2>
                <p className="text-gray-600 mt-1">Track your job application progress</p>
              </div>
              <div className="bg-blue-50 px-4 py-2 rounded-lg">
                <span className="text-blue-600 font-semibold text-lg">{applications.length}</span>
                <span className="text-blue-600 text-sm ml-1">
                  {applications.length === 1 ? 'application' : 'applications'}
                </span>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-16">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading your applications...</p>
                </div>
              </div>
            ) : applications.length > 0 ? (
              <div className="space-y-4">
                {applications.map(application => (
                  <div key={application._id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                              <span className="text-white font-bold text-lg">
                                {(application.job.company || 'C').charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <h3 className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                                {application.job.title}
                              </h3>
                              <p className="text-gray-600 font-medium">{application.job.company}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-6 text-sm text-gray-500 mb-3">
                            <div className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <span>{application.job.location?.city}, {application.job.location?.state}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span>Applied {application.appliedAgo}</span>
                            </div>
                            {application.job.employmentType && (
                              <div className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0v2a2 2 0 002 2M8 6v2a2 2 0 002 2m0 0h4m-4 0a2 2 0 00-2 2v4a2 2 0 002 2h4a2 2 0 002-2v-4a2 2 0 00-2-2" />
                                </svg>
                                <span className="capitalize">{application.job.employmentType.replace('-', ' ')}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-right ml-4">
                          <span className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium ${
                            application.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                            application.status === 'under-review' ? 'bg-yellow-100 text-yellow-800' :
                            application.status === 'shortlisted' ? 'bg-green-100 text-green-800' :
                            application.status === 'interview-scheduled' ? 'bg-purple-100 text-purple-800' :
                            application.status === 'selected' ? 'bg-emerald-100 text-emerald-800' :
                            application.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {application.status === 'submitted' && '📤'}
                            {application.status === 'under-review' && '👀'}
                            {application.status === 'shortlisted' && '⭐'}
                            {application.status === 'interview-scheduled' && '📅'}
                            {application.status === 'selected' && '🎉'}
                            {application.status === 'rejected' && '❌'}
                            {application.status === 'withdrawn' && '↩️'}
                            <span className="capitalize">
                              {application.status.replace('-', ' ')}
                            </span>
                          </span>
                        </div>
                      </div>

                      {/* Job details */}
                      {application.job.salary && (
                        <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg mt-4">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                            <span>
                              ₹{application.job.salary.min?.toLocaleString()} - ₹{application.job.salary.max?.toLocaleString()}
                            </span>
                          </div>
                          {application.job.jobType && (
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                              <span className="capitalize">{application.job.jobType.replace('-', ' ')}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Action button */}
                      <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                        <div className="text-xs text-gray-400">
                          Application ID: {application._id?.slice(-8)}
                        </div>
                        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors">
                          View Details →
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-12 text-center">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">No Applications Yet</h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  Ready to take the next step in your career? Start exploring amazing job opportunities and submit your first application.
                </p>
                <button
                  onClick={() => setActiveTab('jobs')}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  🔍 Browse Jobs
                </button>
              </div>
            )}
          </div>
        )}


      </div>

      {/* Job Application Modal */}
      <JobApplicationModal 
        job={selectedJob}
        isOpen={showApplicationModal}
        onClose={() => setShowApplicationModal(false)}
        onApplicationSuccess={handleApplicationSuccess}
      />
    </div>
  );
};

export default JobSeekerDashboard;