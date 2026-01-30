const validateRequest = (validationFunction) => {
  return (req, res, next) => {
    const validation = validationFunction(req.body);
    
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      });
    }
    
    next();
  };
};

module.exports = { validateRequest };