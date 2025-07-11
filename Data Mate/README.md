# Influence Mate - Data Intelligence Platform

Influence Mate is an AI-powered platform for influencer data analytics and intelligence.

## Features

- Contact database with AI-powered enrichment
- Audience segmentation and analysis
- Data provenance tracking
- Comment sentiment analysis
- Transcript processing
- Campaign management

## Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Set up Supabase:
   - Create a Supabase project at [supabase.com](https://supabase.com)
   - Copy your project URL and API keys
   - Create a `.env.local` file with the following variables:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
     SUPABASE_SERVICE_ROLE_KEY=your_service_key
     WORKER_SERVICE_TOKEN=your_worker_token
     ```
   - Run database migrations from the `/supabase/migrations` folder

4. Start the development server:
   ```
   npm run dev
   ```

## Worker Registry System

The Worker Registry system allows for distributed job processing across multiple worker agents.

### Components

- **Worker Agents**: Any machine that can run the ScraperCore code
- **Job Queue**: Managed through Supabase tables
- **Edge Functions**: API endpoints for worker registration and job management

### Setting Up Workers

1. Deploy the edge functions:
   ```
   npm run deploy:functions
   ```

2. Set the `WORKER_SERVICE_TOKEN` environment variable on your Supabase project

3. Use the WorkerClient in your code:
   ```typescript
   import { WorkerClient } from './lib/worker/workerClient';
   
   const client = new WorkerClient(
     process.env.NEXT_PUBLIC_SUPABASE_URL!, 
     process.env.WORKER_SERVICE_TOKEN!
   );
   
   // Register the worker
   await client.register({
     agentName: 'MyWorker',
     capabilities: {
       tags: ['web_headless']
     }
   });
   
   // The client will automatically start polling for jobs
   ```

### Architecture

- Workers self-register with capabilities
- Workers heartbeat every 30 seconds
- Workers claim and process jobs based on capability matching
- Failed workers are detected and their jobs re-queued

### Job Flow

1. Create an enrichment job in the `enrichment_jobs` table
2. Worker claims the job if capabilities match
3. Worker processes the job
4. Worker reports completion/failure