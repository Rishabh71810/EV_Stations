const Station = require('../models/Station');

// @desc    Get all charging stations with filtering and pagination
// @route   GET /api/stations
// @access  Private
const getStations = async (req, res, next) => {
  try {
    const {
      status,
      connectorType,
      minPowerOutput,
      maxPowerOutput,
      latitude,
      longitude,
      radius,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (status) filter.status = status;
    if (connectorType) filter.connectorType = connectorType;
    
    if (minPowerOutput || maxPowerOutput) {
      filter.powerOutput = {};
      if (minPowerOutput) filter.powerOutput.$gte = parseFloat(minPowerOutput);
      if (maxPowerOutput) filter.powerOutput.$lte = parseFloat(maxPowerOutput);
    }

    // Calculate pagination
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    let query;

    // If location-based search is requested
    if (latitude && longitude) {
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      const radiusInKm = radius ? parseFloat(radius) : 10;

      // Use aggregation pipeline for geo-spatial search
      query = Station.aggregate([
        {
          $geoNear: {
            near: {
              type: 'Point',
              coordinates: [lng, lat]
            },
            distanceField: 'distance',
            maxDistance: radiusInKm * 1000, // Convert to meters
            spherical: true,
            query: filter
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'createdBy',
            foreignField: '_id',
            as: 'creator',
            pipeline: [{ $project: { name: 1, email: 1 } }]
          }
        },
        {
          $addFields: {
            createdBy: { $arrayElemAt: ['$creator', 0] }
          }
        },
        {
          $project: { creator: 0 }
        },
        {
          $sort: sort
        },
        {
          $skip: skip
        },
        {
          $limit: limitNumber
        }
      ]);
    } else {
      // Regular query without geo-spatial search
      query = Station.find(filter)
        .populate('createdBy', 'name email')
        .populate('updatedBy', 'name email')
        .sort(sort)
        .skip(skip)
        .limit(limitNumber);
    }

    const stations = await query;

    // Get total count for pagination
    const total = await Station.countDocuments(filter);
    const totalPages = Math.ceil(total / limitNumber);

    res.json({
      success: true,
      data: {
        stations,
        pagination: {
          currentPage: pageNumber,
          totalPages,
          totalStations: total,
          hasNextPage: pageNumber < totalPages,
          hasPrevPage: pageNumber > 1
        }
      }
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Get single charging station
// @route   GET /api/stations/:id
// @access  Private
const getStation = async (req, res, next) => {
  try {
    const station = await Station.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!station) {
      return res.status(404).json({
        success: false,
        message: 'Charging station not found'
      });
    }

    res.json({
      success: true,
      data: { station }
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Create new charging station
// @route   POST /api/stations
// @access  Private
const createStation = async (req, res, next) => {
  try {
    // Add the user who created the station
    const stationData = {
      ...req.body,
      createdBy: req.user._id
    };

    const station = new Station(stationData);
    await station.save();

    // Populate the created station
    await station.populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Charging station created successfully',
      data: { station }
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Update charging station
// @route   PUT /api/stations/:id
// @access  Private
const updateStation = async (req, res, next) => {
  try {
    let station = await Station.findById(req.params.id);

    if (!station) {
      return res.status(404).json({
        success: false,
        message: 'Charging station not found'
      });
    }

    // Check if user owns the station or is admin
    if (station.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this charging station'
      });
    }

    // Add updatedBy field
    const updateData = {
      ...req.body,
      updatedBy: req.user._id
    };

    station = await Station.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true
      }
    ).populate('createdBy', 'name email')
     .populate('updatedBy', 'name email');

    res.json({
      success: true,
      message: 'Charging station updated successfully',
      data: { station }
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Delete charging station
// @route   DELETE /api/stations/:id
// @access  Private
const deleteStation = async (req, res, next) => {
  try {
    const station = await Station.findById(req.params.id);

    if (!station) {
      return res.status(404).json({
        success: false,
        message: 'Charging station not found'
      });
    }

    // Check if user owns the station or is admin
    if (station.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this charging station'
      });
    }

    await Station.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Charging station deleted successfully'
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Get stations by status
// @route   GET /api/stations/status/:status
// @access  Private
const getStationsByStatus = async (req, res, next) => {
  try {
    const { status } = req.params;
    const stations = await Station.findByStatus(status)
      .populate('createdBy', 'name email');

    res.json({
      success: true,
      data: { 
        stations,
        count: stations.length 
      }
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Get stations by connector type
// @route   GET /api/stations/connector/:type
// @access  Private
const getStationsByConnectorType = async (req, res, next) => {
  try {
    const { type } = req.params;
    const stations = await Station.findByConnectorType(type)
      .populate('createdBy', 'name email');

    res.json({
      success: true,
      data: { 
        stations,
        count: stations.length 
      }
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Update station availability
// @route   PATCH /api/stations/:id/availability
// @access  Private
const updateStationAvailability = async (req, res, next) => {
  try {
    const { availablePorts } = req.body;
    const station = await Station.findById(req.params.id);

    if (!station) {
      return res.status(404).json({
        success: false,
        message: 'Charging station not found'
      });
    }

    // Check if user owns the station or is admin
    if (station.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this charging station'
      });
    }

    if (availablePorts > station.totalPorts) {
      return res.status(400).json({
        success: false,
        message: 'Available ports cannot exceed total ports'
      });
    }

    station.availablePorts = availablePorts;
    station.updatedBy = req.user._id;
    await station.save();

    res.json({
      success: true,
      message: 'Station availability updated successfully',
      data: { station }
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Get station statistics
// @route   GET /api/stations/stats
// @access  Private
const getStationStats = async (req, res, next) => {
  try {
    const stats = await Station.aggregate([
      {
        $group: {
          _id: null,
          totalStations: { $sum: 1 },
          activeStations: {
            $sum: { $cond: [{ $eq: ['$status', 'Active'] }, 1, 0] }
          },
          inactiveStations: {
            $sum: { $cond: [{ $eq: ['$status', 'Inactive'] }, 1, 0] }
          },
          maintenanceStations: {
            $sum: { $cond: [{ $eq: ['$status', 'Maintenance'] }, 1, 0] }
          },
          totalPorts: { $sum: '$totalPorts' },
          totalAvailablePorts: { $sum: '$availablePorts' },
          averagePowerOutput: { $avg: '$powerOutput' }
        }
      }
    ]);

    const connectorStats = await Station.aggregate([
      {
        $group: {
          _id: '$connectorType',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        overview: stats[0] || {
          totalStations: 0,
          activeStations: 0,
          inactiveStations: 0,
          maintenanceStations: 0,
          totalPorts: 0,
          totalAvailablePorts: 0,
          averagePowerOutput: 0
        },
        connectorTypes: connectorStats
      }
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStations,
  getStation,
  createStation,
  updateStation,
  deleteStation,
  getStationsByStatus,
  getStationsByConnectorType,
  updateStationAvailability,
  getStationStats
}; 