# Webring Deployment Guide

A webring for students and alumni at the University of Waterloo.

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Vercel Postgres Database

1. Go to your Vercel dashboard
2. Select your project (or create a new one)
3. Go to Storage → Create Database → Postgres
4. Copy the environment variables to your `.env.local` file
5. Initialize the database by visiting:

```
https://your-domain.vercel.app/api/init-db
```

This will automatically create the table and add sample data.

### 3. Local Development
```bash
npm run dev
```

Visit `http://localhost:3000`

### 4. Deploy to Vercel

```bash
# Install Vercel CLI if you haven't
npm i -g vercel

# Deploy
vercel
```

Or push to GitHub and connect to Vercel for automatic deployments.

### 5. Environment Variables

Make sure to set these in Vercel:
- All `POSTGRES_*` variables (automatically added when you create the database)
- `NEXT_PUBLIC_APP_URL` - Your production URL (e.g., https://your-webring.vercel.app)

## User Onboarding Flow

### How Users Join:

1. **Visit the Join Page**: Users go to `https://your-domain.vercel.app/join`

2. **Fill Out the Form**: 
   - Name
   - Website URL
   - Graduation Year

3. **Customize Widget**: After submitting, users can:
   - **Choose Left Connection**: Pick which site the ← arrow links to (or auto)
   - **Choose Right Connection**: Pick which site the → arrow links to (or auto)
   - **Select Icon Color**: White, Black, or Red
   - **Use Custom Icon**: Optionally provide their own icon URL

4. **Generate & Copy Code**: System generates custom widget code with their preferences

5. **Add Widget**: Users copy the widget code and add it to their website

### Using the Widget

The widget code is customized based on user preferences:

```html
<script src="https://your-webring.vercel.app/widget.js"></script>
<div id="webring-widget" 
     data-site="https://yoursite.com"
     data-left="https://friend1.com"
     data-right="https://friend2.com"
     data-icon="https://your-webring.vercel.app/icon.white.svg"></div>
```

**Widget Attributes:**
- `data-site`: User's website (required)
- `data-left`: Custom left arrow destination (optional, defaults to auto/previous)
- `data-right`: Custom right arrow destination (optional, defaults to auto/next)
- `data-icon`: Icon URL (optional, defaults to white icon)

### The Widget Features

- ← Arrow: Navigate to previous site in the ring
- Icon: Click to view all webring members
- → Arrow: Navigate to next site in the ring

## API Endpoints

- `GET /api/members` - Get all webring members
- `POST /api/members/add` - Add a new member (used by join form)
- `GET /api/navigate?site=<url>&dir=<next|prev>` - Navigate the ring
- `GET /api/init-db` - Initialize database (run once after deployment)

## Database Management

### Adding Members

Users can self-register at `/join`, or you can manually add via:

1. **Vercel Dashboard**: Use the SQL query tool
2. **API**: POST to `/api/members/add`
3. **Direct SQL**:

```sql
INSERT INTO webring_members (name, website, year) 
VALUES ('Name', 'https://website.com', 2025);
```

### Viewing Members

- **Website**: Visit the homepage
- **API**: `GET /api/members`

## Features

✅ React/Next.js application  
✅ Vercel Postgres database  
✅ Embeddable widget with navigation arrows  
✅ API for programmatic access  
✅ Dark theme maintained  
✅ Fully deployable to Vercel  

## Next Steps

1. Deploy to Vercel
2. Set up your database
3. Add members to the database
4. Share the widget code with members
5. Customize styling as needed

