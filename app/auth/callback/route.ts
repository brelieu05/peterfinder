import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { isUciEmail } from '@/lib/utils/email'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('OAuth callback error:', error.message)
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`)
    }

    const userEmail = data.user?.email
    
    if (!userEmail || !isUciEmail(userEmail)) {
      await supabase.auth.signOut()
      
      const errorMessage = 'Only UCI email addresses (@uci.edu) are allowed. Please sign in with your UCI Google account.'
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(errorMessage)}`)
    }

    return NextResponse.redirect(`${origin}${next}`)
  }

  return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent('Authentication failed. Please try again.')}`)
}
