import { useState, useRef, useEffect } from 'react';
import { AuthProvider, useAuth } from './services/AuthContext';
import { applicationAPI } from './services/api';
import SignUp from './components/SignUp';
import SignIn from './components/SignIn';
import Dashboard from './components/Dashboard';
import JobSeekerDashboard from './components/JobSeekerDashboard';
import EmployerDashboard from './components/EmployerDashboard';
import Profile from './components/Profile';
import MarketIntelligenceDashboard from './components/MarketIntelligenceDashboard';
import LoadingScreen from './components/LoadingScreen';
import Footer from './components/Footer';
import Homepage from './components/Homepage';

const AppContent = () => {
  const [currentView, setCurrentView] = useState('homepage');
  const [dashboardView, setDashboardView] = useState('dashboard'); // dashboard, profile
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { user, isAuthenticated, loading, logout } = useAuth();
  const userMenuRef = useRef(null);


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  const handleLogout = async () => {
    try {
      await logout();
      setShowUserMenu(false);
      setDashboardView('dashboard');
    } catch (error) {
      console.error('Logout error:', error);
      alert('Error logging out. Please try again.');
    }
  };

  if (loading) {
    return <LoadingScreen message="Initializing your workspace..." />;
  }

  
  if (isAuthenticated && user) {
    
    const NavHeader = () => (
      <div className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3">
            <div className="flex items-center space-x-4">
              <div className="text-blue-600">
                <h1 className="text-xl font-bold">Jobby</h1>
                <p className="text-xs text-gray-500">Professional ATS Platform</p>
              </div>
              
              {/* Desktop Navigation */}
              <div className="hidden md:flex space-x-4">
                <button
                  onClick={() => setCurrentView('homepage')}
                  className="px-3 py-2 rounded-lg font-medium text-sm transition-colors text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                >
                  <span className="mr-2">🏠</span>
                  Home
                </button>
                <button
                  onClick={() => setDashboardView('dashboard')}
                  className={`px-3 py-2 rounded-lg font-medium text-sm transition-colors ${
                    dashboardView === 'dashboard'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  <span className="mr-2">📊</span>
                  Dashboard
                </button>
                <button
                  onClick={() => setDashboardView('profile')}
                  className={`px-3 py-2 rounded-lg font-medium text-sm transition-colors ${
                    dashboardView === 'profile'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  <span className="mr-2">👤</span>
                  Profile
                </button>
                <button
                  onClick={() => setDashboardView('market-intelligence')}
                  className={`px-3 py-2 rounded-lg font-medium text-sm transition-colors ${
                    dashboardView === 'market-intelligence'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  <span className="mr-2">📈</span>
                  Market Intel
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden p-2 text-gray-500 hover:text-blue-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-medium text-sm">
                      {(user.name || user.firstName || 'U')[0].toUpperCase()}
                    </span>
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-gray-900">
                      {user.name || user.firstName || 'User'}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">{user.role || 'User'}</p>
                  </div>
                  <svg 
                    className={`w-4 h-4 text-gray-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>


                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">
                        {user.name || user.firstName || 'User'}
                      </p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                      <p className="text-xs text-blue-600 capitalize">{user.role} Account</p>
                    </div>
                    
                    <button
                      onClick={() => {
                        setDashboardView('profile');
                        setShowUserMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>Profile Settings</span>
                    </button>

                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {showMobileMenu && (
            <div className="md:hidden border-t border-gray-200 pt-4 pb-3">
              <div className="space-y-1">
                <button
                  onClick={() => {
                    setCurrentView('homepage');
                    setShowMobileMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg font-medium text-sm transition-colors text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                >
                  <span className="mr-2">🏠</span>
                  Home
                </button>
                <button
                  onClick={() => {
                    setDashboardView('dashboard');
                    setShowMobileMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg font-medium text-sm transition-colors ${
                    dashboardView === 'dashboard'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  <span className="mr-2">📊</span>
                  Dashboard
                </button>
                <button
                  onClick={() => {
                    setDashboardView('profile');
                    setShowMobileMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg font-medium text-sm transition-colors ${
                    dashboardView === 'profile'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  <span className="mr-2">👤</span>
                  Profile
                </button>
                <button
                  onClick={() => {
                    setDashboardView('market-intelligence');
                    setShowMobileMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg font-medium text-sm transition-colors ${
                    dashboardView === 'market-intelligence'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  <span className="mr-2">📈</span>
                  Market Intel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );

    return (
      <div>
        <NavHeader />
        {dashboardView === 'profile' ? (
          <Profile userType={user.role} />
        ) : dashboardView === 'market-intelligence' ? (
          <MarketIntelligenceDashboard />
        ) : user.role === 'employer' ? (
          <EmployerDashboard onNavigateHome={() => setCurrentView('homepage')} />
        ) : (
          <JobSeekerDashboard onNavigateHome={() => setCurrentView('homepage')} />
        )}
        
        {/* Notification Panel */}
        
        <Footer />
      </div>
    );
  }

  return (
    <div>
      {currentView === 'homepage' ? (
        <div>
          <Homepage 
            onSignIn={() => setCurrentView('signin')}
            onSignUp={() => setCurrentView('signup')}
            onPostJob={() => setCurrentView('signup')}
          />
          <Footer />
        </div>
      ) : (
        <div className="min-h-screen relative">
          {/* Top Navigation Bar */}
          <nav className="absolute top-0 left-0 right-0 z-10 p-4">
            <div className="flex justify-between items-center">
              <div className="text-white">
                <button 
                  onClick={() => setCurrentView('homepage')}
                  className="text-left hover:opacity-80 transition-opacity"
                >
                  <h1 className="text-2xl font-bold">Jobby</h1>
                  <p className="text-sm opacity-90">Find Your Dream Job</p>
                </button>
              </div>
              <div className="bg-white rounded-full shadow-lg p-1">
                <div className="flex space-x-1">
                  <button
                    onClick={() => setCurrentView('signin')}
                    className={`px-6 py-2 rounded-full font-medium transition-all duration-200 ${
                      currentView === 'signin'
                        ? 'bg-green-500 text-white shadow-md'
                        : 'text-gray-600 hover:text-green-500 hover:bg-green-50'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => setCurrentView('signup')}
                    className={`px-6 py-2 rounded-full font-medium transition-all duration-200 ${
                      currentView === 'signup'
                        ? 'bg-blue-500 text-white shadow-md'
                        : 'text-gray-600 hover:text-blue-500 hover:bg-blue-50'
                    }`}
                  >
                    Sign Up
                  </button>
                </div>
              </div>
            </div>
          </nav>

        
          {currentView === 'signin' ? (
            <SignIn onSwitchToSignUp={() => setCurrentView('signup')} />
          ) : (
            <SignUp onSwitchToSignIn={() => setCurrentView('signin')} />
          )}
          <Footer />
        </div>
      )}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
