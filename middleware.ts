import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Create isolated edge cookie storage strictly refreshing dynamic states!
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy',
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Sync cookies out locally explicitly retaining edge loops smoothly
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Explicitly fetch user metadata locally natively testing payload states
  const { data: { user } } = await supabase.auth.getUser()

  // Secure routing interceptors cleanly dropping unauthenticated loops
  const isAuthRoute = request.nextUrl.pathname === '/'
  const isDashboardRoute = request.nextUrl.pathname.startsWith('/dashboard') || 
                           request.nextUrl.pathname.startsWith('/projects') || 
                           request.nextUrl.pathname.startsWith('/invoices') || 
                           request.nextUrl.pathname.startsWith('/clients') || 
                           request.nextUrl.pathname.startsWith('/staff')

  // If zero identity and targeting internal endpoints, wipe to login gracefully
  if (!user && isDashboardRoute) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // If active user forces a URL routing into login root, brutally redirect explicitly matching active identity payload natively
  if (user && isAuthRoute) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role === 'admin') {
      return NextResponse.redirect(new URL('/dashboard/admin', request.url))
    } else if (profile?.role === 'staff') {
      return NextResponse.redirect(new URL('/dashboard/staff', request.url))
    } else if (profile?.role === 'client') {
      return NextResponse.redirect(new URL('/dashboard/client', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
