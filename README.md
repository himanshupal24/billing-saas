# Simple Billing & Ledger SaaS

A complete, production-ready B2B SaaS application for small businesses to manage invoices, customers, and customer ledgers.

## Features

- **Authentication**: Secure JWT-based authentication with email/password
- **Business Onboarding**: First-time setup wizard that creates one demo customer account with sample invoice
- **Dashboard**: Real-time metrics (sales, outstanding, pending payments)
- **Customer Management**: Full CRUD operations with balance tracking
- **Invoice System**: Create, edit, manage invoices with draft/final status
- **PDF Generation**: Professional invoice PDFs for download and printing
- **Customer Ledger**: Track all credit/debit transactions with automatic balance updates
- **Settings**: Configure business profile, currency, tax settings

## Tech Stack

- **Frontend**: Next.js 14 (App Router), JavaScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, MongoDB with Mongoose
- **Authentication**: JWT tokens, bcrypt password hashing
- **PDF Generation**: jsPDF with autoTable

## Prerequisites

- Node.js 18+ 
- MongoDB (local or MongoDB Atlas)
- npm or yarn

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the root directory:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/simple-billing
# For MongoDB Atlas, use: mongodb+srv://username:password@cluster.mongodb.net/dbname

# JWT Secret (generate a strong random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Next.js
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Important**: Generate a strong JWT secret for production:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Production Build

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   ├── business/     # Business management
│   │   ├── customers/    # Customer CRUD
│   │   ├── invoices/     # Invoice management & PDF
│   │   ├── ledger/       # Ledger entries
│   │   └── dashboard/    # Dashboard metrics
│   ├── dashboard/        # Dashboard page
│   ├── customers/        # Customer pages
│   ├── invoices/         # Invoice pages
│   ├── ledger/           # Ledger page
│   ├── settings/         # Settings page
│   ├── login/            # Login page
│   ├── signup/           # Signup page
│   └── onboarding/       # Onboarding wizard
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── Layout.js         # Main layout with sidebar
│   └── ProtectedRoute.js # Auth guard component
├── contexts/              # React contexts
│   └── AuthContext.js    # Authentication context
├── lib/                   # Utilities
│   ├── db.js             # MongoDB connection
│   ├── auth.js           # JWT utilities
│   ├── api.js            # API client
│   └── utils.js          # Helper functions
└── models/               # Mongoose models
    ├── User.js
    ├── Business.js
    ├── Customer.js
    ├── Invoice.js
    └── LedgerEntry.js
```

## Database Models

### User
- Authentication credentials
- Business association
- Role management

### Business
- Business profile
- Currency and tax configuration
- Logo support

### Customer
- Contact information
- Real-time balance tracking
- Transaction history

### Invoice
- Itemized billing
- Tax calculation
- Draft/Final status
- Auto-numbering

### LedgerEntry
- Credit/Debit transactions
- Invoice linking
- Automatic balance updates

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Business
- `GET /api/business` - Get business info
- `PUT /api/business` - Update business
- `POST /api/business/onboarding` - Complete setup

### Customers
- `GET /api/customers` - List all customers
- `POST /api/customers` - Create customer
- `GET /api/customers/[id]` - Get customer details
- `PUT /api/customers/[id]` - Update customer
- `DELETE /api/customers/[id]` - Delete customer

### Invoices
- `GET /api/invoices` - List invoices (with filters)
- `POST /api/invoices` - Create invoice
- `GET /api/invoices/[id]` - Get invoice
- `PUT /api/invoices/[id]` - Update invoice
- `DELETE /api/invoices/[id]` - Delete invoice
- `GET /api/invoices/[id]/pdf` - Download PDF

### Ledger
- `GET /api/ledger` - List ledger entries
- `POST /api/ledger` - Create ledger entry

### Dashboard
- `GET /api/dashboard` - Get dashboard metrics

## Deployment

### Vercel Deployment (Recommended)

#### Prerequisites
1. **MongoDB Atlas Account** (Free tier available)
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
   - Create a free cluster
   - Create a database user
   - Whitelist IP address (use `0.0.0.0/0` for all IPs, or Vercel's IP ranges)
   - Get your connection string (format: `mongodb+srv://username:password@cluster.mongodb.net/dbname`)

2. **GitHub Account** (to host your code)

#### Step-by-Step Deployment

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/your-repo-name.git
   git push -u origin main
   ```

2. **Import to Vercel**
   - Go to [Vercel](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js settings

3. **Configure Environment Variables**
   
   In Vercel project settings → Environment Variables, add:
   
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
   JWT_SECRET=your-generated-secret-key-here
   NEXT_PUBLIC_APP_URL=https://your-app-name.vercel.app
   ```
   
   **Generate JWT Secret:**
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your app will be live at `https://your-app-name.vercel.app`

5. **Update MongoDB IP Whitelist** (if needed)
   - After deployment, Vercel will show your deployment URL
   - If MongoDB connection fails, ensure your MongoDB Atlas IP whitelist includes:
     - `0.0.0.0/0` (allows all IPs - less secure but easier)
     - Or add Vercel's specific IP ranges

#### MongoDB Atlas Setup Details

1. **Create MongoDB Atlas Account**
   - Sign up at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas/register)

2. **Create a Cluster**
   - Choose "Free" tier (M0)
   - Select a cloud provider and region closest to your users
   - Click "Create Cluster"

3. **Create Database User**
   - Go to "Database Access" → "Add New Database User"
   - Choose "Password" authentication
   - Set username and strong password (save these!)
   - Set privileges to "Read and write to any database"

4. **Whitelist IP Addresses**
   - Go to "Network Access" → "Add IP Address"
   - For development: Add your current IP
   - For Vercel: Add `0.0.0.0/0` (allows all IPs) or specific Vercel IPs
   - Click "Add IP Address"

5. **Get Connection String**
   - Go to "Database" → "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with your desired database name (e.g., `simple-billing`)

#### Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/dbname` |
| `JWT_SECRET` | Secret key for JWT tokens (32+ characters) | Generated random hex string |
| `NEXT_PUBLIC_APP_URL` | Your Vercel app URL | `https://your-app.vercel.app` |

#### Post-Deployment Checklist

- [ ] Test signup/login functionality
- [ ] Verify MongoDB connection is working
- [ ] Test invoice creation and PDF generation
- [ ] Check all API endpoints are responding
- [ ] Verify environment variables are set correctly
- [ ] Test on mobile devices (responsive design)
- [ ] Set up custom domain (optional)

#### Troubleshooting

**Build Fails:**
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility (18+)

**MongoDB Connection Errors:**
- Verify `MONGODB_URI` is correct in Vercel environment variables
- Check IP whitelist includes Vercel IPs or `0.0.0.0/0`
- Ensure database user has correct permissions

**Authentication Not Working:**
- Verify `JWT_SECRET` is set in environment variables
- Check that `JWT_SECRET` is the same across all environments
- Clear browser localStorage and try again

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Protected API routes
- Input validation
- Environment variable secrets

## License

This project is built for production use. Ensure proper security measures are in place before deploying.

## Support

For issues or questions, please refer to the codebase documentation or create an issue in your repository.
