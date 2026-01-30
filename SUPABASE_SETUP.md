# Supabase Setup Guide

## What You Need from Supabase Dashboard

1. **Go to your Supabase project dashboard**: https://supabase.com/dashboard

2. **Create a new project** (if you haven't already)

3. **Get your API credentials**:
   - Navigate to: **Settings** → **API**
   - Copy the following values:
     - `Project URL` → This is your `NEXT_PUBLIC_SUPABASE_URL`
     - `anon public` key → This is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`

4. **Add these to your `.env.local` file**:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

## Setting Up Database

1. **Navigate to**: **Database** → **Tables**
2. Create your tables using the SQL editor or table editor
3. Example SQL to create a sample table:
   ```sql
   create table posts (
     id uuid default gen_random_uuid() primary key,
     created_at timestamp with time zone default timezone('utc'::text, now()) not null,
     title text not null,
     content text,
     user_id uuid references auth.users not null
   );

   -- Enable Row Level Security
   alter table posts enable row level security;

   -- Create policies
   create policy "Users can view their own posts"
     on posts for select
     using (auth.uid() = user_id);

   create policy "Users can create their own posts"
     on posts for insert
     with check (auth.uid() = user_id);
   ```

## Setting Up Storage

1. **Navigate to**: **Storage** → **Create a new bucket**
2. Configure your bucket:
   - **Name**: Choose a name (e.g., `avatars`, `documents`, etc.)
   - **Public bucket**: Toggle ON if files should be publicly accessible
   - Click **Create bucket**

3. **Set up Storage Policies** (if needed):
   ```sql
   -- Allow authenticated users to upload files
   create policy "Users can upload files"
     on storage.objects for insert
     with check (bucket_id = 'your-bucket-name' AND auth.role() = 'authenticated');

   -- Allow users to view files
   create policy "Users can view files"
     on storage.objects for select
     using (bucket_id = 'your-bucket-name');

   -- Allow users to delete their own files
   create policy "Users can delete their own files"
     on storage.objects for delete
     using (bucket_id = 'your-bucket-name' AND auth.uid() = owner);
   ```

## Setting Up Authentication

1. **Navigate to**: **Authentication** → **Providers**
2. **Email provider** is enabled by default
3. **Optional**: Enable additional providers:
   - Google, GitHub, Discord, etc.
   - Configure OAuth credentials for each provider

4. **Configure Auth Settings**:
   - **Site URL**: Add your production URL
   - **Redirect URLs**: Add allowed redirect URLs (e.g., `http://localhost:3000/**` for development)

## Project Structure

```
lib/
├── supabase/
│   ├── client.ts           # Client-side Supabase client
│   ├── server.ts           # Server-side Supabase client
│   └── middleware.ts       # Auth middleware helper
├── actions/
│   ├── auth.ts             # Auth server actions
│   ├── database.ts         # Database server actions
│   └── storage.ts          # Storage server actions
```

## Usage Examples

### Client Component (Using Supabase in Browser)
```typescript
'use client'
import { createClient } from '@/lib/supabase/client'

export default function MyComponent() {
  const supabase = createClient()
  // Use supabase client
}
```

### Server Component (Using Supabase on Server)
```typescript
import { createClient } from '@/lib/supabase/server'

export default async function MyComponent() {
  const supabase = await createClient()
  const { data } = await supabase.from('posts').select('*')
  // Use data
}
```

### Server Actions (Mutations)
```typescript
'use server'
import { createClient } from '@/lib/supabase/server'

export async function createPost(formData: FormData) {
  const supabase = await createClient()
  // Perform database operations
}
```

## Testing Your Setup

1. Start your dev server:
   ```bash
   yarn dev
   ```

2. Visit `http://localhost:3000/login` to test authentication

3. Check the examples in `app/examples/` for client and server component usage

## Common Operations

### Database
- **Select**: `supabase.from('table').select('*')`
- **Insert**: `supabase.from('table').insert({ data })`
- **Update**: `supabase.from('table').update({ data }).eq('id', id)`
- **Delete**: `supabase.from('table').delete().eq('id', id)`

### Storage
- **Upload**: `supabase.storage.from('bucket').upload('path', file)`
- **Download**: `supabase.storage.from('bucket').download('path')`
- **Get URL**: `supabase.storage.from('bucket').getPublicUrl('path')`
- **Delete**: `supabase.storage.from('bucket').remove(['path'])`

### Auth
- **Sign up**: `supabase.auth.signUp({ email, password })`
- **Sign in**: `supabase.auth.signInWithPassword({ email, password })`
- **Sign out**: `supabase.auth.signOut()`
- **Get user**: `supabase.auth.getUser()`

## Next Steps

1. Update `.env.local` with your actual Supabase credentials
2. Create your database tables
3. Set up storage buckets
4. Configure authentication providers
5. Start building your app!

## Resources

- [Supabase Docs](https://supabase.com/docs)
- [Next.js + Supabase Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
