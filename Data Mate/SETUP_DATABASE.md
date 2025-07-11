# 🚨 Database Setup Required

Your application is missing required database tables and columns. This is causing the Supabase errors you're seeing.

## Quick Fix Steps:

### 1. Open Your Setup Page
Navigate to: `http://localhost:3000/setup` in your browser

### 2. Run Database Migrations
The setup page contains 3 SQL migration scripts that need to be run in your Supabase database:

1. **Migration 1: Core Tables** - Creates contacts, comments, transcripts, ai_insights, and campaigns tables
2. **Migration 2: Audience Intelligence** - Creates audience_segments and related tables  
3. **Migration 3: Data Transformer** - Creates raw data and field mapping tables

### 3. How to Apply:
1. Click "Open Supabase SQL Editor" on the setup page
2. Copy each migration SQL (in order: 1, 2, 3)
3. Paste into Supabase SQL Editor and run
4. Return to your application

### 4. Verify Setup:
After running all migrations, your application should work without the database errors.

## What This Fixes:
- ✅ Missing `comments.updated_at` column
- ✅ Missing `transcripts.user_id` column  
- ✅ Missing `audience_segments` table
- ✅ All other required database schema

## Need Help?
If you encounter issues, the setup page at `/setup` has detailed step-by-step instructions.