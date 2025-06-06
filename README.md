# EV Charging Station Management System

A full-stack application for managing electric vehicle charging stations with user authentication, CRUD operations, and interactive map visualization.

## 🚀 Features

### Backend
- REST API with Node.js and Express
- JWT-based user authentication
- CRUD operations for charging stations
- MongoDB database integration
- Protected routes
- Input validation and error handling

### Frontend
- Vue.js 3 with Composition API
- User authentication (Login/Register)
- Charging station management
- Interactive map with markers
- Filtering and search functionality
- Responsive design

## 📁 Project Structure

```
/
├── backend/                 # Node.js Express API
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Custom middleware
│   │   ├── models/          # Database models
│   │   ├── routes/          # API routes
│   │   ├── utils/           # Utility functions
│   │   └── app.js           # Express app setup
│   ├── package.json
│   └── server.js            # Entry point
├── frontend/                # Vue.js application
│   ├── src/
│   │   ├── components/      # Vue components
│   │   ├── views/           # Page views
│   │   ├── router/          # Vue router
│   │   ├── stores/          # Pinia stores
│   │   ├── services/        # API services
│   │   └── main.js          # Vue app entry
│   ├── package.json
│   └── index.html
└── README.md
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (v18+)
- npm or yarn
- MongoDB (local or cloud)

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Update environment variables in `.env`:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/charging-stations
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d
NODE_ENV=development
```

5. Start the development server:
```bash
npm run dev
```

The backend API will be available at `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Update environment variables in `.env`:
```
VITE_API_BASE_URL=http://localhost:5000/api
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

5. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Charging Stations (Protected Routes)
- `GET /api/stations` - Get all charging stations
- `POST /api/stations` - Create new charging station
- `GET /api/stations/:id` - Get specific charging station
- `PUT /api/stations/:id` - Update charging station
- `DELETE /api/stations/:id` - Delete charging station

## 🌐 Deployment

### Backend Deployment (Render/Railway)
1. Connect GitHub repository
2. Set environment variables
3. Deploy with auto-deploy enabled

### Frontend Deployment (Vercel/Netlify)
1. Connect GitHub repository
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Deploy with auto-deploy enabled

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test
```

### Frontend Testing
```bash
cd frontend
npm test
```

## 🔧 Technologies Used

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing
- cors for cross-origin requests
- express-validator for input validation

### Frontend
- Vue.js 3
- Vue Router 4
- Pinia (state management)
- Axios for HTTP requests
- Google Maps API
- Tailwind CSS for styling

## 📝 License

This project is licensed under the MIT License. #   E V _ S t a t i o n s  
 