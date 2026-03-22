import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Paths that require an authenticated session
const PROTECTED_PREFIXES = [
  '/dashboard',
  '/projects',
  '/invoices',
  '/clients',
  '/staff',
  '/users',
]

// Paths that are only for unauthenticated users (redirect away if already logged in)
const AUTH_ONLY_PATHS = ['/']

// Paths that the middleware should leave completely alone
const PUBLIC_PATHS = ['/auth/callback', '/setup-password']

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request: { headers: request.headers },
  })

  const pathname = request.nextUrl.pathname

  // Don't touch public/auth utility routes
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return supabaseResponse
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Always call getUser() — this refreshes the session cookie when needed
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))
  const isAuthOnly = AUTH_ONLY_PATHS.includes(pathname)

  // Not logged in and trying to reach a protected page → login
  if (!user && isProtected) {
    const loginUrl = new URL('/', request.url)
    loginUrl.searchParams.set('redirected', '1')
    return NextResponse.redirect(loginUrl)
  }

  // Already logged in and on the login page → redirect to their dashboard
  if (user && isAuthOnly) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role) {
      return NextResponse.redirect(new URL(`/dashboard/${profile.role}`, request.url))
    }

    // No profile yet (newly invited user) — send to setup-password
    return NextResponse.redirect(new URL('/setup-password', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT static files and Next.js internals
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
