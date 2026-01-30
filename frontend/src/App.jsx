import { useState } from 'react';
import { AuthProvider, useAuth } from './services/AuthContext';
import SignUp from './components/SignUp';
import SignIn from './components/SignIn';
import Dashboard from './components/Dashboard';

const AppContent = () => {
  const [currentView, setCurrentView] = useState('signin');
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl">
          <div className="flex items-center justify-center space-x-3">
            <svg className="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-xl font-medium text-gray-700">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Dashboard />;
  }

  return (
    <div className="min-h-screen relative">
      {/* Top Navigation Bar */}
      <nav className="absolute top-0 left-0 right-0 z-10 p-4">
        <div className="flex justify-end">
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

      {/* Main Content */}
      {currentView === 'signin' ? (
        <SignIn />
      ) : (
        <SignUp />
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

export default App
