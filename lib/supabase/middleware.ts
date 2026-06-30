import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PUBLIC_PATHS = ['/login']

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user }, error } = await supabase.auth.getUser()

  // Stale or revoked refresh token — clear every sb-* cookie so the browser
  // stops sending the dead token on every request (which is what causes the
  // repeated console error). Then redirect to login for a fresh sign-in.
  if (error && (error as { code?: string }).code === 'refresh_token_not_found') {
    const loginUrl = new URL('/login', request.url)
    const clearResponse = NextResponse.redirect(loginUrl)
    request.cookies
      .getAll()
      .filter((c) => c.name.startsWith('sb-'))
      .forEach((c) => clearResponse.cookies.delete(c.name))
    return clearResponse
  }

  const isPublicPath = PUBLIC_PATHS.some((path) => request.nextUrl.pathname.startsWith(path))

  if (!user && !isPublicPath) {
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  if (user && isPublicPath) {
    return NextResponse.redirect(new URL('/quotes', request.url))
  }

  return response
}
