const User = require('../model/User');
const jwt = require('jsonwebtoken');
const { generateTokens } = require('../utils/tokenUtils');

const handleRefreshToken = async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: No refresh token'
    });
  }
  const refreshToken = cookies.jwt;
  res.clearCookie('jwt', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'None' });

  // Find user with matching refresh token
  const user = await User.findOne({ refreshTokens: refreshToken });

  // Token reuse detection
  if (!user) {
    jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret',
      async (err, decoded) => {
        if (err) return res.sendStatus(403);
        
        // Token was valid but user not found -> token reuse or revoked token used
        const hackedUser = await User.findOne({ _id: decoded.userId });
        if (hackedUser) {
          hackedUser.refreshTokens = [];
          await hackedUser.save();
        }
      }
    );
    return res.status(403).json({ success: false, message: 'Forbidden: Invalid refresh token' });
  }

  // Remove the old token from db
  const newRefreshTokens = user.refreshTokens.filter(rt => rt !== refreshToken);

  // Evaluate jwt
  jwt.verify(
    refreshToken,
    process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret',
    async (err, decoded) => {
      // Token expired
      if (err) {
        user.refreshTokens = [...newRefreshTokens];
        await user.save();
      }
      if (err || user._id.toString() !== decoded.userId) {
        return res.status(403).json({ success: false, message: 'Forbidden: Invalid or expired refresh token' });
      }

      // Valid token
      const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id);

      // Saving refreshToken with current user
      user.refreshTokens = [...newRefreshTokens, newRefreshToken];
      await user.save();

      // Creates Secure Cookie with refresh token
      res.cookie('jwt', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'None',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.json({
        success: true,
        data: {
          token: accessToken
        }
      });
    }
  );
};

module.exports = { handleRefreshToken };
