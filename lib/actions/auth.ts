'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { isUciEmail } from '@/lib/utils/email'

export async function signUp(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string

  if (!isUciEmail(email)) {
    return { error: 'Only UCI email addresses (@uci.edu) are allowed.' }
  }

  const data = {
    email,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signUp(data)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signIn(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string

  if (!isUciEmail(email)) {
    return { error: 'Only UCI email addresses (@uci.edu) are allowed.' }
  }

  const data = {
    email,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signInWithGoogle() {
  const supabase = await createClient()
  const headersList = await headers()

  // Use environment variable if set, otherwise try to detect from headers
  let siteUrl = process.env.NEXT_PUBLIC_SITE_URL

  if (!siteUrl) {
    const host = headersList.get('x-forwarded-host') || headersList.get('host')
    const protocol = headersList.get('x-forwarded-proto') || 'https'
    siteUrl = `${protocol}://${host}`
  }

  // Ensure the URL is properly formatted
  const base = siteUrl.startsWith('http') ? siteUrl : `https://${siteUrl}`
  const trimmedBase = base.endsWith('/') ? base.slice(0, -1) : base
  const redirectTo = `${trimmedBase}/auth/callback`

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
        hd: 'uci.edu',
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  if (data.url) {
    redirect(data.url)
  }

  return { error: 'Failed to initiate Google sign-in' }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}

export async function getUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}
