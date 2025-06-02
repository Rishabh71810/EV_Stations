const { body, query, param, validationResult } = require('express-validator');

// Helper function to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation errors',
      errors: errors.array()
    });
  }
  next();
};

// User validation rules
const validateRegister = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),
  
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
];

const validateLogin = [
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

// Station validation rules
const validateStation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Station name must be between 2 and 100 characters'),
  
  body('location.latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  
  body('location.longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
  
  body('location.address')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Address cannot exceed 200 characters'),
  
  body('location.city')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('City cannot exceed 50 characters'),
  
  body('location.state')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('State cannot exceed 50 characters'),
  
  body('location.zipCode')
    .optional()
    .trim()
    .isLength({ max: 10 })
    .withMessage('Zip code cannot exceed 10 characters'),
  
  body('status')
    .isIn(['Active', 'Inactive', 'Maintenance', 'Out of Order'])
    .withMessage('Status must be Active, Inactive, Maintenance, or Out of Order'),
  
  body('powerOutput')
    .isFloat({ min: 1, max: 1000 })
    .withMessage('Power output must be between 1 and 1000 kW'),
  
  body('connectorType')
    .isIn(['Type 1', 'Type 2', 'CCS1', 'CCS2', 'CHAdeMO', 'Tesla Supercharger', 'GB/T'])
    .withMessage('Invalid connector type'),
  
  body('totalPorts')
    .isInt({ min: 1, max: 50 })
    .withMessage('Total ports must be between 1 and 50'),
  
  body('availablePorts')
    .isInt({ min: 0 })
    .withMessage('Available ports must be a non-negative integer')
    .custom((value, { req }) => {
      if (value > req.body.totalPorts) {
        throw new Error('Available ports cannot exceed total ports');
      }
      return true;
    }),
  
  body('networkProvider')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Network provider cannot exceed 50 characters'),
  
  body('pricing.perKwh')
    .optional()
    .isFloat({ min: 0, max: 10 })
    .withMessage('Price per kWh must be between 0 and 10'),
  
  body('pricing.perMinute')
    .optional()
    .isFloat({ min: 0, max: 5 })
    .withMessage('Price per minute must be between 0 and 5'),
  
  body('amenities')
    .optional()
    .isArray()
    .withMessage('Amenities must be an array'),
  
  body('amenities.*')
    .optional()
    .isIn(['WiFi', 'Restrooms', 'Food', 'Shopping', 'Parking', 'Covered', '24/7 Access'])
    .withMessage('Invalid amenity'),
  
  body('is24Hours')
    .optional()
    .isBoolean()
    .withMessage('is24Hours must be a boolean'),
];

// Parameter validation
const validateObjectId = (paramName) => [
  param(paramName)
    .isMongoId()
    .withMessage(`Invalid ${paramName} format`),
];

// Query validation for station filtering
const validateStationQuery = [
  query('status')
    .optional()
    .isIn(['Active', 'Inactive', 'Maintenance', 'Out of Order'])
    .withMessage('Invalid status filter'),
  
  query('connectorType')
    .optional()
    .isIn(['Type 1', 'Type 2', 'CCS1', 'CCS2', 'CHAdeMO', 'Tesla Supercharger', 'GB/T'])
    .withMessage('Invalid connector type filter'),
  
  query('minPowerOutput')
    .optional()
    .isFloat({ min: 1 })
    .withMessage('Minimum power output must be at least 1 kW'),
  
  query('maxPowerOutput')
    .optional()
    .isFloat({ max: 1000 })
    .withMessage('Maximum power output cannot exceed 1000 kW'),
  
  query('latitude')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  
  query('longitude')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
  
  query('radius')
    .optional()
    .isFloat({ min: 0.1, max: 100 })
    .withMessage('Radius must be between 0.1 and 100 km'),
  
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
];

module.exports = {
  handleValidationErrors,
  validateRegister,
  validateLogin,
  validateStation,
  validateObjectId,
  validateStationQuery
}; 