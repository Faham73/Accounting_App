# E-commerce Accounting Software

A comprehensive MERN stack application for managing e-commerce business operations including inventory, sales, purchases, and financial reporting.

## Features

- **User Authentication**: Secure JWT-based authentication system
- **Dashboard**: Real-time business metrics and insights
- **Product Management**: Complete inventory tracking with low stock alerts
- **Sales Management**: Record sales transactions and track profitability
- **Purchase Management**: Track supplier purchases and costs
- **Liability Management**: Monitor accounts payable and payment status
- **Financial Reports**: Comprehensive profit & loss statements and analytics

## Tech Stack

### Frontend
- React 18 with TypeScript
- Tailwind CSS for styling
- Lucide React for icons
- Vite for development and building

### Backend
- Node.js with Express
- MongoDB with Mongoose ODM
- JWT for authentication
- bcryptjs for password hashing
- Express Validator for input validation

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ecommerce-accounting-software
   ```

2. **Install Frontend Dependencies**
   ```bash
   npm install
   ```

3. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

4. **Environment Setup**
   
   Create a `.env` file in the `backend` directory:
   ```bash
   cd backend
   cp .env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   MONGO_URI=mongodb://localhost:27017/ecommerce-accounting
   JWT_SECRET=your-super-secret-jwt-key-here
   PORT=5000
   NODE_ENV=development
   ```

### Running the Application

#### Development Mode

1. **Start the Backend Server**
   ```bash
   cd backend
   npm run dev
   ```
   The backend server will run on `http://localhost:5000`

2. **Start the Frontend Development Server**
   ```bash
   # In the root directory
   npm run dev
   ```
   The frontend will run on `http://localhost:5173`

#### Production Mode

1. **Build the Frontend**
   ```bash
   npm run build
   ```

2. **Start the Backend Server**
   ```bash
   cd backend
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user info (protected)

### Products
- `GET /api/products` - Get all products (protected)
- `POST /api/products` - Create a new product (protected)
- `PUT /api/products/:id` - Update a product (protected)
- `DELETE /api/products/:id` - Delete a product (protected)

### Sales
- `GET /api/sales` - Get all sales (protected)
- `POST /api/sales` - Create a new sale (protected)

### Purchases
- `GET /api/purchases` - Get all purchases (protected)
- `POST /api/purchases` - Create a new purchase (protected)

### Payments
- `GET /api/payments` - Get all payments (protected)
- `POST /api/payments` - Create a new payment (protected)

## Database Schema

### User
- `name`: String (required)
- `email`: String (required, unique)
- `password`: String (required, hashed)
- `createdAt`: Date

### Product
- `userId`: ObjectId (reference to User)
- `name`: String (required)
- `sku`: String (required, unique per user)
- `costPrice`: Number (required)
- `sellingPrice`: Number (required)
- `stock`: Number (required)
- `minStock`: Number (required)
- `category`: String (required)
- `createdAt`: Date

### Sale
- `userId`: ObjectId (reference to User)
- `productId`: ObjectId (reference to Product)
- `productName`: String
- `quantity`: Number (required)
- `sellingPrice`: Number
- `costPrice`: Number
- `totalRevenue`: Number
- `totalCost`: Number
- `profit`: Number
- `customerName`: String (optional)
- `date`: Date

### Purchase
- `userId`: ObjectId (reference to User)
- `productId`: ObjectId (reference to Product)
- `productName`: String
- `quantity`: Number (required)
- `costPrice`: Number (required)
- `totalCost`: Number
- `supplierName`: String (required)
- `amountPaid`: Number
- `amountDue`: Number
- `paymentStatus`: String (paid/partial/unpaid)
- `dueDate`: Date (optional)
- `date`: Date

### Payment
- `userId`: ObjectId (reference to User)
- `purchaseId`: ObjectId (reference to Purchase)
- `amount`: Number (required)
- `paymentMethod`: String (required)
- `notes`: String (optional)
- `paymentDate`: Date

## Security Features

- Password hashing with bcryptjs
- JWT token authentication
- Protected API routes
- Input validation and sanitization
- CORS configuration
- User data isolation

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.