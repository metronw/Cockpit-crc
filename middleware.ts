import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
 
// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const token = request.cookies.get('logged_user');
  if(token){
    // const user = JSON.parse(token.value)
    // return NextResponse.redirect(new URL('/agent/'+user.id, request.url))
    return NextResponse.next()
  }
  return NextResponse.redirect(new URL('/login', request.url))
}
 
// See "Matching Paths" below to learn more
export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|login).*)',
}