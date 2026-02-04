import { useState } from 'react';

const Homepage = ({ onSignIn, onSignUp, onPostJob }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError('Please enter a job title to search');
      return;
    }

    setLoading(true);
    setError('');
    setSearched(true);

    try {
      // Build query parameters including location
      const queryParams = new URLSearchParams({
        search: searchQuery.trim(),
        limit: '20'
      });
      
      // Add location if provided
      if (location && location.trim()) {
        queryParams.append('location', location.trim());
      }
      
      // Using backend proxy for Remotive API to avoid CORS issues
      const response = await fetch(`http://localhost:5000/api/remotive-jobs?${queryParams.toString()}`);
      
      // The backend now always returns 200 with data, even if external APIs fail
      const data = await response.json();
      setJobs(data.jobs || []);
      
      // Show different messages based on data source
      if (data.message) {
        if (data.source === 'mock' || data.source === 'fallback') {
          setError(`${data.message} Try refreshing in a moment for live results.`);
        } else if (data.source === 'cached') {
          setError(data.message);
        }
      } else if (data.jobs && data.jobs.length === 0) {
        setError('No jobs found for your search. Try different keywords or location.');
      }
      
    } catch (err) {
      // This should rarely happen now since backend always returns data
      console.error('Error fetching jobs:', err);
      setError('Unable to load jobs. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleJobClick = (jobUrl) => {
    window.open(jobUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-50 via-blue-50 to-cyan-50">
      {/* Header */}
      <header className="relative z-10 bg-white/80 backdrop-blur-sm border-b border-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-linear-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold bg-linear-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Jobby
              </h1>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-2">
              <button
                onClick={onSignIn}
                className="flex items-center space-x-2 px-6 py-2 bg-linear-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                <span>Sign In</span>
              </button>
              <button
                onClick={onSignUp}
                className="flex items-center space-x-2 px-6 py-2 bg-linear-to-r from-purple-600 to-blue-600 text-white font-medium rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                <span>Sign Up</span>
              </button>
            </div>

            {/* Mobile Navigation */}
            <div className="md:hidden">
              <div className="flex items-center space-x-2">
                <button
                  onClick={onSignIn}
                  className="px-4 py-2 bg-linear-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium rounded-lg text-sm hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  Sign In
                </button>
                <button
                  onClick={onSignUp}
                  className="px-4 py-2 bg-linear-to-r from-purple-600 to-blue-600 text-white font-medium rounded-lg text-sm"
                >
                  Sign Up
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

   
      <main className="relative overflow-hidden">
       
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
         
          <div className="text-center">
    
            <div className="max-w-4xl mx-auto mb-12">
              <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
                <span className="text-gray-900">Find Your Dream Job</span>
                <br />
                <span className="bg-linear-to-r from-purple-600 via-blue-600 to-pink-600 bg-clip-text text-transparent">
                  Where Talent Meets
                </span>
                <br />
                <span className="bg-linear-to-r from-pink-500 via-red-500 to-yellow-500 bg-clip-text text-transparent">
                  Opportunity
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Connect with top employers worldwide. Whether you're seeking your next role or hiring top talent, Jobby makes it seamless.
              </p>
            </div>

          
            <div className="max-w-4xl mx-auto mb-16">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Job Search Input */}
                  <div className="flex-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      placeholder="Job title, keywords, or company"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-gray-100 border-0 rounded-xl text-gray-900 placeholder-gray-500 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all"
                    />
                  </div>

                
                  <div className="flex-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      placeholder="City, state, or remote"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-gray-100 border-0 rounded-xl text-gray-900 placeholder-gray-500 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all"
                    />
                  </div>

             
                  <button
                    onClick={handleSearch}
                    className="px-8 py-4 bg-linear-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span>Search Jobs</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="max-w-4xl mx-auto mb-8">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl">
                  {error}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Search Results Section */}
      {searched && (
        <section className="relative z-10 py-12 bg-gray-50/80 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {loading ? 'Searching...' : `${jobs.length} Remote Jobs Found`}
              </h2>
              {searchQuery && (
                <p className="text-gray-600">
                  Showing results for "<span className="font-semibold text-purple-600">{searchQuery}</span>"
                  {location && ` in ${location}`}
                </p>
              )}
            </div>

            {loading && (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
              </div>
            )}

            {!loading && jobs.length === 0 && searched && !error && (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
                <p className="text-gray-500">Try adjusting your search terms or browse different categories.</p>
              </div>
            )}

            {!loading && jobs.length > 0 && (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {jobs.map((job) => (
                  <div
                    key={job.id}
                    onClick={() => handleJobClick(job.url)}
                    className="bg-white/90 backdrop-blur-sm rounded-xl shadow-md border border-white/50 p-6 hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
                          {job.title}
                        </h3>
                        <p className="text-purple-600 font-medium">
                          {job.company_name}
                        </p>
                      </div>
                      {job.company_logo && (
                        <img
                          src={job.company_logo}
                          alt={job.company_name}
                          className="w-12 h-12 rounded-lg object-contain bg-gray-100"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      )}
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Remote • {job.candidate_required_location || 'Worldwide'}
                      </div>
                      
                      {job.salary && (
                        <div className="flex items-center text-sm text-gray-600">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                          </svg>
                          {job.salary}
                        </div>
                      )}

                      <div className="flex items-center text-sm text-gray-600">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {new Date(job.publication_date).toLocaleDateString()}
                      </div>
                    </div>

                    {job.job_type && (
                      <div className="mb-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-700">
                          {job.job_type}
                        </span>
                      </div>
                    )}

                    <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                      {job.description?.replace(/<[^>]*>/g, '') || 'No description available'}
                    </p>

                    <div className="pt-4 border-t border-gray-200">
                      <button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:shadow-md transition-all duration-200">
                        View Job Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && jobs.length > 0 && (
              <div className="text-center mt-12">
                <button
                  onClick={onSignIn}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-xl hover:shadow-lg transition-all duration-200 space-x-2"
                >
                  <span>Sign up to save jobs & apply faster</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Why Choose Jobby Section */}
      <section className="relative z-10 py-20 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose Jobby?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join thousands of professionals who trust Jobby for their career journey
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">

            <div className="text-center p-8 rounded-2xl bg-white/70 backdrop-blur-sm border border-white/50 hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Lightning Fast</h3>
              <p className="text-gray-600">Apply to jobs with one click and get instant responses from employers.</p>
            </div>

         
            <div className="text-center p-8 rounded-2xl bg-white/70 backdrop-blur-sm border border-white/50 hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Smart Matching</h3>
              <p className="text-gray-600">Our AI matches you with the perfect opportunities based on your skills.</p>
            </div>

    
            <div className="text-center p-8 rounded-2xl bg-white/70 backdrop-blur-sm border border-white/50 hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Trusted Platform</h3>
              <p className="text-gray-600">Verified companies and secure application process you can trust.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Homepage;