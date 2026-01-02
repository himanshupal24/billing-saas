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

### Vercel Deployment

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### MongoDB Atlas Setup

1. Create MongoDB Atlas account
2. Create cluster
3. Get connection string
4. Update `MONGODB_URI` in environment variables

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
