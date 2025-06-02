require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for both possible frontend ports
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));

// Parse JSON
app.use(express.json());

// Test data storage (in-memory for demo)
let users = [];
let stations = [];
let currentUserId = 1;
let currentStationId = 1;

// Helper function to generate JWT-like token
const generateToken = (userId) => {
  return `test-token-${userId}-${Date.now()}`;
};

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Test server running' });
});

// Auth routes
app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  
  // Validation
  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Validation errors',
      errors: [
        ...(!name ? [{ field: 'name', message: 'Name is required' }] : []),
        ...(!email ? [{ field: 'email', message: 'Email is required' }] : []),
        ...(!password ? [{ field: 'password', message: 'Password is required' }] : [])
      ]
    });
  }
  
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Validation errors',
      errors: [{ field: 'email', message: 'Please enter a valid email' }]
    });
  }
  
  // Password length validation
  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Validation errors',
      errors: [{ field: 'password', message: 'Password must be at least 6 characters long' }]
    });
  }
  
  // Check if user exists
  const existingUser = users.find(u => u.email === email.toLowerCase());
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'User already exists with this email'
    });
  }
  
  // Create user
  const user = {
    _id: currentUserId++,
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password, // In real app, this would be hashed
    role: 'user',
    createdAt: new Date()
  };
  
  users.push(user);
  
  const token = generateToken(user._id);
  
  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      },
      token
    }
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  const user = users.find(u => u.email === email && u.password === password);
  
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  }
  
  const token = generateToken(user._id);
  
  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      },
      token
    }
  });
});

// Simple auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No token provided.'
    });
  }
  
  // Simple token validation (extract user ID)
  const userId = token.split('-')[2];
  const user = users.find(u => u._id == userId);
  
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token.'
    });
  }
  
  req.user = user;
  next();
};

// Get user profile
app.get('/api/auth/me', authenticateToken, (req, res) => {
  res.json({
    success: true,
    data: {
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        createdAt: req.user.createdAt
      }
    }
  });
});

// Station routes
app.get('/api/stations', authenticateToken, (req, res) => {
  res.json({
    success: true,
    data: {
      stations,
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalStations: stations.length,
        hasNextPage: false,
        hasPrevPage: false
      }
    }
  });
});

app.post('/api/stations', authenticateToken, (req, res) => {
  const station = {
    _id: currentStationId++,
    ...req.body,
    createdBy: req.user._id,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  stations.push(station);
  
  res.status(201).json({
    success: true,
    message: 'Charging station created successfully',
    data: { station }
  });
});

app.get('/api/stations/stats', authenticateToken, (req, res) => {
  const activeStations = stations.filter(s => s.status === 'Active').length;
  const totalPorts = stations.reduce((sum, s) => sum + (s.totalPorts || 0), 0);
  const totalAvailablePorts = stations.reduce((sum, s) => sum + (s.availablePorts || 0), 0);
  const averagePowerOutput = stations.length > 0 
    ? stations.reduce((sum, s) => sum + (s.powerOutput || 0), 0) / stations.length 
    : 0;

  res.json({
    success: true,
    data: {
      overview: {
        totalStations: stations.length,
        activeStations,
        inactiveStations: stations.filter(s => s.status === 'Inactive').length,
        maintenanceStations: stations.filter(s => s.status === 'Maintenance').length,
        totalPorts,
        totalAvailablePorts,
        averagePowerOutput
      },
      connectorTypes: []
    }
  });
});

app.get('/api/stations/:id', authenticateToken, (req, res) => {
  const station = stations.find(s => s._id == req.params.id);
  
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
});

app.put('/api/stations/:id', authenticateToken, (req, res) => {
  const stationIndex = stations.findIndex(s => s._id == req.params.id);
  
  if (stationIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Charging station not found'
    });
  }
  
  stations[stationIndex] = {
    ...stations[stationIndex],
    ...req.body,
    updatedAt: new Date()
  };
  
  res.json({
    success: true,
    message: 'Charging station updated successfully',
    data: { station: stations[stationIndex] }
  });
});

app.delete('/api/stations/:id', authenticateToken, (req, res) => {
  const stationIndex = stations.findIndex(s => s._id == req.params.id);
  
  if (stationIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Charging station not found'
    });
  }
  
  stations.splice(stationIndex, 1);
  
  res.json({
    success: true,
    message: 'Charging station deleted successfully'
  });
});

// Start server
app.listen(PORT, () => {
  console.log('🚀 Test Server running on port', PORT);
  console.log('🌐 API Base URL: http://localhost:' + PORT + '/api');
  console.log('✅ Ready for frontend at http://localhost:3000');
  
  // Create a demo user
  users.push({
    _id: currentUserId++,
    name: 'Demo User',
    email: 'demo@example.com',
    password: 'password123',
    role: 'user',
    createdAt: new Date()
  });
  
  console.log('👤 Demo user created: demo@example.com / password123');
}); 