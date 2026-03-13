# 🛡️ MicroSOC Command Center - Frontend

A modern, professional Security Operations Center (SOC) dashboard built with React + Vite.

---

## 🚀 Quick Start

### 1. Install Dependencies

```powershell
cd soc_frontend
npm install
```

This will take 1-2 minutes and install all required packages.

### 2. Start Development Server

```powershell
npm run dev
```

The app will open at `http://localhost:3000`

### 3. Login

Use your backend credentials:
- Admin: `admin@microsoc.com`
- Analyst: `analyst@microsoc.com`

---

## 📁 Project Structure

```
soc_frontend/
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   └── Login.jsx           ✅ Login page
│   │   ├── admin/
│   │   │   └── AdminDashboard.jsx  ✅ Admin dashboard
│   │   └── analyst/
│   │       └── AnalystDashboard.jsx ✅ Analyst dashboard
│   ├── services/
│   │   └── api.js                  ✅ API calls
│   ├── utils/
│   │   └── auth.js                 ✅ Auth helpers
│   ├── styles/
│   │   ├── Login.css               ✅ Login styles
│   │   └── Dashboard.css           ✅ Dashboard styles
│   ├── App.jsx                     ✅ Main app & routing
│   ├── main.jsx                    ✅ Entry point
│   └── index.css                   ✅ Global styles
├── package.json                     ✅ Dependencies
├── vite.config.js                  ✅ Vite config
├── .env                            ✅ Environment variables
└── index.html                      ✅ HTML template
```

---

## ✅ What's Included

### Components (All Ready!)
- ✅ **Login Page** - Beautiful gradient design with form validation
- ✅ **Admin Dashboard** - View all incidents, users, and statistics
- ✅ **Analyst Dashboard** - View assigned incidents and update status

### Services
- ✅ **API Service** - All backend calls pre-configured
  - Login/Logout
  - Get/Create/Delete Users
  - Get/Create/Update/Assign Incidents
  - Get Logs

### Utilities
- ✅ **Auth Utilities** - Authentication helper functions
  - isAuthenticated()
  - getCurrentUser()
  - saveUserData()
  - clearUserData()

### Styling
- ✅ **Professional CSS** - Modern design system
  - CSS variables for colors and spacing
  - Responsive design
  - Smooth animations
  - Clean, professional look

---

## 🎨 Features

### Login Page
- Email/password authentication
- Error handling
- Loading states
- Role-based redirect
- Beautiful gradient background
- Smooth animations

### Admin Dashboard
- View all incidents
- View all users
- Statistics cards
- Sortable tables
- Status badges
- Professional layout

### Analyst Dashboard
- View assigned incidents only
- Update incident status
- Personal statistics
- Quick status updates
- Clean interface

---

## 🔧 Configuration

### Environment Variables (.env)

```env
VITE_API_URL=http://localhost:5001/api
VITE_ENV=development
```

Change these if your backend runs on a different port.

---

## 📦 Dependencies

```json
{
  "react": "^18.3.1",              // UI library
  "react-dom": "^18.3.1",          // DOM renderer
  "react-router-dom": "^6.26.0",   // Routing
  "axios": "^1.7.9",               // HTTP client
  "@tanstack/react-table": "^8.20.5", // Tables
  "recharts": "^2.12.7",           // Charts (for future use)
  "vite": "^6.0.3"                 // Build tool
}
```

---

## 🎯 How to Use

### Making API Calls

```javascript
import { loginUser, getAllIncidents } from './services/api'

// Login
const response = await loginUser({ email, password })

// Get incidents
const incidents = await getAllIncidents()
```

### Using Auth Helpers

```javascript
import { isAuthenticated, getCurrentUser } from './utils/auth'

// Check if logged in
if (isAuthenticated()) {
  const user = getCurrentUser()
  console.log(user.name)
}
```

### Routing

Routes are already set up in `App.jsx`:
- `/login` - Login page
- `/admin` - Admin dashboard
- `/analyst` - Analyst dashboard

---

## 🛠️ Available Scripts

```powershell
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

---

## 🎨 Design System

### Colors
```css
--primary: #2563eb      (Blue)
--success: #10b981      (Green)
--warning: #f59e0b      (Orange)
--danger: #ef4444       (Red)
--dark: #0f172a         (Dark)
--light: #f8fafc        (Light gray)
```

### Using Colors
```css
.my-button {
  background-color: var(--primary);
  color: var(--white);
}
```

---

## 🔐 Authentication Flow

1. User enters email/password
2. `loginUser()` sends credentials to backend
3. Backend returns token and user data
4. `saveUserData()` stores in localStorage
5. User redirected based on role
6. Protected routes check authentication

---

## 📱 Responsive Design

The app is fully responsive and works on:
- 💻 Desktop (1920px+)
- 💻 Laptop (1024px+)
- 📱 Tablet (768px+)
- 📱 Mobile (320px+)

---

## 🆘 Troubleshooting

### Port Already in Use
Change port in `vite.config.js`:
```javascript
server: {
  port: 3001,  // Change to any free port
}
```

### API Not Connecting
1. Check backend is running: `http://localhost:5001`
2. Check `.env` has correct URL
3. Check browser console (F12) for errors

### Hot Reload Not Working
Restart dev server:
```powershell
Ctrl+C
npm run dev
```

### npm install Fails
```powershell
# Clear cache and reinstall
npm cache clean --force
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

---

## 🎓 Learning Resources

- React Docs: https://react.dev
- Vite Docs: https://vite.dev
- React Router: https://reactrouter.com
- Axios: https://axios-http.com

---

## 🚀 Next Steps

Everything is ready to go! The app includes:
- ✅ Complete login system
- ✅ Admin dashboard with data
- ✅ Analyst dashboard with updates
- ✅ Professional styling
- ✅ API integration
- ✅ Error handling

Just run `npm install` and `npm run dev`!

---

## 📞 Backend Connection

Make sure your backend is running:
```powershell
cd ../soc_backend
npm start
```

Backend should be at: `http://localhost:5001`

---

**Happy Coding! 🚀**