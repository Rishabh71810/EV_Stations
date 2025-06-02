const express = require('express');
const {
  getStations,
  getStation,
  createStation,
  updateStation,
  deleteStation,
  getStationsByStatus,
  getStationsByConnectorType,
  updateStationAvailability,
  getStationStats
} = require('../controllers/stationController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const {
  validateStation,
  validateObjectId,
  validateStationQuery,
  handleValidationErrors
} = require('../utils/validation');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Statistics route (must be before /:id route)
router.get('/stats', getStationStats);

// Status and connector type routes (must be before /:id route)
router.get('/status/:status', getStationsByStatus);
router.get('/connector/:type', getStationsByConnectorType);

// Main CRUD routes
router.route('/')
  .get(validateStationQuery, handleValidationErrors, getStations)
  .post(validateStation, handleValidationErrors, createStation);

router.route('/:id')
  .get(validateObjectId('id'), handleValidationErrors, getStation)
  .put(validateObjectId('id'), validateStation, handleValidationErrors, updateStation)
  .delete(validateObjectId('id'), handleValidationErrors, deleteStation);

// Availability update route
router.patch('/:id/availability', 
  validateObjectId('id'), 
  handleValidationErrors, 
  updateStationAvailability
);

module.exports = router; 