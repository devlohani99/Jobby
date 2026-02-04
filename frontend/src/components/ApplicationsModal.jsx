import React, { useState, useEffect } from 'react';

const ApplicationsModal = ({ job, onClose }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('all');

  useEffect(() => {
    loadApplications();
  }, [job.id]);

  const loadApplications = async () => {
    setLoading(true);
    try {
      // For demo purposes, create mock applications
      const mockApplications = [
        {
          id: '1',
          candidateName: 'John Doe',
          candidateEmail: 'john.doe@email.com',
          appliedDate: '2024-01-15',
          status: 'pending',
          experience: '3 years',
          location: 'Mumbai, India',
          resumeUrl: null
        },
        {
          id: '2',
          candidateName: 'Sarah Johnson',
          candidateEmail: 'sarah.j@email.com',
          appliedDate: '2024-01-14',
          status: 'reviewed',
          experience: '5 years',
          location: 'Delhi, India',
          resumeUrl: null
        },
        {
          id: '3',
          candidateName: 'Mike Wilson',
          candidateEmail: 'mike.w@email.com',
          appliedDate: '2024-01-13',
          status: 'shortlisted',
          experience: '4 years',
          location: 'Bangalore, India',
          resumeUrl: null
        }
      ];
      
      setApplications(mockApplications);
    } catch (error) {
      console.error('Failed to load applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (applicationId, newStatus) => {
    try {
      setApplications(prev => 
        prev.map(app => 
          app.id === applicationId ? { ...app, status: newStatus } : app
        )
      );
      console.log(`Updated application ${applicationId} status to ${newStatus}`);
    } catch (error) {
      console.error('Failed to update application status:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'reviewed': 'bg-blue-100 text-blue-800',
      'shortlisted': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800',
      'hired': 'bg-purple-100 text-purple-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const filteredApplications = selectedStatus === 'all' 
    ? applications 
    : applications.filter(app => app.status === selectedStatus);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Applications for {job.title}</h2>
              <p className="text-gray-600 mt-1">{job.company} • {applications.length} applications</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="mt-4 flex space-x-1 bg-gray-100 rounded-lg p-1">
            {['all', 'pending', 'reviewed', 'shortlisted', 'rejected', 'hired'].map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedStatus === status
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                {status !== 'all' && (
                  <span className="ml-1 text-xs bg-gray-200 px-2 py-1 rounded-full">
                    {applications.filter(app => app.status === status).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading applications...</span>
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
              <p className="text-gray-600">
                {selectedStatus === 'all' 
                  ? 'No applications have been received for this job yet.' 
                  : `No applications with status "${selectedStatus}".`}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredApplications.map((application) => (
                <div key={application.id} className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-1">
                        {application.candidateName}
                      </h3>
                      <p className="text-gray-600">{application.candidateEmail}</p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <span>Applied: {new Date(application.appliedDate).toLocaleDateString()}</span>
                        <span>Experience: {application.experience}</span>
                        <span>Location: {application.location}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
                        {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => console.log('View resume:', application.id)}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        View Resume
                      </button>
                      <button
                        onClick={() => console.log('Contact candidate:', application.candidateEmail)}
                        className="text-green-600 hover:text-green-700 text-sm font-medium"
                      >
                        Contact
                      </button>
                    </div>
                    
                    <div className="flex space-x-2">
                      {application.status === 'pending' && (
                        <>
                          <button
                            onClick={() => updateApplicationStatus(application.id, 'reviewed')}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                          >
                            Mark Reviewed
                          </button>
                          <button
                            onClick={() => updateApplicationStatus(application.id, 'shortlisted')}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
                          >
                            Shortlist
                          </button>
                        </>
                      )}
                      {application.status === 'reviewed' && (
                        <>
                          <button
                            onClick={() => updateApplicationStatus(application.id, 'shortlisted')}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
                          >
                            Shortlist
                          </button>
                          <button
                            onClick={() => updateApplicationStatus(application.id, 'rejected')}
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {application.status === 'shortlisted' && (
                        <button
                          onClick={() => updateApplicationStatus(application.id, 'hired')}
                          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-sm"
                        >
                          Mark as Hired
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicationsModal;