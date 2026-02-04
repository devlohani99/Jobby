import React, { useState, useEffect } from 'react';
import marketIntelligenceAPI from '../services/marketIntelligenceAPI';
import Footer from './Footer';

const MarketIntelligenceDashboard = ({ jobTitle = 'Software Engineer', location = 'United States' }) => {
  const [marketData, setMarketData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchParams, setSearchParams] = useState({ jobTitle, location });

  useEffect(() => {
    if (searchParams.jobTitle && searchParams.location) {
      fetchMarketIntelligence();
    }
  }, [searchParams]);

  const fetchMarketIntelligence = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await marketIntelligenceAPI.getMarketIntelligence(
        searchParams.jobTitle, 
        searchParams.location
      );
      if (response.success) {
        setMarketData(response.data);
      } else {
        setError(response.message || 'Failed to fetch market data');
      }
    } catch (err) {
      setError('Unable to fetch market intelligence data. Please try again.');
      console.error('Market Intelligence Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    setSearchParams({
      jobTitle: formData.get('jobTitle') || 'Software Engineer',
      location: formData.get('location') || 'United States'
    });
  };

  const StatCard = ({ title, value, trend, icon, color = 'blue' }) => (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        <span className="text-2xl">{icon}</span>
      </div>
      <div className="flex items-center space-x-2">
        <p className={`text-2xl font-bold text-${color}-600`}>{value}</p>
        {trend && (
          <span className={`text-xs px-2 py-1 rounded-full ${
            trend === 'increasing' ? 'bg-green-100 text-green-800' :
            trend === 'decreasing' ? 'bg-red-100 text-red-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {trend === 'increasing' ? '↗️ Rising' : 
             trend === 'decreasing' ? '↘️ Falling' : '→ Stable'}
          </span>
        )}
      </div>
    </div>
  );

  const SkillBadge = ({ skill }) => (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 mr-2 mb-2">
      {skill}
    </span>
  );

  const CompanyCard = ({ company, index }) => (
    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
        <span className="text-sm font-medium text-blue-600">#{index + 1}</span>
      </div>
      <div className="ml-3">
        <p className="text-sm font-medium text-gray-900">{company}</p>
      </div>
    </div>
  );

  return (
    <div>
      <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white p-6">
        <div className="flex items-center space-x-3 mb-4">
          <span className="text-3xl">📊</span>
          <div>
            <h1 className="text-2xl font-bold">Real-Time Job Market Intelligence</h1>
            <p className="text-blue-100">Get insights powered by live market data</p>
          </div>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/90 mb-1">Job Title</label>
              <input
                type="text"
                name="jobTitle"
                defaultValue={searchParams.jobTitle}
                placeholder="e.g. Software Engineer"
                className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:ring-2 focus:ring-white/50 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/90 mb-1">Location</label>
              <input
                type="text"
                name="location"
                defaultValue={searchParams.location}
                placeholder="e.g. San Francisco, CA"
                className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:ring-2 focus:ring-white/50 focus:border-transparent"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Analyzing...</span>
                  </div>
                ) : (
                  '🔍 Analyze Market'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <span className="text-red-500 text-xl">⚠️</span>
            <div>
              <h3 className="font-medium text-red-800">Unable to fetch market data</h3>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-8">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
            <div className="text-center">
              <h3 className="text-lg font-medium text-blue-800">Analyzing Job Market...</h3>
              <p className="text-blue-600">Gathering real-time data from multiple sources</p>
            </div>
          </div>
        </div>
      )}

      {/* Market Intelligence Data */}
      {marketData && !loading && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Average Salary"
              value={marketData.salaryData?.average || 'N/A'}
              trend={marketData.salaryData?.trend}
              icon="💰"
              color="green"
            />
            <StatCard
              title="Job Demand"
              value={marketData.demandTrends?.level || 'N/A'}
              trend={marketData.demandTrends?.growth}
              icon="📈"
              color="blue"
            />
            <StatCard
              title="Remote Opportunities"
              value={`${marketData.remoteOpportunities?.percentage || 'N/A'}%`}
              trend={marketData.remoteOpportunities?.trend}
              icon="🏠"
              color="purple"
            />
            <StatCard
              title="Market Confidence"
              value={`${marketData.demandTrends?.confidence || 'N/A'}%`}
              icon="🎯"
              color="indigo"
            />
          </div>

          {/* Detailed Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Salary Details */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span className="mr-2">💰</span>
                Salary Insights
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Average Salary:</span>
                  <span className="font-medium text-green-600">{marketData.salaryData?.average || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Salary Range:</span>
                  <span className="font-medium">{marketData.salaryData?.range || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Market Trend:</span>
                  <span className={`font-medium capitalize ${
                    marketData.salaryData?.trend === 'increasing' ? 'text-green-600' :
                    marketData.salaryData?.trend === 'decreasing' ? 'text-red-600' :
                    'text-gray-600'
                  }`}>
                    {marketData.salaryData?.trend || 'N/A'}
                  </span>
                </div>
                {marketData.salaryData?.dataPoints && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Data Points:</span>
                    <span className="font-medium">{marketData.salaryData.dataPoints} sources</span>
                  </div>
                )}
              </div>
            </div>

            {/* Top Employers */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span className="mr-2">🏢</span>
                Top Hiring Companies
              </h3>
              <div className="space-y-3">
                {marketData.topEmployers && marketData.topEmployers.length > 0 ? (
                  marketData.topEmployers.slice(0, 6).map((company, index) => (
                    <CompanyCard key={index} company={company} index={index} />
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No company data available</p>
                )}
              </div>
            </div>
          </div>

          {/* Skills Requirements */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span className="mr-2">🛠️</span>
              In-Demand Skills
            </h3>
            <div className="flex flex-wrap">
              {marketData.skillRequirements && marketData.skillRequirements.length > 0 ? (
                marketData.skillRequirements.map((skill, index) => (
                  <SkillBadge key={index} skill={skill} />
                ))
              ) : (
                <p className="text-gray-500">No skill data available</p>
              )}
            </div>
          </div>

          {/* Remote Work Insights */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span className="mr-2">🌐</span>
              Remote Work Insights
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {marketData.remoteOpportunities?.percentage || 'N/A'}%
                </div>
                <div className="text-gray-600">Remote Jobs Available</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 capitalize">
                  {marketData.remoteOpportunities?.availability || 'N/A'}
                </div>
                <div className="text-gray-600">Availability Level</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600 capitalize">
                  {marketData.remoteOpportunities?.trend || 'N/A'}
                </div>
                <div className="text-gray-600">Market Trend</div>
              </div>
            </div>
          </div>

          {/* Last Updated */}
          <div className="text-center text-gray-500 text-sm">
            Last updated: {marketData.lastUpdated ? new Date(marketData.lastUpdated).toLocaleString() : 'N/A'}
          </div>
        </div>
      )}
      </div>
      <Footer />
    </div>
  );
};

export default MarketIntelligenceDashboard;