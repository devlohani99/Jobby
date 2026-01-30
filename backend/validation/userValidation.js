const validateSignUp = (userData) => {
  const errors = [];

  if (!userData.name || userData.name.trim().length === 0) {
    errors.push('Name is required');
  }

  if (!userData.email) {
    errors.push('Email is required');
  } else {
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(userData.email)) {
      errors.push('Invalid email format');
    }
  }
  
  if (!userData.password) {
    errors.push('Password is required');
  } else if (userData.password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }
  
  if (!userData.role) {
    errors.push('Role is required');
  } else if (!['jobseeker', 'employer'].includes(userData.role)) {
    errors.push('Role must be jobseeker or employer');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

const validateSignIn = (userData) => {
  const errors = [];

  if (!userData.email) {
    errors.push('Email is required');
  }

  if (!userData.password) {
    errors.push('Password is required');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

module.exports = {
  validateSignUp,
  validateSignIn
};