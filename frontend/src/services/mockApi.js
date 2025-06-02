// Mock API for frontend-only deployment
const mockStations = [
  {
    _id: '1',
    name: 'Downtown SF Charging Hub',
    location: {
      latitude: 37.7749,
      longitude: -122.4194,
      address: '123 Market Street',
      city: 'San Francisco',
      state: 'CA'
    },
    status: 'Active',
    powerOutput: 150,
    connectorType: 'CCS2',
    totalPorts: 8,
    availablePorts: 6,
    amenities: ['WiFi', 'Restrooms', 'Food']
  },
  {
    _id: '2',
    name: 'Palo Alto Tesla Supercharger',
    location: {
      latitude: 37.4419,
      longitude: -122.1430,
      address: '456 University Avenue',
      city: 'Palo Alto',
      state: 'CA'
    },
    status: 'Active',
    powerOutput: 250,
    connectorType: 'Tesla Supercharger',
    totalPorts: 12,
    availablePorts: 10,
    amenities: ['WiFi', 'Shopping']
  },
  {
    _id: '3',
    name: 'Berkeley Campus Charger',
    location: {
      latitude: 37.8715,
      longitude: -122.2730,
      address: '789 Telegraph Avenue',
      city: 'Berkeley',
      state: 'CA'
    },
    status: 'Active',
    powerOutput: 50,
    connectorType: 'Type 2',
    totalPorts: 4,
    availablePorts: 3,
    amenities: ['WiFi', 'Parking']
  }
];

export const mockStationsAPI = {
  async getStations() {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      success: true,
      data: {
        stations: mockStations,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalStations: mockStations.length,
          hasNextPage: false,
          hasPrevPage: false
        }
      }
    };
  },

  async getStation(id) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const station = mockStations.find(s => s._id === id);
    return {
      success: !!station,
      data: { station }
    };
  },

  async getStationStats() {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const stats = {
      totalStations: mockStations.length,
      activeStations: mockStations.filter(s => s.status === 'Active').length,
      totalPorts: mockStations.reduce((sum, s) => sum + s.totalPorts, 0),
      availablePorts: mockStations.reduce((sum, s) => sum + s.availablePorts, 0),
      avgPowerOutput: Math.round(
        mockStations.reduce((sum, s) => sum + s.powerOutput, 0) / mockStations.length
      )
    };
    
    return {
      success: true,
      data: stats
    };
  }
}; 