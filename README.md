# 🐾 Painssy Playful Pals - Premium Pet Toys E-commerce

A modern, full-stack e-commerce platform for premium pet toys and interactive companions.


## 🌟 Features

### 🔐 **User Authentication**
- **Secure Registration**: User sign-up with password strength validation
- **Login System**: Email/password authentication with Supabase
- **Session Management**: Automatic session persistence and token handling
- **Email Verification**: Automatic email verification for new accounts

### 🛒 **Smart Cart System**
- **User-Specific Carts**: Each user has their own persistent cart
- **Backend Synchronization**: Cart data syncs with backend for authenticated users
- **Guest Cart Support**: Non-authenticated users can still use cart (stored locally)
- **Real-time Updates**: Cart updates immediately reflect in the UI

### 🎨 **Modern UI/UX**
- **Glass Morphism Design**: Beautiful backdrop blur effects
- **Responsive Layout**: Works perfectly on all devices
- **Smooth Animations**: Engaging hover effects and transitions
- **Product Showcase**: Interactive product cards with detailed information

### 🛍️ **E-commerce Features**
- **Product Catalog**: Browse premium pet toys and interactive companions
- **Product Details**: Detailed product information with features and reviews
- **Shopping Cart**: Add/remove items with quantity management
- **Admin Panel**: Product management for administrators

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/mahinbs/zippty-playful-pals.git

# Navigate to project directory
cd zippty-playful-pals

# Install dependencies
npm install

# Install backend dependencies
npm install express cors

# Start the backend server
node backend-example.js

# In a new terminal, start the frontend
npm run dev
```

### Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/api
- **Admin Panel**: http://localhost:3000/admin

## 🏗️ Architecture

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **shadcn/ui** for beautiful, accessible components
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Supabase** for authentication

### Backend
- **Node.js** with Express
- **ES Modules** for modern JavaScript
- **CORS** enabled for frontend communication
- **JWT Token** authentication
- **RESTful API** design

## 📁 Project Structure

```
zippty-playful-pals/
├── src/
│   ├── components/          # React components
│   │   ├── ui/             # shadcn/ui components
│   │   ├── AuthModal.tsx   # Authentication modal
│   │   ├── Login.tsx       # Login component
│   │   ├── Register.tsx    # Registration component
│   │   └── Header.tsx      # Navigation header
│   ├── contexts/           # React contexts
│   │   ├── AuthContext.tsx # Authentication state
│   │   └── CartContext.tsx # Shopping cart state
│   ├── services/           # API services
│   │   └── api.ts          # Backend API integration
│   └── pages/              # Page components
├── backend-example.js      # Express API server
├── vite.config.ts          # Vite configuration
└── package.json            # Dependencies and scripts
```

## 🔧 Configuration

### Environment Variables
The application uses Supabase for authentication. Make sure your Supabase configuration is set up in:
```
src/integrations/supabase/client.ts
```

### Port Configuration
- **Frontend**: Port 3000 (configurable in `vite.config.ts`)
- **Backend**: Port 3001 (configurable in `backend-example.js`)

## 🎯 Key Features in Detail

### Authentication Flow
1. User clicks "Sign Up" or "Sign In" in header
2. Modal opens with form validation
3. User credentials are validated with Supabase
4. Session is established and persisted
5. User can now access personalized features

### Cart Synchronization
1. Guest users: Cart stored in localStorage
2. Authenticated users: Cart syncs with backend
3. Real-time updates across all components
4. Cart persists between browser sessions

### Product Management
1. Browse products with detailed information
2. Add products to cart with one click
3. View cart contents and manage quantities
4. Secure checkout process (to be implemented)

## 🚀 Deployment

### Frontend Deployment
```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### Backend Deployment
The backend can be deployed to any Node.js hosting platform:
- Vercel
- Netlify Functions
- Railway
- Heroku
- DigitalOcean App Platform

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🔗 Links

- **GitHub Repository**: https://github.com/mahinbs/zippty-playful-pals
- **Live Demo**: [Coming Soon]
- **Documentation**: [Coming Soon]

---

**Built with ❤️ for pet lovers everywhere**

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/3892ae2a-5a46-4792-be5b-2c1a1ed677f2) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/3892ae2a-5a46-4792-be5b-2c1a1ed677f2) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
