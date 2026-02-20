# Smart Appointment Scheduling - Frontend

Complete React-based frontend application for the SAAS appointment scheduling system.

## Features

- **Role-Based Access**: Customer, Provider, and Admin dashboards
- **AI-Powered**: Floating AI chat assistant and smart provider recommendations
- **Real-Time Updates**: Appointment management and notifications
- **OTP Verification**: Secure registration and authentication
- **Responsive Design**: Mobile-first with Tailwind CSS
- **Modern Stack**: React 18, React Router v6, Axios

## Installation & Setup

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Step-by-Step Setup

#### 1. Install Node.js and npm

If you haven't installed Node.js yet:
- Download from https://nodejs.org/
- Install the LTS version
- Verify installation:
  ```bash
  node --version
  npm --version
  ```

#### 2. Navigate to Frontend Directory

```bash
cd c:\Users\vasuj\project\frontend
```

#### 3. Install Dependencies

```bash
npm install
```

This will install all packages from `package.json`:
- react & react-dom
- react-router-dom
- axios
- tailwindcss
- lucide-react (icons)
- react-hot-toast (notifications)
- date-fns (date utilities)

#### 4. Setup Environment Variables

Create a `.env` file in the frontend directory:

```bash
# Windows PowerShell
New-Item .env -ItemType File

# or manually create .env in the frontend folder
```

Add the following content:

```env
REACT_APP_API_BASE_URL=http://localhost:5000/api
REACT_APP_ENVIRONMENT=development
```

#### 5. Start Development Server

```bash
npm start
```

The application will open at `http://localhost:3000`

## Project Structure

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── common/           # Navbar, Footer, AIChat, etc.
│   │   ├── customer/         # Customer-specific components
│   │   ├── provider/         # Provider-specific components
│   │   └── admin/            # Admin-specific components
│   ├── pages/
│   │   ├── public/           # Home, Login, Register, etc.
│   │   ├── customer/         # Customer dashboards
│   │   ├── provider/         # Provider dashboards
│   │   └── admin/            # Admin dashboards
│   ├── context/              # Auth context & state management
│   ├── services/             # API calls (apiService, apiClient)
│   ├── utils/                # Helper functions
│   ├── styles/               # Global CSS
│   ├── App.js                # Main app with routing
│   └── index.js              # React entry point
├── package.json
├── tailwind.config.js        # Tailwind CSS configuration
├── postcss.config.js         # PostCSS configuration
└── .env.example              # Environment variables template
```

## Key Pages & Routes

### Public Routes
- `/` - Home page
- `/about` - About page
- `/services` - Services page
- `/login` - Login page
- `/register` - Registration with OTP verification
- `/terms` - Terms & Conditions
- `/privacy` - Privacy Policy

### Protected Routes
- `/complete-profile` - Profile completion (required after first login)

### Customer Routes (Role: customer)
- `/customer-dashboard` - Main customer dashboard
- `/browse-providers` - Browse and search providers
- `/my-appointments` - Manage appointments

### Provider Routes (Role: provider)
- `/provider-dashboard` - Provider dashboard
- (More provider pages can be added)

### Admin Routes (Role: admin)
- `/admin-dashboard` - Admin dashboard
- (More admin pages can be added)

## Using the Application

### Registration Flow

1. Go to `/register`
2. Enter name, email, password
3. Select role (Customer or Provider)
4. Accept Terms & Conditions
5. Receive OTP on email
6. Verify OTP
7. Complete profile information
8. Redirected to respective dashboard

### Default Login Credentials (for testing)

```
Email: mrvoid_24
Password: Noadmin_24
```

### Customer Workflow

1. **Browse Providers**: Search and filter providers by specialty
2. **View Slots**: Check available appointment slots
3. **Book Appointment**: Select date/time and confirm booking
4. **Manage Appointments**: View, reschedule, or cancel appointments
5. **Leave Reviews**: Rate providers after appointments

### Provider Workflow

1. **Create Slots**: Define working hours and add appointment slots
2. **Manage Availability**: Edit or delete slot
3. **View Bookings**: See all customer appointments
4. **Track Reviews**: Monitor ratings and feedback

### Admin Workflow

1. **Dashboard**: View system statistics
2. **Manage Users**: Suspend or monitor user accounts
3. **Manage Providers**: Oversee provider accounts
4. **View Appointments**: Monitor all bookings system-wide
5. **Reset System**: Clear data if needed

## API Integration

The frontend communicates with the backend via `src/services/apiService.js`.

### Available Services

- **authService** - Login, register, OTP verification
- **profileService** - Update customer/provider profiles
- **customerService** - Browse providers, book appointments
- **providerService** - Manage slots and appointments
- **adminService** - System management
- **aiService** - AI chat, recommendations, email generation
- **notificationService** - Fetch notifications

Example:
```javascript
import { customerService } from '../services/apiService';

// Get providers
const providers = await customerService.getProviders();

// Book appointment
await customerService.bookAppointment(bookingData);
```

## Styling

- **Tailwind CSS**: Utility-first CSS framework
- **Theme Colors**: Blue (#3B82F6), Green, Red, Gray
- **Responsive**: Mobile-first design with breakpoints
- **Icons**: Lucide React icons

### Custom Styles

Global styles are in `src/styles/index.css`.

## Available Scripts

In the project directory, you can run:

### `npm start`
Runs in development mode at `http://localhost:3000`

### `npm build`
Builds for production in the `build` folder

### `npm test`
Runs the test suite

## Deployment

### Option 1: Deploy on Vercel (Recommended)

1. Push code to GitHub
2. Connect Vercel to GitHub repository
3. Set environment variables in Vercel
4. Deploy automatically on push

### Option 2: Deploy on Netlify

1. Run `npm build`
2. Drag & drop the `build` folder to Netlify
3. Set build command: `npm build`
4. Set publish directory: `build`

### Option 3: Manual Deployment

1. Build: `npm build`
2. Upload `build` folder to your hosting service
3. Update API base URL in environment variables

## Troubleshooting

### Port 3000 already in use
```bash
# Kill process on port 3000 or use different port
npm start -- --port 3001
```

### CORS Error when calling backend
- Ensure backend CORS is properly configured
- Check `REACT_APP_API_BASE_URL` in `.env`
- Verify backend is running

### Blank page after login
- Check if profile is completed
- Verify token is stored in localStorage
- Check browser console for errors

### Build fails
```bash
# Clear node_modules and reinstall
rm -r node_modules
npm install
npm build
```

## Performance Optimization

- Code splitting with React Router
- Image optimization
- Lazy loading components
- CSS minification with Tailwind
- Production build optimization

## Security Features

- JWT token-based authentication
- Protected routes with role validation
- Secure headers with Helmet (backend)
- HTTPS ready
- XSS protection via React

## Future Enhancements

- Video consultation integration
- Payment gateway integration
- Advanced analytics dashboard
- Mobile app (React Native)
- Multi-language support
- Dark mode theme
- WebSocket for real-time notifications

## Support & Questions

For issues or questions:
1. Check the troubleshooting section
2. Review backend API documentation
3. Contact: support@docbook.com

## License

This project is proprietary and confidential.
