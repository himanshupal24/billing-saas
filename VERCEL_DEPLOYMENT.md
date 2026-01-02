 # Vercel Deployment Guide

This guide will walk you through deploying the Simple Billing & Ledger SaaS application to Vercel.

## Quick Start

### 1. Prepare MongoDB Atlas (5 minutes)

1. **Sign up at MongoDB Atlas**: https://www.mongodb.com/cloud/atlas/register
2. **Create a Free Cluster (M0)**:
   - Choose your preferred cloud provider (AWS, Google Cloud, Azure)
   - Select a region closest to your users
   - Cluster name: `Cluster0` (default) or your choice
   - Click "Create Cluster"

3. **Create Database User**:
   - Go to "Database Access" → "Add New Database User"
   - Authentication Method: "Password"
   - Username: Create a username (e.g., `billing-admin`)
   - Password: Generate a strong password (save it!)
   - User Privileges: "Read and write to any database"
   - Click "Add User"

4. **Configure Network Access**:
   - Go to "Network Access" → "Add IP Address"
   - For production, add `0.0.0.0/0` (allows all IPs)
   - Click "Confirm"
   - ⚠️ Note: `0.0.0.0/0` allows access from anywhere. For better security, add Vercel's specific IP ranges after deployment.

5. **Get Connection String**:
   - Go to "Database" → "Connect"
   - Choose "Connect your application"
   - Driver: Node.js, Version: 5.5 or later
   - Copy the connection string
   - Format: `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`
   - Replace `<username>` with your database username
   - Replace `<password>` with your database password
   - Add database name at the end: `...mongodb.net/simple-billing?retryWrites=true&w=majority`
   - **Example**: `mongodb+srv://admin:MyPassword123@cluster0.abc123.mongodb.net/simple-billing?retryWrites=true&w=majority`

### 2. Push Code to GitHub

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Ready for Vercel deployment"

# Add GitHub remote (replace with your repo URL)
git remote add origin https://github.com/yourusername/simple-billing.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### 3. Deploy to Vercel

1. **Sign up/Login to Vercel**: https://vercel.com/signup

2. **Import Project**:
   - Click "Add New..." → "Project"
   - Select your GitHub repository
   - Vercel will auto-detect Next.js settings

3. **Configure Project**:
   - Framework Preset: Next.js (auto-detected)
   - Root Directory: `./` (default)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)
   - Install Command: `npm install` (default)

4. **Add Environment Variables**:
   Before clicking "Deploy", add these environment variables:
   
   **Click "Environment Variables" and add:**
   
   | Name | Value | Environment |
   |------|-------|-------------|
   | `MONGODB_URI` | Your MongoDB connection string from step 1 | Production, Preview, Development |
   | `JWT_SECRET` | Generate using: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` | Production, Preview, Development |
   | `NEXT_PUBLIC_APP_URL` | Will be `https://your-project.vercel.app` (set after first deployment) | Production, Preview, Development |

   **Generate JWT Secret:**
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
   Copy the output and use it as `JWT_SECRET`.

5. **Deploy**:
   - Click "Deploy"
   - Wait 2-3 minutes for build to complete
   - Your app will be live!

6. **Update NEXT_PUBLIC_APP_URL**:
   - After first deployment, Vercel will give you a URL like `https://your-project.vercel.app`
   - Go to Project Settings → Environment Variables
   - Update `NEXT_PUBLIC_APP_URL` to your actual Vercel URL
   - Redeploy (or it will auto-redeploy on next commit)

### 4. Test Your Deployment

1. Visit your Vercel URL (e.g., `https://your-project.vercel.app`)
2. Click "Sign Up" and create a test account
3. Complete the onboarding process
4. Test creating an invoice
5. Verify PDF generation works
6. Check all features are working

## Environment Variables Summary

### Required Variables

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/simple-billing?retryWrites=true&w=majority
JWT_SECRET=your-64-character-hex-string-here
NEXT_PUBLIC_APP_URL=https://your-project.vercel.app
```

### How to Set in Vercel

1. Go to your project on Vercel dashboard
2. Click "Settings" → "Environment Variables"
3. Add each variable with appropriate environment scope
4. Redeploy if needed

## Troubleshooting

### Build Errors

**Error: Cannot find module**
- Solution: Ensure all dependencies are in `package.json`
- Run `npm install` locally to verify

**Error: Environment variable not found**
- Solution: Check environment variables are set in Vercel dashboard
- Ensure variables are added to correct environment (Production/Preview/Development)

### Runtime Errors

**MongoDB Connection Failed**
- Check `MONGODB_URI` is correct
- Verify IP whitelist in MongoDB Atlas includes `0.0.0.0/0` or Vercel IPs
- Check database username/password are correct
- Ensure connection string format is correct

**Authentication Not Working**
- Verify `JWT_SECRET` is set and same across environments
- Check token is being stored in localStorage
- Clear browser cache and localStorage, try again

**PDF Generation Fails**
- This should work automatically, but if issues occur:
  - Check API route logs in Vercel dashboard
  - Verify invoice data is complete

### Performance

- Vercel automatically optimizes Next.js apps
- Database queries are cached per request
- Static assets are served from CDN automatically

## Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Follow Vercel's DNS configuration instructions
4. Update `NEXT_PUBLIC_APP_URL` environment variable to your custom domain

## Continuous Deployment

Vercel automatically deploys when you push to GitHub:
- `main` branch → Production
- Other branches → Preview deployments
- Pull requests → Preview deployments

## Security Best Practices

1. **JWT Secret**: Use a strong, random 64+ character string
2. **MongoDB**: Use strong database user passwords
3. **IP Whitelist**: Consider restricting MongoDB access to Vercel IPs only
4. **Environment Variables**: Never commit `.env.local` to git
5. **HTTPS**: Vercel automatically provides HTTPS

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Check MongoDB Atlas connection logs
3. Review browser console for client-side errors
4. Verify all environment variables are set correctly

## Next Steps

After successful deployment:
- Set up a custom domain
- Configure monitoring/alerts
- Set up database backups
- Consider upgrading MongoDB Atlas tier for production
- Review and optimize MongoDB indexes if needed

