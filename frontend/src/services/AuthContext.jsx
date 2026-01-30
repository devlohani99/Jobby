import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, tokenManager } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = tokenManager.getToken();
    if (token) {
      setUser({ token });
    }
    setLoading(false);
  }, []);

  const signUp = async (userData) => {
    try {
      setError('');
      setLoading(true);
      const response = await authAPI.signUp(userData);
      
      if (response.success) {
        tokenManager.setToken(response.data.token);
        setUser(response.data.user);
        return { success: true };
      }
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (credentials) => {
    try {
      setError('');
      setLoading(true);
      const response = await authAPI.signIn(credentials);
      
      if (response.success) {
        tokenManager.setToken(response.data.token);
        setUser(response.data.user);
        return { success: true };
      }
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error(error);
    } finally {
      tokenManager.removeToken();
      setUser(null);
      setError('');
    }
  };

  const value = {
    user,
    loading,
    error,
    signUp,
    signIn,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};