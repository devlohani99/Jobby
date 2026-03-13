const User = require('../model/User');
const { comparePassword } = require('../utils/passwordUtils');
const { validateSignIn } = require('../validation/userValidation');
const { generateTokens } = require('../utils/tokenUtils');

const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const validation = validateSignIn({ email, password });
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        errors: validation.errors
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const { accessToken, refreshToken } = generateTokens(user._id);

    // Save refresh token to user model
    user.refreshTokens = user.refreshTokens || [];
    user.refreshTokens.push(refreshToken);
    await user.save();

    // Set HTTP-only cookie
    res.cookie('jwt', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'None', // required if frontend and backend are on different domains
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        token: accessToken // Returning accessToken as 'token' to keep frontend mostly compatible if possible, or just accessToken.
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = { signIn };