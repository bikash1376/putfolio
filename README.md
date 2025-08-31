# Putfolio - Your Digital Portfolio

A modern, authenticated portfolio platform built with Next.js, Supabase, and Nocta UI. Each user can create and showcase one public profile, similar to Linktree.

## Features

- 🔐 **User Authentication** - Secure sign up/sign in with Supabase Auth
- 👤 **One Profile Per User** - Each authenticated user can create one public profile
- 🎨 **Beautiful UI** - Built with Nocta UI components for a modern, accessible design
- 📱 **Responsive Design** - Works perfectly on all devices
- 🌐 **Public Profiles** - Share your profile URL with anyone
- ⚡ **Fast & Performant** - Built with Next.js 15 and optimized for speed

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **UI Components**: [Nocta UI](https://www.nocta-ui.com/) (built on shadcn/ui)
- **Authentication**: Supabase Auth
- **Database**: Supabase PostgreSQL
- **Styling**: Tailwind CSS
- **State Management**: React Context + Zustand

## Getting Started

### Prerequisites

- Node.js 18+ 
- Supabase account
- Git

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd putfolio
npm install
```

### 2. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Get your project URL and anon key from Settings > API
3. Create a `.env.local` file in your project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Set Up Database

1. Go to your Supabase project's SQL Editor
2. Run the SQL migration from `database-migration.sql`
3. This will:
   - Add `user_id` and `created_at` columns to profiles table
   - Ensure one user can only have one profile
   - Set up Row Level Security policies
   - Create necessary indexes

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## How It Works

### Authentication Flow

1. Users sign up/sign in with email and password
2. Upon first login, they can create their profile
3. Each user can only have one profile
4. Profiles are publicly viewable by anyone

### Profile Creation

- Username must be unique across all users
- Profile includes name, description, and optional avatar
- Once created, users can view their profile at `/profile/[username]`

### Public Profiles

- All profiles are publicly accessible
- No authentication required to view profiles
- Beautiful Linktree-style layout
- Responsive design for all devices

## Project Structure

```
putfolio/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout with AuthProvider
│   ├── page.tsx           # Home page with profile grid
│   └── profile/           # Profile pages
│       └── [username]/    # Dynamic profile routes
├── components/            # React components
│   ├── auth/              # Authentication components
│   ├── ui/                # Nocta UI components
│   └── header.tsx         # App header with auth controls
├── lib/                   # Utility functions
│   ├── auth.ts            # Supabase auth functions
│   └── supabase.ts        # Supabase client
└── database-migration.sql # Database setup script
```

## Database Schema

### Profiles Table

```sql
CREATE TABLE profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_user_profile UNIQUE (user_id)
);
```

## Customization

### Adding New Profile Fields

1. Update the database schema
2. Modify the `UserDetail` type in `app/page.tsx`
3. Update the form components
4. Update the profile display

### Styling

The app uses Nocta UI components with Tailwind CSS. You can customize:
- Colors using Nocta's theme system
- Component variants and sizes
- Layout and spacing

### Authentication

Supabase Auth handles all authentication. You can extend it with:
- Social login providers
- Email verification
- Password reset flows
- Multi-factor authentication

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables
4. Deploy!

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

- [Nocta UI Documentation](https://www.nocta-ui.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)

---

Built with ❤️ using [Nocta UI](https://www.nocta-ui.com/) and [Supabase](https://supabase.com)
