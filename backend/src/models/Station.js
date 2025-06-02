const mongoose = require('mongoose');

const stationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Station name is required'],
    trim: true,
    minlength: [2, 'Station name must be at least 2 characters long'],
    maxlength: [100, 'Station name cannot be more than 100 characters long']
  },
  location: {
    latitude: {
      type: Number,
      required: [true, 'Latitude is required'],
      min: [-90, 'Latitude must be between -90 and 90'],
      max: [90, 'Latitude must be between -90 and 90']
    },
    longitude: {
      type: Number,
      required: [true, 'Longitude is required'],
      min: [-180, 'Longitude must be between -180 and 180'],
      max: [180, 'Longitude must be between -180 and 180']
    },
    address: {
      type: String,
      trim: true,
      maxlength: [200, 'Address cannot be more than 200 characters long']
    },
    city: {
      type: String,
      trim: true,
      maxlength: [50, 'City cannot be more than 50 characters long']
    },
    state: {
      type: String,
      trim: true,
      maxlength: [50, 'State cannot be more than 50 characters long']
    },
    zipCode: {
      type: String,
      trim: true,
      maxlength: [10, 'Zip code cannot be more than 10 characters long']
    },
    country: {
      type: String,
      trim: true,
      default: 'USA',
      maxlength: [50, 'Country cannot be more than 50 characters long']
    }
  },
  status: {
    type: String,
    enum: {
      values: ['Active', 'Inactive', 'Maintenance', 'Out of Order'],
      message: 'Status must be Active, Inactive, Maintenance, or Out of Order'
    },
    default: 'Active',
    required: [true, 'Status is required']
  },
  powerOutput: {
    type: Number,
    required: [true, 'Power output is required'],
    min: [1, 'Power output must be at least 1 kW'],
    max: [1000, 'Power output cannot exceed 1000 kW']
  },
  connectorType: {
    type: String,
    enum: {
      values: ['Type 1', 'Type 2', 'CCS1', 'CCS2', 'CHAdeMO', 'Tesla Supercharger', 'GB/T'],
      message: 'Invalid connector type'
    },
    required: [true, 'Connector type is required']
  },
  networkProvider: {
    type: String,
    trim: true,
    maxlength: [50, 'Network provider cannot be more than 50 characters long']
  },
  pricing: {
    perKwh: {
      type: Number,
      min: [0, 'Price per kWh cannot be negative'],
      max: [10, 'Price per kWh cannot exceed $10']
    },
    perMinute: {
      type: Number,
      min: [0, 'Price per minute cannot be negative'],
      max: [5, 'Price per minute cannot exceed $5']
    },
    currency: {
      type: String,
      default: 'USD',
      maxlength: [3, 'Currency code cannot be more than 3 characters']
    }
  },
  amenities: [{
    type: String,
    enum: ['WiFi', 'Restrooms', 'Food', 'Shopping', 'Parking', 'Covered', '24/7 Access'],
    trim: true
  }],
  operatingHours: {
    monday: { start: String, end: String },
    tuesday: { start: String, end: String },
    wednesday: { start: String, end: String },
    thursday: { start: String, end: String },
    friday: { start: String, end: String },
    saturday: { start: String, end: String },
    sunday: { start: String, end: String }
  },
  is24Hours: {
    type: Boolean,
    default: false
  },
  totalPorts: {
    type: Number,
    required: [true, 'Total ports is required'],
    min: [1, 'Must have at least 1 port'],
    max: [50, 'Cannot have more than 50 ports']
  },
  availablePorts: {
    type: Number,
    required: [true, 'Available ports is required'],
    min: [0, 'Available ports cannot be negative'],
    validate: {
      validator: function(v) {
        return v <= this.totalPorts;
      },
      message: 'Available ports cannot exceed total ports'
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.__v;
      return ret;
    }
  }
});

// Indexes for efficient querying
stationSchema.index({ 'location.latitude': 1, 'location.longitude': 1 });
stationSchema.index({ status: 1 });
stationSchema.index({ connectorType: 1 });
stationSchema.index({ powerOutput: 1 });
stationSchema.index({ createdBy: 1 });

// Virtual for location coordinates as GeoJSON
stationSchema.virtual('coordinates').get(function() {
  return [this.location.longitude, this.location.latitude];
});

// Instance method to check if station is operational
stationSchema.methods.isOperational = function() {
  return this.status === 'Active' && this.availablePorts > 0;
};

// Instance method to update available ports
stationSchema.methods.updateAvailablePorts = function(change) {
  const newCount = this.availablePorts + change;
  if (newCount >= 0 && newCount <= this.totalPorts) {
    this.availablePorts = newCount;
    return this.save();
  }
  throw new Error('Invalid port count update');
};

// Static method to find stations within radius
stationSchema.statics.findNearby = function(lat, lng, radiusInKm = 10) {
  const earthRadiusKm = 6371;
  
  return this.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [parseFloat(lng), parseFloat(lat)]
        },
        distanceField: 'distance',
        maxDistance: radiusInKm * 1000, // Convert to meters
        spherical: true
      }
    }
  ]);
};

// Static method to get stations by status
stationSchema.statics.findByStatus = function(status) {
  return this.find({ status });
};

// Static method to get stations by connector type
stationSchema.statics.findByConnectorType = function(connectorType) {
  return this.find({ connectorType });
};

const Station = mongoose.model('Station', stationSchema);

module.exports = Station; 