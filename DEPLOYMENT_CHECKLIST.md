# Vercel Deployment Checklist

## Pre-Deployment ✅

- [x] All API routes marked as dynamic (`export const dynamic = 'force-dynamic'`)
- [x] useSearchParams wrapped in Suspense
- [x] Build test successful (`npm run build`)
- [x] All environment variables documented
- [x] Next.js configuration optimized

## Step 1: MongoDB Atlas Setup

1. [ ] Create MongoDB Atlas account: https://www.mongodb.com/cloud/atlas/register
2. [ ] Create a free cluster (M0)
3. [ ] Create database user (save username and password)
4. [ ] Configure Network Access (add `0.0.0.0/0` for all IPs or Vercel IPs)
5. [ ] Get connection string (format: `mongodb+srv://username:password@cluster.mongodb.net/dbname`)
6. [ ] Test connection string locally (optional)

## Step 2: Prepare Code

1. [ ] Commit all changes to git
2. [ ] Push to GitHub repository
3. [ ] Verify `.gitignore` includes `.env.local` and `.env`

## Step 3: Deploy to Vercel

1. [ ] Sign up/Login to Vercel: https://vercel.com
2. [ ] Click "Add New..." → "Project"
3. [ ] Import your GitHub repository
4. [ ] Configure project settings (auto-detected should be correct)

## Step 4: Environment Variables

In Vercel Project Settings → Environment Variables, add:

### Required Variables:

| Variable | Value | Scope |
|----------|-------|-------|
| `MONGODB_URI` | Your MongoDB connection string | Production, Preview, Development |
| `JWT_SECRET` | Generate using command below | Production, Preview, Development |
| `NEXT_PUBLIC_APP_URL` | Will be `https://your-app.vercel.app` | Production, Preview, Development |

**Generate JWT Secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Example MONGODB_URI:**
```
mongodb+srv://admin:MyPassword123@cluster0.abc123.mongodb.net/simple-billing?retryWrites=true&w=majority
```

## Step 5: Deploy

1. [ ] Click "Deploy"
2. [ ] Wait for build to complete (2-3 minutes)
3. [ ] Note your deployment URL (e.g., `https://your-project.vercel.app`)
4. [ ] Update `NEXT_PUBLIC_APP_URL` if needed
5. [ ] Redeploy if environment variables were added after first deployment

## Step 6: Post-Deployment Testing

1. [ ] Visit your Vercel URL
2. [ ] Test signup flow
3. [ ] Complete onboarding
4. [ ] Verify demo customer account was created
5. [ ] Test invoice creation
6. [ ] Test PDF generation
7. [ ] Test customer management
8. [ ] Test ledger entries
9. [ ] Test settings page
10. [ ] Verify currency display is correct

## Troubleshooting

### Build Fails
- Check Vercel build logs
- Verify all dependencies in `package.json`
- Ensure Node.js version is 18+

### MongoDB Connection Error
- Verify `MONGODB_URI` format is correct
- Check IP whitelist includes `0.0.0.0/0` or Vercel IPs
- Verify database user credentials
- Check MongoDB Atlas cluster is running

### Authentication Not Working
- Verify `JWT_SECRET` is set
- Check token is stored in localStorage
- Clear browser cache and try again

### Environment Variables Not Working
- Ensure variables are added to correct environment (Production/Preview/Development)
- Redeploy after adding variables
- Check variable names match exactly (case-sensitive)

## Security Reminders

- [ ] Use strong JWT_SECRET (64+ characters)
- [ ] Use strong MongoDB database password
- [ ] Consider restricting MongoDB IP whitelist after deployment
- [ ] Never commit `.env.local` to git
- [ ] Review Vercel security settings

## Next Steps After Deployment

- [ ] Set up custom domain (optional)
- [ ] Configure monitoring/alerts
- [ ] Set up database backups
- [ ] Review MongoDB Atlas tier for production needs
- [ ] Document deployment process for your team

## Quick Reference

**Vercel Dashboard:** https://vercel.com/dashboard  
**MongoDB Atlas:** https://cloud.mongodb.com/  
**Project URL:** (Will be shown after deployment)

---

✅ Your application is now production-ready and deployed!

