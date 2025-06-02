require('dotenv').config();
const mongoose = require('mongoose');
const Station = require('./src/models/Station');
const User = require('./src/models/User');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/charging-stations';

// Sample charging stations with real coordinates (San Francisco Bay Area)
const sampleStations = [
  {
    name: 'Downtown SF Charging Hub',
    location: {
      latitude: 37.7749,
      longitude: -122.4194,
      address: '123 Market Street',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94102',
      country: 'USA'
    },
    status: 'Active',
    powerOutput: 150,
    connectorType: 'CCS2',
    networkProvider: 'ChargePoint',
    pricing: {
      perKwh: 0.35,
      perMinute: 0.10,
      currency: 'USD'
    },
    amenities: ['WiFi', 'Restrooms', 'Food', 'Shopping'],
    is24Hours: true,
    totalPorts: 8,
    availablePorts: 6
  },
  {
    name: 'Palo Alto Tesla Supercharger',
    location: {
      latitude: 37.4419,
      longitude: -122.1430,
      address: '456 University Avenue',
      city: 'Palo Alto',
      state: 'CA',
      zipCode: '94301',
      country: 'USA'
    },
    status: 'Active',
    powerOutput: 250,
    connectorType: 'Tesla Supercharger',
    networkProvider: 'Tesla',
    pricing: {
      perKwh: 0.42,
      perMinute: 0.00,
      currency: 'USD'
    },
    amenities: ['WiFi', 'Restrooms', 'Shopping', '24/7 Access'],
    is24Hours: true,
    totalPorts: 12,
    availablePorts: 10
  },
  {
    name: 'Berkeley Campus Charger',
    location: {
      latitude: 37.8715,
      longitude: -122.2730,
      address: '789 Telegraph Avenue',
      city: 'Berkeley',
      state: 'CA',
      zipCode: '94720',
      country: 'USA'
    },
    status: 'Active',
    powerOutput: 50,
    connectorType: 'Type 2',
    networkProvider: 'EVgo',
    pricing: {
      perKwh: 0.30,
      perMinute: 0.15,
      currency: 'USD'
    },
    amenities: ['WiFi', 'Parking'],
    is24Hours: false,
    totalPorts: 4,
    availablePorts: 3
  },
  {
    name: 'Oakland Airport Fast Charge',
    location: {
      latitude: 37.7213,
      longitude: -122.2205,
      address: '1 Airport Drive',
      city: 'Oakland',
      state: 'CA',
      zipCode: '94621',
      country: 'USA'
    },
    status: 'Active',
    powerOutput: 180,
    connectorType: 'CCS1',
    networkProvider: 'Electrify America',
    pricing: {
      perKwh: 0.43,
      perMinute: 0.12,
      currency: 'USD'
    },
    amenities: ['WiFi', 'Restrooms', 'Food', 'Covered', '24/7 Access'],
    is24Hours: true,
    totalPorts: 6,
    availablePorts: 4
  },
  {
    name: 'San Jose Tech Plaza',
    location: {
      latitude: 37.3382,
      longitude: -121.8863,
      address: '321 Tech Plaza Drive',
      city: 'San Jose',
      state: 'CA',
      zipCode: '95110',
      country: 'USA'
    },
    status: 'Maintenance',
    powerOutput: 75,
    connectorType: 'CHAdeMO',
    networkProvider: 'ChargePoint',
    pricing: {
      perKwh: 0.28,
      perMinute: 0.08,
      currency: 'USD'
    },
    amenities: ['WiFi', 'Parking', 'Covered'],
    is24Hours: false,
    totalPorts: 3,
    availablePorts: 0
  },
  {
    name: 'Fremont Manufacturing Plant',
    location: {
      latitude: 37.5485,
      longitude: -121.9886,
      address: '555 Factory Road',
      city: 'Fremont',
      state: 'CA',
      zipCode: '94538',
      country: 'USA'
    },
    status: 'Inactive',
    powerOutput: 120,
    connectorType: 'CCS2',
    networkProvider: 'Tesla',
    pricing: {
      perKwh: 0.25,
      perMinute: 0.05,
      currency: 'USD'
    },
    amenities: ['Parking'],
    is24Hours: false,
    totalPorts: 5,
    availablePorts: 0
  },
  {
    name: 'Redwood City Shopping Center',
    location: {
      latitude: 37.4852,
      longitude: -122.2364,
      address: '100 Shopping Plaza',
      city: 'Redwood City',
      state: 'CA',
      zipCode: '94063',
      country: 'USA'
    },
    status: 'Active',
    powerOutput: 100,
    connectorType: 'Type 2',
    networkProvider: 'ChargePoint',
    pricing: {
      perKwh: 0.32,
      perMinute: 0.10,
      currency: 'USD'
    },
    amenities: ['WiFi', 'Restrooms', 'Food', 'Shopping', 'Parking'],
    is24Hours: false,
    totalPorts: 6,
    availablePorts: 5
  },
  {
    name: 'Half Moon Bay Coastal Charger',
    location: {
      latitude: 37.4636,
      longitude: -122.4286,
      address: '789 Coastal Highway',
      city: 'Half Moon Bay',
      state: 'CA',
      zipCode: '94019',
      country: 'USA'
    },
    status: 'Out of Order',
    powerOutput: 50,
    connectorType: 'Type 1',
    networkProvider: 'EVgo',
    pricing: {
      perKwh: 0.35,
      perMinute: 0.20,
      currency: 'USD'
    },
    amenities: ['Restrooms', 'Parking'],
    is24Hours: true,
    totalPorts: 2,
    availablePorts: 0
  }
];

async function populateStations() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if we have any users (we need a createdBy user)
    let testUser = await User.findOne();
    if (!testUser) {
      console.log('👤 Creating test user...');
      testUser = new User({
        name: 'Test Admin',
        email: 'admin@test.com',
        password: 'password123',
        role: 'admin'
      });
      await testUser.save();
      console.log('✅ Test user created');
    }

    // Add additional stations to existing ones (don't clear)
    console.log('🏭 Adding sample charging stations...');
    const stations = await Promise.all(
      sampleStations.map(async (stationData) => {
        // Check if station already exists by name
        const existingStation = await Station.findOne({ name: stationData.name });
        if (existingStation) {
          console.log(`⏭️ Station "${stationData.name}" already exists, skipping...`);
          return existingStation;
        }
        
        const station = new Station({
          ...stationData,
          createdBy: testUser._id,
          updatedBy: testUser._id
        });
        return station.save();
      })
    );

    const totalStations = await Station.countDocuments();
    console.log(`✅ Database now has ${totalStations} charging stations total`);
    console.log('📍 Stations are located in the San Francisco Bay Area');
    console.log('🗺️ Dashboard and map should now show the updated station count');

  } catch (error) {
    console.error('❌ Error populating stations:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
  }
}

// Run the script
populateStations(); 