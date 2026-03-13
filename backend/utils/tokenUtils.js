const jwt = require('jsonwebtoken');

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '15m'
  });

  const refreshToken = jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret', {
    expiresIn: '7d'
  });

  return { accessToken, refreshToken };
};

module.exports = { generateTokens };
