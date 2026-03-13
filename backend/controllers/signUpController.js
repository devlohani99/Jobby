const User = require('../model/User');
const { hashPassword } = require('../utils/passwordUtils');
const { validateSignUp } = require('../validation/userValidation');
const { generateTokens } = require('../utils/tokenUtils');

const signUp = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    const validation = validateSignUp({ name, email, password, role });
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        errors: validation.errors
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User already exists'
      });
    }

    const hashedPassword = await hashPassword(password);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role
    });

    const { accessToken, refreshToken } = generateTokens(user._id);

    user.refreshTokens = [refreshToken];

    await user.save();

    res.cookie('jwt', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'None', // required if frontend and backend are on different domains
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        token: accessToken
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = { signUp };