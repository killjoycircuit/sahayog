# Sahayog - Crowdfunding Platform

A modern crowdfunding platform built with React and Node.js that enables creators to launch campaigns and receive contributions from supporters.

## 🚀 Features

- **Campaign Management**: Create, edit, and manage fundraising campaigns
- **Secure Contributions**: Support campaigns with secure donation processing
- **Progress Tracking**: Real-time progress bars and funding analytics
- **User Dashboard**: Track your campaigns and contributions
- **Email Notifications**: Automated invoice delivery via email
- **Responsive Design**: Beautiful UI that works on all devices

## 🛠️ Tech Stack

### Frontend
- **React 19** - Modern UI library
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Lucide React** - Beautiful icons
- **React Hot Toast** - Elegant notifications

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication tokens
- **Cloudinary** - Image upload and management
- **Nodemailer** - Email service
- **bcrypt** - Password hashing

## 📋 Prerequisites

Before running this project, make sure you have:

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **MongoDB** (local installation or MongoDB Atlas)
- **Cloudinary Account** (for image uploads)

## 🔧 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/killjoycircuit/sahayog.git
cd sahayog
```

### 2. Backend Setup
```bash
cd api
npm install
```

Create a `.env` file in the `api` directory:
```env
# Database
MONGODB_URI=mongodb://localhost:27017/sahayog
# or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/sahayog

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-here

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Email Configuration (Gmail example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Server Configuration
PORT=5000
NODE_ENV=development
```

### 3. Frontend Setup
```bash
cd ../client
npm install
```

### 4. Start the Application

**Terminal 1 - Backend:**
```bash
cd api
npm start
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000

## 📁 Project Structure

```
sahayog/
├── api/                          # Backend application
│   ├── config/                   # Configuration files
│   │   ├── db.js                # Database connection
│   │   └── cloudinary.js        # Cloudinary setup
│   ├── controllers/              # Route controllers
│   │   ├── auth.controller.js   # Authentication logic
│   │   ├── event.controller.js  # Campaign management
│   │   └── contribution.controller.js # Contribution handling
│   ├── middlewares/              # Custom middleware
│   │   └── auth.middleware.js   # JWT authentication
│   ├── models/                   # Database models
│   │   ├── User.js              # User schema
│   │   ├── Event.js             # Campaign schema
│   │   └── Contribution.js      # Contribution schema
│   ├── routes/                   # API routes
│   │   ├── auth.routes.js       # Authentication routes
│   │   ├── event.routes.js      # Campaign routes
│   │   └── contribution.routes.js # Contribution routes
│   ├── services/                 # Business logic services
│   │   └── emailService.js      # Email functionality
│   ├── uploads/                  # Temporary file uploads
│   ├── package.json             # Backend dependencies
│   └── index.js                 # Server entry point
├── client/                       # Frontend application
│   ├── public/                   # Static assets
│   ├── src/                      # Source code
│   │   ├── assets/              # Images and static files
│   │   ├── context/             # React context providers
│   │   │   └── UserContext.jsx  # User authentication context
│   │   ├── pages/               # Page components
│   │   │   ├── LandingPage.jsx  # Home page
│   │   │   ├── EventsPage.jsx   # Browse campaigns
│   │   │   ├── ContributionPage.jsx # Contribution flow
│   │   │   ├── CheckoutPage.jsx # Checkout and invoice
│   │   │   ├── MyContributionsPage.jsx # User contributions
│   │   │   └── ...              # Other pages
│   │   ├── App.jsx              # Main app component
│   │   ├── Header.jsx           # Navigation header
│   │   ├── Footer.jsx           # Site footer
│   │   ├── Layout.jsx           # Page layout wrapper
│   │   └── main.jsx             # App entry point
│   ├── package.json             # Frontend dependencies
│   └── vite.config.js           # Vite configuration
└── README.md                     # This file
```

## 🔑 Key Features Explained

### Campaign Creation
Users can create fundraising campaigns with:
- Title and detailed description
- Funding goal and timeline
- Image uploads via Cloudinary
- Category tags for discoverability

### Contribution System
- Multiple contribution amounts (₹100, ₹500, ₹1000, ₹2000, or custom)
- Real-time progress tracking with gradient progress bars
- Secure contribution processing
- Automated invoice generation and email delivery

### User Dashboard
- **My Campaigns**: Manage created campaigns
- **My Contributions**: Track donation history
- **Settings**: Update profile information

## 🎨 UI/UX Features

- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Modern Aesthetics**: Clean, professional interface with Tailwind CSS
- **Interactive Elements**: Smooth animations and hover effects
- **Accessibility**: ARIA labels and keyboard navigation support
- **Toast Notifications**: Real-time feedback for user actions

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for secure password storage
- **Input Validation**: Server-side validation for all inputs
- **CORS Protection**: Configured for secure cross-origin requests
- **File Upload Security**: Cloudinary integration with file type validation

## 📧 Email Integration

The platform includes automated email functionality:
- **Invoice Delivery**: Automatic invoice emails after contributions
- **Campaign Updates**: Notifications for campaign milestones
- **Welcome Emails**: User registration confirmations

## 🚀 Deployment

### Environment Variables for Production
```env
NODE_ENV=production
MONGODB_URI=your-production-mongodb-uri
JWT_SECRET=your-production-jwt-secret
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
EMAIL_HOST=your-email-host
EMAIL_PORT=587
EMAIL_USER=your-email
EMAIL_PASS=your-email-password
```

### Build Commands
```bash
# Build frontend for production
cd client
npm run build

# Start production server
cd ../api
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 API Documentation

### Authentication Endpoints
- `POST /api/register` - User registration
- `POST /api/login` - User login
- `POST /api/logout` - User logout
- `GET /api/profile` - Get user profile

### Campaign Endpoints
- `GET /api/events` - Get all campaigns
- `POST /api/events` - Create new campaign
- `GET /api/events/:id` - Get campaign by ID
- `PUT /api/events/:id` - Update campaign
- `DELETE /api/events/:id` - Delete campaign
- `GET /api/my-events` - Get user's campaigns

### Contribution Endpoints
- `POST /api/contributions` - Create contribution
- `GET /api/contributions/user/:userId` - Get user contributions
- `GET /api/contributions/:id/invoice` - Get contribution invoice
- `POST /api/contributions/:id/email-invoice` - Email invoice

## 🐛 Troubleshooting

### Common Issues

**MongoDB Connection Error:**
- Ensure MongoDB is running locally or check Atlas connection string
- Verify network access and credentials

**Cloudinary Upload Fails:**
- Check Cloudinary credentials in `.env`
- Ensure upload folder permissions are correct

**Email Not Sending:**
- Verify email service credentials
- Check spam folder for test emails
- Ensure app passwords are used for Gmail

**Frontend Build Errors:**
- Clear node_modules and reinstall dependencies
- Check for version conflicts in package.json

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Killjoycircuit**
- GitHub: [@killjoycircuit](https://github.com/killjoycircuit)
- LinkedIn: [Your LinkedIn Profile](https://linkedin.com/in/your-profile)

## 🙏 Acknowledgments

- React team for the amazing framework
- Tailwind CSS for the utility-first approach
- MongoDB team for the flexible database
- All contributors and supporters of this project

---

**Happy Crowdfunding! 🎉**