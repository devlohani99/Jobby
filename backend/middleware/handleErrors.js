const handleErrors = (err, req, res, next) => {
  console.error(err.stack);

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: Object.values(err.errors).map(error => error.message)
    });
  }

  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      message: 'Duplicate field value'
    });
  }

  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
};

module.exports = { handleErrors };