const express = require('express');
const router = express.Router();

// Simple rate limiting cache
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 5000; // 5 seconds between requests (more lenient)

// Mock job data as fallback
const getMockJobs = (searchQuery = '', locationQuery = '', limit = 20) => {
  const mockJobs = [
    {
      id: 1,
      title: 'Senior Software Engineer',
      company_name: 'TechCorp',
      company_logo: 'https://via.placeholder.com/50',
      category: 'Software Development',
      job_type: 'Full-time',
      publication_date: new Date().toISOString(),
      candidate_required_location: 'Remote, USA',
      salary: '$80,000 - $120,000',
      description: 'Join our team as a Senior Software Engineer working on cutting-edge web applications.',
      url: '#',
      tags: ['JavaScript', 'React', 'Node.js']
    },
    {
      id: 2,
      title: 'Frontend Developer',
      company_name: 'WebStudio',
      company_logo: 'https://via.placeholder.com/50',
      category: 'Software Development',
      job_type: 'Full-time',
      publication_date: new Date().toISOString(),
      candidate_required_location: 'Remote, Europe',
      salary: '$60,000 - $90,000',
      description: 'Looking for a talented Frontend Developer to build amazing user interfaces.',
      url: '#',
      tags: ['React', 'TypeScript', 'CSS']
    },
    {
      id: 3,
      title: 'DevOps Engineer',
      company_name: 'CloudTech',
      company_logo: 'https://via.placeholder.com/50',
      category: 'DevOps',
      job_type: 'Full-time',
      publication_date: new Date().toISOString(),
      candidate_required_location: 'Remote, Bangalore',
      salary: '$90,000 - $130,000',
      description: 'Help us build and maintain scalable cloud infrastructure.',
      url: '#',
      tags: ['AWS', 'Docker', 'Kubernetes']
    },
    {
      id: 4,
      title: 'Python Developer',
      company_name: 'DataFlow',
      company_logo: 'https://via.placeholder.com/50',
      category: 'Software Development',
      job_type: 'Full-time',
      publication_date: new Date().toISOString(),
      candidate_required_location: 'Remote, India',
      salary: '$70,000 - $100,000',
      description: 'Join our data engineering team to build robust data pipelines.',
      url: '#',
      tags: ['Python', 'Django', 'PostgreSQL']
    },
    {
      id: 5,
      title: 'Full Stack Developer',
      company_name: 'StartupHub',
      company_logo: 'https://via.placeholder.com/50',
      category: 'Software Development',
      job_type: 'Full-time',
      publication_date: new Date().toISOString(),
      candidate_required_location: 'Remote, Worldwide',
      salary: '$65,000 - $95,000',
      description: 'Work across the entire stack in our fast-paced startup environment.',
      url: '#',
      tags: ['JavaScript', 'Node.js', 'MongoDB']
    },
    {
      id: 6,
      title: 'Mobile App Developer',
      company_name: 'MobileFirst',
      company_logo: 'https://via.placeholder.com/50',
      category: 'Mobile Development',
      job_type: 'Full-time',
      publication_date: new Date().toISOString(),
      candidate_required_location: 'Remote, Bangalore',
      salary: '$75,000 - $110,000',
      description: 'Create amazing mobile experiences for iOS and Android platforms.',
      url: '#',
      tags: ['React Native', 'iOS', 'Android']
    },
    {
      id: 7,
      title: 'Data Scientist',
      company_name: 'AnalyticsAI',
      company_logo: 'https://via.placeholder.com/50',
      category: 'Data Science',
      job_type: 'Full-time',
      publication_date: new Date().toISOString(),
      candidate_required_location: 'Remote, USA/Europe',
      salary: '$85,000 - $125,000',
      description: 'Use machine learning to solve complex business problems.',
      url: '#',
      tags: ['Python', 'Machine Learning', 'TensorFlow']
    },
    {
      id: 8,
      title: 'UI/UX Designer',
      company_name: 'DesignLab',
      company_logo: 'https://via.placeholder.com/50',
      category: 'Design',
      job_type: 'Full-time',
      publication_date: new Date().toISOString(),
      candidate_required_location: 'Remote, India',
      salary: '$55,000 - $85,000',
      description: 'Design beautiful and intuitive user experiences.',
      url: '#',
      tags: ['Figma', 'Adobe XD', 'User Research']
    }
  ];

  // Filter jobs based on search query
  let filteredJobs = mockJobs;
  
  if (searchQuery && searchQuery.trim()) {
    const query = searchQuery.toLowerCase().trim();
    filteredJobs = filteredJobs.filter(job => 
      job.title.toLowerCase().includes(query) ||
      job.company_name.toLowerCase().includes(query) ||
      job.category.toLowerCase().includes(query) ||
      job.tags.some(tag => tag.toLowerCase().includes(query))
    );
  }
  
  // Filter jobs based on location query
  if (locationQuery && locationQuery.trim()) {
    const locQuery = locationQuery.toLowerCase().trim();
    filteredJobs = filteredJobs.filter(job => {
      const location = job.candidate_required_location.toLowerCase();
      return location.includes(locQuery) || 
             location.includes('remote') || 
             location.includes('worldwide');
    });
  }

  return filteredJobs.slice(0, parseInt(limit) || 20);
};

