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

// Public routes (no authentication required for map viewing)
router.get('/', validateStationQuery, handleValidationErrors, getStations);
router.get('/stats', getStationStats);
router.get('/:id', validateObjectId('id'), handleValidationErrors, getStation);

// Authentication required for all other routes
router.use(authenticateToken);

// Status and connector type routes
router.get('/status/:status', getStationsByStatus);
router.get('/connector/:type', getStationsByConnectorType);

// Protected CRUD routes
router.post('/', validateStation, handleValidationErrors, createStation);
router.put('/:id', validateObjectId('id'), validateStation, handleValidationErrors, updateStation);
router.delete('/:id', validateObjectId('id'), handleValidationErrors, deleteStation);

// Availability update route
router.patch('/:id/availability', 
  validateObjectId('id'), 
  handleValidationErrors, 
  updateStationAvailability
);

module.exports = router; 