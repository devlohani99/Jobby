import { useState, useRef } from 'react';

const Profile = ({ userType = 'jobseeker' }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [profileData, setProfileData] = useState({
    personal: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@email.com',
      phone: '+1 234-567-8900',
      location: 'San Francisco, CA',
      title: userType === 'employer' ? 'HR Manager' : 'Frontend Developer',
      bio: userType === 'employer' 
        ? 'Experienced HR Manager with 8+ years in talent acquisition and employee development.' 
        : 'Passionate frontend developer with 3+ years of experience in React and modern web technologies.',
      avatar: null
    },
    professional: userType === 'jobseeker' ? {
      experience: '3-5 years',
      currentCompany: 'Tech Corp',
      skills: ['React', 'JavaScript', 'TypeScript', 'Node.js', 'Python'],
      education: 'Bachelor of Computer Science',
      expectedSalary: '$70,000 - $90,000',
      resumeUrl: null
    } : {
      companyName: 'TechCorp Solutions',
      industry: 'Technology',
      companySize: '50-100 employees',
      website: 'https://techcorp.com',
      description: 'Leading technology solutions provider specializing in web development and AI integration.'
    },
    preferences: userType === 'jobseeker' ? {
      jobTypes: ['Full-time', 'Remote'],
      preferredLocations: ['San Francisco', 'Remote'],
      salaryRange: '$70,000 - $90,000',
      workMode: 'Remote',
      availability: 'Available'
    } : {
      hiringGoals: 'Scale engineering team',
      budgetRange: '$60,000 - $120,000',
      hiringUrgency: 'Medium',
      teamSize: '15-20 people'
    }
  });

  const fileInputRef = useRef(null);
  const resumeInputRef = useRef(null);

  const handleSave = () => {
    setIsEditing(false);
    alert('Profile updated successfully!');
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileData(prev => ({
          ...prev,
          personal: { ...prev.personal, avatar: e.target.result }
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResumeUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setProfileData(prev => ({
        ...prev,
        professional: { ...prev.professional, resumeUrl: file.name }
      }));
    }
  };

  const addSkill = () => {
    const skill = prompt('Enter a new skill:');
    if (skill && userType === 'jobseeker') {
      setProfileData(prev => ({
        ...prev,
        professional: {
          ...prev.professional,
          skills: [...prev.professional.skills, skill]
        }
      }));
    }
  };

  const removeSkill = (skillToRemove) => {
    if (userType === 'jobseeker') {
      setProfileData(prev => ({
        ...prev,
        professional: {
          ...prev.professional,
          skills: prev.professional.skills.filter(skill => skill !== skillToRemove)
        }
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
              <p className="mt-1 text-gray-500">Manage your professional profile</p>
            </div>
            <div className="flex space-x-3">
              {isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  >
                    Save Changes
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Profile Header */}
          <div className="relative bg-linear-to-r from-blue-500 to-blue-600 px-6 py-8">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg">
                  {profileData.personal.avatar ? (
                    <img 
                      src={profileData.personal.avatar} 
                      alt="Profile" 
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl text-gray-400">
                      {profileData.personal.firstName[0]}{profileData.personal.lastName[0]}
                    </span>
                  )}
                </div>
                {isEditing && (
                  <button
                    onClick={() => fileInputRef.current.click()}
                    className="absolute -bottom-1 -right-1 bg-blue-600 text-white rounded-full p-1 hover:bg-blue-700"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                )}
              </div>
              <div className="text-white">
                <h2 className="text-2xl font-bold">
                  {profileData.personal.firstName} {profileData.personal.lastName}
                </h2>
                <p className="text-blue-100">{profileData.personal.title}</p>
                <p className="text-blue-200 text-sm">{profileData.personal.location}</p>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex px-6">
              {[
                { id: 'personal', label: 'Personal Info', icon: '👤' },
                { id: 'professional', label: userType === 'jobseeker' ? 'Experience' : 'Company', icon: '💼' },
                { id: 'preferences', label: userType === 'jobseeker' ? 'Job Preferences' : 'Hiring Preferences', icon: '⚙️' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-4 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'personal' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileData.personal.firstName}
                        onChange={(e) => setProfileData(prev => ({
                          ...prev,
                          personal: { ...prev.personal, firstName: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900">{profileData.personal.firstName}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileData.personal.lastName}
                        onChange={(e) => setProfileData(prev => ({
                          ...prev,
                          personal: { ...prev.personal, lastName: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900">{profileData.personal.lastName}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={profileData.personal.email}
                        onChange={(e) => setProfileData(prev => ({
                          ...prev,
                          personal: { ...prev.personal, email: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900">{profileData.personal.email}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={profileData.personal.phone}
                        onChange={(e) => setProfileData(prev => ({
                          ...prev,
                          personal: { ...prev.personal, phone: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900">{profileData.personal.phone}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                  {isEditing ? (
                    <textarea
                      value={profileData.personal.bio}
                      onChange={(e) => setProfileData(prev => ({
                        ...prev,
                        personal: { ...prev.personal, bio: e.target.value }
                      }))}
                      rows="4"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900">{profileData.personal.bio}</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'professional' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  {userType === 'jobseeker' ? 'Professional Experience' : 'Company Information'}
                </h3>
                
                {userType === 'jobseeker' ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Experience Level</label>
                        {isEditing ? (
                          <select
                            value={profileData.professional.experience}
                            onChange={(e) => setProfileData(prev => ({
                              ...prev,
                              professional: { ...prev.professional, experience: e.target.value }
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="0-1 years">0-1 years</option>
                            <option value="1-3 years">1-3 years</option>
                            <option value="3-5 years">3-5 years</option>
                            <option value="5-10 years">5-10 years</option>
                            <option value="10+ years">10+ years</option>
                          </select>
                        ) : (
                          <p className="text-gray-900">{profileData.professional.experience}</p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Current Company</label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={profileData.professional.currentCompany}
                            onChange={(e) => setProfileData(prev => ({
                              ...prev,
                              professional: { ...prev.professional, currentCompany: e.target.value }
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        ) : (
                          <p className="text-gray-900">{profileData.professional.currentCompany}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Skills</label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {profileData.professional.skills.map((skill, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                          >
                            {skill}
                            {isEditing && (
                              <button
                                onClick={() => removeSkill(skill)}
                                className="ml-1 text-blue-600 hover:text-blue-800"
                              >
                                ×
                              </button>
                            )}
                          </span>
                        ))}
                        {isEditing && (
                          <button
                            onClick={addSkill}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700 hover:bg-gray-200"
                          >
                            + Add Skill
                          </button>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Resume</label>
                      <div className="flex items-center space-x-3">
                        {profileData.professional.resumeUrl ? (
                          <div className="flex items-center space-x-2">
                            <span className="text-green-600">📄</span>
                            <span className="text-gray-900">{profileData.professional.resumeUrl}</span>
                          </div>
                        ) : (
                          <span className="text-gray-500">No resume uploaded</span>
                        )}
                        {isEditing && (
                          <button
                            onClick={() => resumeInputRef.current.click()}
                            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                          >
                            Upload Resume
                          </button>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={profileData.professional.companyName}
                            onChange={(e) => setProfileData(prev => ({
                              ...prev,
                              professional: { ...prev.professional, companyName: e.target.value }
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        ) : (
                          <p className="text-gray-900">{profileData.professional.companyName}</p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={profileData.professional.industry}
                            onChange={(e) => setProfileData(prev => ({
                              ...prev,
                              professional: { ...prev.professional, industry: e.target.value }
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        ) : (
                          <p className="text-gray-900">{profileData.professional.industry}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Company Description</label>
                      {isEditing ? (
                        <textarea
                          value={profileData.professional.description}
                          onChange={(e) => setProfileData(prev => ({
                            ...prev,
                            professional: { ...prev.professional, description: e.target.value }
                          }))}
                          rows="4"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      ) : (
                        <p className="text-gray-900">{profileData.professional.description}</p>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

            {activeTab === 'preferences' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  {userType === 'jobseeker' ? 'Job Preferences' : 'Hiring Preferences'}
                </h3>
                
                {userType === 'jobseeker' ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Salary Range</label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={profileData.preferences.salaryRange}
                            onChange={(e) => setProfileData(prev => ({
                              ...prev,
                              preferences: { ...prev.preferences, salaryRange: e.target.value }
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        ) : (
                          <p className="text-gray-900">{profileData.preferences.salaryRange}</p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Work Mode</label>
                        {isEditing ? (
                          <select
                            value={profileData.preferences.workMode}
                            onChange={(e) => setProfileData(prev => ({
                              ...prev,
                              preferences: { ...prev.preferences, workMode: e.target.value }
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="Remote">Remote</option>
                            <option value="On-site">On-site</option>
                            <option value="Hybrid">Hybrid</option>
                          </select>
                        ) : (
                          <p className="text-gray-900">{profileData.preferences.workMode}</p>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Budget Range</label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={profileData.preferences.budgetRange}
                            onChange={(e) => setProfileData(prev => ({
                              ...prev,
                              preferences: { ...prev.preferences, budgetRange: e.target.value }
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        ) : (
                          <p className="text-gray-900">{profileData.preferences.budgetRange}</p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Hiring Urgency</label>
                        {isEditing ? (
                          <select
                            value={profileData.preferences.hiringUrgency}
                            onChange={(e) => setProfileData(prev => ({
                              ...prev,
                              preferences: { ...prev.preferences, hiringUrgency: e.target.value }
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                            <option value="Urgent">Urgent</option>
                          </select>
                        ) : (
                          <p className="text-gray-900">{profileData.preferences.hiringUrgency}</p>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
      {userType === 'jobseeker' && (
        <input
          ref={resumeInputRef}
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={handleResumeUpload}
          className="hidden"
        />
      )}
    </div>
  );
};

export default Profile;