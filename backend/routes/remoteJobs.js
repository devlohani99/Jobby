const express = require('express');
const router = express.Router();

// Simple rate limiting cache
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 5000; // 5 seconds between requests (more lenient)

// Mock job data as fallback - comprehensive list with search-aware filtering
const getMockJobs = (searchQuery = '', locationQuery = '', limit = 20) => {
  const allMockJobs = [
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
      description: 'Join our team as a Senior Software Engineer working on cutting-edge web applications. Experience with React, Node.js, and cloud technologies required.',
      url: '#',
      tags: ['JavaScript', 'React', 'Node.js', 'Software', 'Engineer', 'Senior']
    },
    {
      id: 2,
      title: 'Teacher - Online Education Platform',
      company_name: 'EduTech Solutions',
      company_logo: 'https://via.placeholder.com/50',
      category: 'Education',
      job_type: 'Full-time',
      publication_date: new Date().toISOString(),
      candidate_required_location: 'Remote, Bangalore',
      salary: '$40,000 - $60,000',
      description: 'Passionate teacher wanted for our online education platform. Create engaging content and teach students worldwide.',
      url: '#',
      tags: ['Teacher', 'Education', 'Online', 'Content', 'Teaching']
    },
    {
      id: 3,
      title: 'Frontend Developer',
      company_name: 'WebStudio',
      company_logo: 'https://via.placeholder.com/50',
      category: 'Software Development',
      job_type: 'Full-time',
      publication_date: new Date().toISOString(),
      candidate_required_location: 'Remote, Europe',
      salary: '$60,000 - $90,000',
      description: 'Looking for a talented Frontend Developer to build amazing user interfaces with React and TypeScript.',
      url: '#',
      tags: ['React', 'TypeScript', 'CSS', 'Frontend', 'Developer', 'JavaScript']
    },
    {
      id: 4,
      title: 'DevOps Engineer',
      company_name: 'CloudTech',
      company_logo: 'https://via.placeholder.com/50',
      category: 'DevOps',
      job_type: 'Full-time',
      publication_date: new Date().toISOString(),
      candidate_required_location: 'Remote, Bangalore',
      salary: '$90,000 - $130,000',
      description: 'Help us build and maintain scalable cloud infrastructure using AWS, Docker, and Kubernetes.',
      url: '#',
      tags: ['AWS', 'Docker', 'Kubernetes', 'DevOps', 'Engineer', 'Cloud']
    },
    {
      id: 5,
      title: 'Mathematics Teacher',
      company_name: 'Global Learning Academy',
      company_logo: 'https://via.placeholder.com/50',
      category: 'Education',
      job_type: 'Part-time',
      publication_date: new Date().toISOString(),
      candidate_required_location: 'Remote, India',
      salary: '$30,000 - $45,000',
      description: 'Mathematics teacher for high school students. Strong background in algebra, calculus, and geometry required.',
      url: '#',
      tags: ['Mathematics', 'Teacher', 'Education', 'Math', 'Tutor', 'Academic']
    },
    {
      id: 6,
      title: 'Python Developer',
      company_name: 'DataFlow',
      company_logo: 'https://via.placeholder.com/50',
      category: 'Software Development',
      job_type: 'Full-time',
      publication_date: new Date().toISOString(),
      candidate_required_location: 'Remote, India',
      salary: '$70,000 - $100,000',
      description: 'Join our data engineering team to build robust data pipelines using Python, Django, and PostgreSQL.',
      url: '#',
      tags: ['Python', 'Django', 'PostgreSQL', 'Developer', 'Data', 'Backend']
    },
    {
      id: 7,
      title: 'English Teacher - Corporate Training',
      company_name: 'Language Masters',
      company_logo: 'https://via.placeholder.com/50',
      category: 'Education',
      job_type: 'Contract',
      publication_date: new Date().toISOString(),
      candidate_required_location: 'Remote, Bangalore',
      salary: '$35,000 - $50,000',
      description: 'English teacher specializing in corporate communication and business English training.',
      url: '#',
      tags: ['English', 'Teacher', 'Corporate', 'Training', 'Communication', 'Business']
    },
    {
      id: 8,
      title: 'Full Stack Developer',
      company_name: 'StartupHub',
      company_logo: 'https://via.placeholder.com/50',
      category: 'Software Development',
      job_type: 'Full-time',
      publication_date: new Date().toISOString(),
      candidate_required_location: 'Remote, Worldwide',
      salary: '$65,000 - $95,000',
      description: 'Work across the entire stack in our fast-paced startup environment. JavaScript, Node.js, MongoDB experience required.',
      url: '#',
      tags: ['JavaScript', 'Node.js', 'MongoDB', 'Fullstack', 'Developer', 'Startup']
    },
    {
      id: 9,
      title: 'Mobile App Developer',
      company_name: 'MobileFirst',
      company_logo: 'https://via.placeholder.com/50',
      category: 'Mobile Development',
      job_type: 'Full-time',
      publication_date: new Date().toISOString(),
      candidate_required_location: 'Remote, Bangalore',
      salary: '$75,000 - $110,000',
      description: 'Create amazing mobile experiences for iOS and Android platforms using React Native.',
      url: '#',
      tags: ['React Native', 'iOS', 'Android', 'Mobile', 'Developer', 'App']
    },
    {
      id: 10,
      title: 'Data Scientist',
      company_name: 'AnalyticsAI',
      company_logo: 'https://via.placeholder.com/50',
      category: 'Data Science',
      job_type: 'Full-time',
      publication_date: new Date().toISOString(),
      candidate_required_location: 'Remote, USA',
      salary: '$100,000 - $150,000',
      description: 'Analyze complex datasets and build machine learning models to drive business insights.',
      url: '#',
      tags: ['Python', 'Machine Learning', 'Data Science', 'AI', 'Analytics', 'Data']
    }
  ];

  // Smart filtering based on search query
  let filteredJobs = [...allMockJobs];
  
  if (searchQuery && searchQuery.trim()) {
    const query = searchQuery.toLowerCase().trim();
    
    // Score-based matching
    filteredJobs = allMockJobs.map(job => {
      let score = 0;
      const searchableText = (
        job.title + ' ' + 
        job.description + ' ' + 
        job.company_name + ' ' + 
        job.tags.join(' ')
      ).toLowerCase();
      
      // Exact title match gets highest score
      if (job.title.toLowerCase().includes(query)) score += 10;
      
      // Tag matches get good score
      job.tags.forEach(tag => {
        if (tag.toLowerCase().includes(query)) score += 5;
      });
      
      // Description matches get moderate score
      if (job.description.toLowerCase().includes(query)) score += 3;
      
      // Company matches get low score
      if (job.company_name.toLowerCase().includes(query)) score += 1;
      
      // Partial word matches
      const queryWords = query.split(' ');
      queryWords.forEach(word => {
        if (word.length > 2 && searchableText.includes(word)) {
          score += 2;
        }
      });
      
      return { ...job, relevanceScore: score };
    })
    .filter(job => job.relevanceScore > 0)
    .sort((a, b) => b.relevanceScore - a.relevanceScore);
    
    // If no matches found, return some general jobs anyway
    if (filteredJobs.length === 0) {
      filteredJobs = allMockJobs.slice(0, Math.min(5, parseInt(limit)));
    }
  }
  
  // Location filtering (if provided)
  if (locationQuery && locationQuery.trim()) {
    const location = locationQuery.toLowerCase().trim();
    const locationFiltered = filteredJobs.filter(job => 
      job.candidate_required_location.toLowerCase().includes(location) ||
      job.candidate_required_location.toLowerCase().includes('remote') ||
      job.candidate_required_location.toLowerCase().includes('worldwide')
    );
    
    if (locationFiltered.length > 0) {
      filteredJobs = locationFiltered;
    }
  }
  
  // Return requested number of jobs
  return filteredJobs.slice(0, Math.min(parseInt(limit), filteredJobs.length));
};

module.exports = router;