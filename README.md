# zurf 🌊

A comprehensive surf spot booking platform built with MERN stack.

## 📋 Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [User Roles](#user-roles)

## ✨ Features

- **User Authentication** - JWT-based authentication system
- **Multi-role System** - Surfer, Owner, Guide, Admin roles
- **Surf Spot Management** - CRUD operations for surf spots
- **Booking System** - Complete booking workflow with status management
- **Guide Management** - Guide profiles and scheduling
- **Gear Rental** - Equipment rental system
- **Payment Integration** - Stripe payment processing
- **File Uploads** - Cloudinary integration for images and certificates
- **Analytics Dashboard** - Income reports and statistics
- **Admin Panel** - Verification and user management

## 🛠 Tech Stack

- **Backend Framework**: Node.js + Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer + Cloudinary
- **Payment**: Stripe
- **Security**: bcryptjs for password hashing

## 📁 Project Structure

```
zurf-backend/
├── config/
│   └── db.js                 # Database connection
├── models/
│   ├── User.js              # User model
│   ├── SurfSpot.js          # Surf spot model
│   ├── Guide.js             # Guide model
│   ├── Gear.js              # Gear model
│   └── Booking.js           # Booking model
├── routes/
│   ├── authRoutes.js        # Authentication routes
│   ├── surfSpotRoutes.js    # Surf spot routes
│   ├── bookingRoutes.js     # Booking routes
│   ├── guideRoutes.js       # Guide routes
│   ├── gearRoutes.js        # Gear routes
│   └── adminRoutes.js       # Admin routes
├── controllers/
│   ├── authController.js    # Auth logic
│   ├── surfSpotController.js
│   ├── bookingController.js
│   ├── guideController.js
│   ├── gearController.js
│   └── adminController.js
├── middleware/
│   ├── authMiddleware.js    # JWT verification
│   ├── roleMiddleware.js    # Role-based access
│   └── uploadMiddleware.js  # File upload handling
├── .env.example             # Environment variables template
├── package.json
└── server.js               # Entry point
```

## 🚀 Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd zurf-backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Start MongoDB**
```bash
# Make sure MongoDB is running on your system
mongod
```

5. **Run the server**
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

## 🔐 Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/zurf
JWT_SECRET=your_jwt_secret_key_here
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
FRONTEND_URL=http://localhost:3000
```

## 📡 API Endpoints

### Authentication Routes (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - User login
- `GET /me` - Get current user profile
- `PUT /update-profile` - Update user profile
- `POST /upload-certificate` - Upload certificate

### Surf Spot Routes (`/api/surfspots`)
- `GET /` - Get all surf spots (with filters)
- `GET /:id` - Get surf spot by ID
- `POST /` - Create surf spot (Owner)
- `PUT /:id` - Update surf spot (Owner)
- `DELETE /:id` - Delete surf spot (Owner)
- `GET /owner/my-spots` - Get owner's surf spots

### Booking Routes (`/api/bookings`)
- `POST /calculate-price` - Calculate booking price
- `POST /` - Create booking (Surfer)
- `GET /my-bookings` - Get user bookings
- `GET /:id` - Get booking by ID
- `PUT /:id/cancel` - Cancel booking
- `GET /owner/all` - Get all bookings for owner
- `GET /owner/daily-income` - Get daily income report
- `GET /owner/monthly-report` - Get monthly report
- `PUT /:id/status` - Update booking status

### Guide Routes (`/api/guides`)
- `GET /` - Get all guides
- `GET /:id` - Get guide by ID
- `POST /` - Create guide profile
- `PUT /profile` - Update guide profile
- `GET /schedule` - View guide schedule
- `PUT /bookings/:id/accept` - Accept booking
- `PUT /bookings/:id/reject` - Reject booking

### Gear Routes (`/api/gears`)
- `GET /` - Get all gears
- `GET /:id` - Get gear by ID
- `GET /surfspot/:surfSpotId` - Get gears by surf spot
- `POST /` - Add gear (Owner)
- `PUT /:id` - Update gear (Owner)
- `DELETE /:id` - Delete gear (Owner)

### Admin Routes (`/api/admin`)
- `PUT /verify-owner/:id` - Verify owner
- `PUT /verify-guide/:id` - Verify guide
- `PUT /verify-gear/:id` - Verify gear
- `PUT /verify-surfspot/:id` - Verify surf spot
- `PUT /suspend-user/:id` - Suspend user
- `GET /users` - Get all users
- `DELETE /users/:id` - Delete user
- `GET /pending-verifications` - Get pending verifications
- `GET /analytics` - Get system analytics

## 👥 User Roles

### 1. Surfer (Default User)
- Browse and search surf spots
- Book surf spots
- Rent gear
- Book guides
- View booking history
- Cancel bookings

### 2. Surf Spot Owner
- Add/edit/delete surf spots
- Manage gear inventory
- View bookings
- Access analytics dashboard
- Daily/monthly income reports

### 3. Surf Guide
- Create and manage profile
- View assigned schedule
- Accept/reject bookings
- Update availability

### 4. Admin (Surf Authority)
- Verify owners, guides, and gear
- Approve/reject accounts
- Suspend users
- View system analytics
- Manage all users

## 📊 Price Calculation

Total booking price is calculated as:
```
Total = (Spot price/hour × Duration) + Guide price + Σ(Gear price/hour × Duration)
```

## 🔒 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_token_here>
```

## 📝 Response Format

All API responses follow this format:

**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "count": 10  // for list endpoints
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error message here"
}
```

## 🧪 Testing

Use tools like Postman or Thunder Client to test the API endpoints.

## 📄 License

ISC

## 👨‍💻 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.