// Alternative APIs to try
const alternativeApis = [
  {
    name: 'Remotive.io',
    url: (params) => `https://remotive.io/api/remote-jobs?${params}`,
    transform: (data) => ({ jobs: data.jobs || [], total: data['job-count'] || 0 })
  },
  {
    name: 'Remotive.com',
    url: (params) => `https://remotive.com/api/remote-jobs?${params}`,
    transform: (data) => ({ jobs: data.jobs || [], total: data['job-count'] || 0 })
  }
];

// GET /api/remotive-jobs - Robust job fetching with fallbacks
router.get('/remotive-jobs', async (req, res) => {
  try {
    // More lenient rate limiting
    const now = Date.now();
    if (now - lastRequestTime < MIN_REQUEST_INTERVAL) {
      // Instead of blocking, return cached/mock data
      console.log('Rate limited, returning mock data');
      const mockJobs = getMockJobs(req.query.search, req.query.location, req.query.limit);
      return res.json({
        jobs: mockJobs,
        total: mockJobs.length,
        source: 'cached',
        message: 'Showing cached results due to rate limiting'
      });
    }

    const { search, location, category, company_name, limit = 20 } = req.query;
    
    // Build query parameters
    const params = new URLSearchParams();
    if (search && search.trim()) {
      params.append('search', search.trim());
    }
    if (location && location.trim()) {
      params.append('location', location.trim());
    }
    if (category) params.append('category', category);
    if (company_name) params.append('company_name', company_name);
    
    const limitValue = Math.min(Math.max(parseInt(limit) || 20, 1), 50);
    params.append('limit', limitValue);

    // Try alternative APIs one by one
    for (const api of alternativeApis) {
      try {
        const url = api.url(params.toString());
        console.log(`Trying ${api.name}:`, url);

        const fetch = (await import('node-fetch')).default;
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; Jobby-App/1.0.0)',
            'Accept': 'application/json'
          },
          timeout: 10000 // 10 second timeout
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log(`${api.name} success:`, data['job-count'] || data.jobs?.length || 'unknown count');
          
          lastRequestTime = now;
          const transformedResponse = api.transform(data);
          transformedResponse.source = api.name;
          
          return res.json(transformedResponse);
        } else {
          console.log(`${api.name} failed:`, response.status, response.statusText);
        }
      } catch (apiError) {
        console.log(`${api.name} error:`, apiError.message);
        continue; // Try next API
      }
    }

    // If all APIs fail, return mock data
    console.log('All APIs failed, returning mock data');
    const mockJobs = getMockJobs(search, location, limitValue);
    
    const transformedResponse = {
      jobs: mockJobs,
      total: mockJobs.length,
      source: 'mock',
      message: 'External job services unavailable. Showing sample opportunities.'
    };

    res.json(transformedResponse);
    
  } catch (error) {
    console.error('Unexpected error in job fetching:', error);
    
    // As a final fallback, always return mock data
    const { search, location, limit = 20 } = req.query;
    const mockJobs = getMockJobs(search, location, limit);
    
    res.json({
      jobs: mockJobs,
      total: mockJobs.length,
      source: 'fallback',
      message: 'Service temporarily unavailable. Showing sample opportunities.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;