const User = require('../model/User');

const logout = async (req, res) => {
  try {
    const cookies = req.cookies;
    if (!cookies?.jwt) {
      return res.status(200).json({
        success: true,
        message: 'Logged out successfully'
      });
    }

    const refreshToken = cookies.jwt;

    // Find user with this refresh token
    const user = await User.findOne({ refreshTokens: refreshToken });
    
    if (user) {
      // Remove token from user db
      user.refreshTokens = user.refreshTokens.filter(rt => rt !== refreshToken);
      await user.save();
    }

    res.clearCookie('jwt', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'None'
    });

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = { logout };