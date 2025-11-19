# Webring Database Setup Guide

## 🚀 Quick Start

Follow these steps to set up and connect your database:

---

## Option 1: Deploy to Vercel (Recommended)

### Step 1: Push to GitHub

```bash
# Initialize git if you haven't already
git init
git add .
git commit -m "Initial webring setup"

# Create a repo on GitHub, then:
git remote add origin https://github.com/yourusername/webring.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Click **"Deploy"** (no configuration needed)

### Step 3: Add Vercel Postgres Database

1. In your Vercel project dashboard, go to **Storage** tab
2. Click **"Create Database"**
3. Select **"Postgres"**
4. Choose a name (e.g., "webring-db")
5. Click **"Create"**

The environment variables are automatically connected to your project! ✅

### Step 4: Initialize Database

After deployment completes, visit this URL in your browser:

```
https://your-project-name.vercel.app/api/init-db
```

You should see: `{ "message": "Database initialized successfully" }`

### Step 5: Test Your Webring

Visit your site:
```
https://your-project-name.vercel.app
```

---

## Option 2: Local Development

### Step 1: Install Vercel CLI

```bash
npm i -g vercel
```

### Step 2: Link to Vercel Project

```bash
cd /Users/shayaanazeem/Desktop/webring
vercel link
```

Follow the prompts to link to your Vercel project.

### Step 3: Pull Environment Variables

```bash
vercel env pull .env.local
```

This downloads your database credentials from Vercel to your local `.env.local` file.

### Step 4: Start Development Server

```bash
npm run dev
```

### Step 5: Initialize Database Locally

Visit: `http://localhost:3000/api/init-db`

### Step 6: Test Locally

Visit: `http://localhost:3000`

---

## Adding Your First Member

### Option A: Use the Join Page

1. Go to `/join` on your site
2. Fill out the form:
   - **Name**: Your name
   - **Website**: Your website URL
   - **Year**: Graduation year
3. Customize your widget (connections & icon)
4. Copy the widget code
5. Add it to your website!

### Option B: Add via API

```bash
curl -X POST https://your-site.vercel.app/api/members/add \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Your Name",
    "website": "https://yoursite.com",
    "year": 2026
  }'
```

### Option C: Add via Vercel Dashboard

1. Go to your Vercel project → Storage → Your Database
2. Click **"Query"** tab
3. Run this SQL:

```sql
INSERT INTO webring_members (name, website, year) 
VALUES ('Your Name', 'https://yoursite.com', 2026);
```

---

## Environment Variables

Your `.env.local` should look like this:

```env
# Vercel Postgres (auto-generated when you create database)
POSTGRES_URL=
POSTGRES_PRISMA_URL=
POSTGRES_URL_NON_POOLING=
POSTGRES_USER=
POSTGRES_HOST=
POSTGRES_PASSWORD=
POSTGRES_DATABASE=

# Your app URL (update this after deployment)
NEXT_PUBLIC_APP_URL=https://your-project.vercel.app
```

**Important:** Update `NEXT_PUBLIC_APP_URL` in Vercel:
1. Go to your project → Settings → Environment Variables
2. Add/Edit `NEXT_PUBLIC_APP_URL` with your actual Vercel URL
3. Redeploy your project

---

## Database Schema

The `webring_members` table:

```sql
CREATE TABLE webring_members (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  website VARCHAR(500) NOT NULL UNIQUE,
  year INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/members` | GET | Get all members |
| `/api/members/add` | POST | Add new member |
| `/api/navigate?site=URL&dir=next` | GET | Navigate ring |
| `/api/init-db` | GET | Initialize database |
| `/widget.js` | GET | Embeddable widget |

---

## Troubleshooting

### "Database connection failed"
- Make sure you've created the Postgres database in Vercel
- Check that environment variables are set
- Try visiting `/api/init-db` to initialize

### "No members showing up"
- Visit `/api/members` to check if data exists
- Make sure you've initialized the database
- Try adding a member manually

### Widget not working
- Check that `NEXT_PUBLIC_APP_URL` is set correctly
- Make sure the widget script URL matches your domain
- Check browser console for errors

---

## Next Steps

1. ✅ Deploy to Vercel
2. ✅ Create Postgres database
3. ✅ Initialize database schema
4. ✅ Add your first member
5. ✅ Test the widget on your site
6. ✅ Share `/join` page with others

---

## Need Help?

- Check the [Vercel Postgres docs](https://vercel.com/docs/storage/vercel-postgres)
- Review `README-DEPLOY.md` for more details
- Check the browser console for errors


