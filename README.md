# Jobby - Job Portal Application

A full-stack job portal application with role-based authentication for job seekers and employers.

## Features

- **Role-based Authentication**: Separate signup/signin for job seekers and employers
- **Secure Backend**: JWT token-based authentication with bcrypt password hashing
- **Modern Frontend**: React with Vite build tool and Tailwind CSS styling
- **Modular Architecture**: Clean, interview-ready code structure

## Tech Stack

### Backend
- Node.js with Express.js
- MongoDB with Mongoose ODM
- JWT for authentication
- bcryptjs for password hashing
- Express middleware for validation and error handling

### Frontend
- React 19
- Vite build tool
- Tailwind CSS for styling
- Axios for HTTP requests
- Context API for state management

## Project Structure

```
jobby/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── signUp.js
│   │   ├── signIn.js
│   │   └── logout.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── authorizationRole.js
│   │   ├── validation.js
│   │   └── errorHandler.js
│   ├── model/
│   │   └── User.js
│   ├── routes/
│   │   ├── signUp.js
│   │   ├── signIn.js
│   │   └── logout.js
│   ├── utils/
│   │   └── password.js
│   ├── validation/
│   │   └── user.js
│   ├── .env
│   └── server.js
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── SignUp.jsx
    │   │   ├── SignIn.jsx
    │   │   └── Dashboard.jsx
    │   ├── services/
    │   │   ├── api.js
    │   │   └── AuthContext.jsx
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── package.json
    └── vite.config.js
```

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB connection (local or cloud)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file:
   ```
   MONGO_URL=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   PORT=5000
   ```

4. Start the server:
   ```bash
   npm start
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

- `POST /api/signup` - User registration
- `POST /api/signin` - User login
- `POST /api/logout` - User logout (requires authentication)

## Authentication Flow

1. Users can register as either "jobseeker" or "employer"
2. JWT tokens are issued upon successful login
3. Tokens are stored in localStorage for persistence
4. Protected routes require valid JWT tokens
5. Role-based access control for different user types

## Development Status

- ✅ Backend authentication system
- ✅ Frontend components with routing
- ✅ Tailwind CSS styling
- ✅ API integration with Axios
- 🔄 Dashboard functionality (in progress)
- 🔄 Job posting features (planned)
- 🔄 Job search functionality (planned)

## Contributing

This project follows clean code principles and is structured for scalability and maintainability. Each component has a single responsibility, making it easy to understand and extend.

## License

MIT License