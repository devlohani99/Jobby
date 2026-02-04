import React, { useState, useEffect } from 'react';

const BackendLoadingScreen = ({ onBackendReady }) => {
  const [loadingStage, setLoadingStage] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [backendStatus, setBackendStatus] = useState('checking');
  const [retryCount, setRetryCount] = useState(0);

  const loadingStages = [
    { text: "Waking up backend servers...", icon: "🚀", duration: 5000 },
    { text: "Initializing database connections...", icon: "🗄️", duration: 8000 },
    { text: "Loading job intelligence APIs...", icon: "🔍", duration: 12000 },
    { text: "Preparing your workspace...", icon: "⚙️", duration: 15000 },
    { text: "Almost ready! Final checks...", icon: "✨", duration: 20000 }
  ];

  const checkBackendHealth = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch('https://jobby-backend-qulb.onrender.com/api/health', {
        signal: controller.signal,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        setBackendStatus('ready');
        setTimeout(() => {
          onBackendReady && onBackendReady();
        }, 1000);
        return true;
      }
      return false;
    } catch (error) {
      console.log('Backend not ready yet:', error.message);
      return false;
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Update loading stages based on elapsed time
    const currentStage = loadingStages.findIndex(stage => elapsedTime * 1000 < stage.duration);
    setLoadingStage(currentStage === -1 ? loadingStages.length - 1 : currentStage);
  }, [elapsedTime]);

  useEffect(() => {
    let retryInterval;

    const startHealthCheck = () => {
      // Initial check
      checkBackendHealth();
      
      // Check every 3 seconds
      retryInterval = setInterval(async () => {
        const isReady = await checkBackendHealth();
        if (!isReady) {
          setRetryCount(prev => prev + 1);
        }
      }, 3000);
    };

    // Start checking after 2 seconds
    const initialDelay = setTimeout(startHealthCheck, 2000);

    return () => {
      clearTimeout(initialDelay);
      clearInterval(retryInterval);
    };
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    if (backendStatus === 'ready') return 100;
    // Simulate progress based on typical Render cold start times (30-60 seconds)
    return Math.min(90, (elapsedTime / 60) * 100);
  };

  if (backendStatus === 'ready') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-bounce mb-4">
            <div className="w-20 h-20 mx-auto bg-white rounded-full flex items-center justify-center">
              <span className="text-4xl">✅</span>
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-2">Backend Ready!</h2>
          <p className="text-lg opacity-90">Launching your job portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 flex items-center justify-center relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-32 h-32 bg-white opacity-10 rounded-full animate-pulse"></div>
        <div className="absolute top-60 right-32 w-24 h-24 bg-white opacity-5 rounded-full animate-bounce" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-white opacity-5 rounded-full animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-20 right-20 w-28 h-28 bg-white opacity-10 rounded-full animate-bounce" style={{animationDelay: '0.5s'}}></div>
      </div>

      <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 max-w-md w-full mx-4 text-center shadow-2xl border border-white/20">
        {/* Logo Section */}
        <div className="mb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="relative group">
              <img 
                src="/images/jobbylogo.png" 
                alt="Jobby Logo" 
                className="h-20 w-20 rounded-2xl shadow-2xl ring-4 ring-white/30 group-hover:ring-blue-300/50 transition-all duration-500" 
              />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-2xl"></div>
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl opacity-30 blur-md"></div>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">Jobby</h1>
          <p className="text-blue-100 text-base">Professional Job Portal</p>
        </div>

        {/* Main Spinner */}
        <div className="mb-6">
          <div className="relative w-24 h-24 mx-auto">
            {/* Outer ring */}
            <div className="absolute inset-0 border-4 border-white/20 rounded-full"></div>
            {/* Progress ring */}
            <div 
              className="absolute inset-0 border-4 border-transparent border-t-white rounded-full animate-spin"
              style={{
                borderTopColor: 'white',
                borderRightColor: backendStatus === 'ready' ? '#10B981' : 'transparent'
              }}
            ></div>
            {/* Inner circle with icon */}
            <div className="absolute inset-2 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-2xl animate-pulse">
                {loadingStages[loadingStage]?.icon || '⚡'}
              </span>
            </div>
          </div>
        </div>

        {/* Loading Message */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-2">
            {backendStatus === 'ready' ? 'Ready!' : 'Starting Backend...'}
          </h2>
          <p className="text-blue-100 text-sm animate-pulse">
            {loadingStages[loadingStage]?.text || 'Preparing your experience...'}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="bg-white/20 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-white to-blue-200 h-full rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${getProgressPercentage()}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-blue-100 mt-2">
            <span>{Math.round(getProgressPercentage())}%</span>
            <span>{formatTime(elapsedTime)}</span>
          </div>
        </div>

        {/* Status Info */}
        <div className="text-xs text-blue-200 space-y-1">
          <div className="flex justify-between">
            <span>Backend Status:</span>
            <span className="capitalize font-medium">{backendStatus}</span>
          </div>
          <div className="flex justify-between">
            <span>Connection Attempts:</span>
            <span className="font-medium">{retryCount + 1}</span>
          </div>
        </div>

        {/* Fun Fact */}
        {elapsedTime > 15 && (
          <div className="mt-4 p-3 bg-white/10 rounded-lg border border-white/20">
            <p className="text-xs text-blue-100">
              💡 <strong>Did you know?</strong> Free-tier servers need time to "wake up" - 
              typically 30-60 seconds. Thanks for your patience!
            </p>
          </div>
        )}

        {/* Long wait message */}
        {elapsedTime > 45 && (
          <div className="mt-3 text-xs text-yellow-200">
            <p>Taking longer than usual? The server might be extra sleepy today! 😴</p>
          </div>
        )}
      </div>

      {/* Floating particles animation */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-10px) rotate(1deg); }
          66% { transform: translateY(5px) rotate(-1deg); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default BackendLoadingScreen;