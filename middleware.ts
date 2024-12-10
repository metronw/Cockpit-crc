
import { withAuth } from "next-auth/middleware"
import { NextResponse, NextRequest } from 'next/server'

export default withAuth(
  // `withAuth` augments your `Request` with the user's token.
  function middleware(req) {
    const token = req.nextauth.token
    const url = req.nextUrl.clone();

    if(!token){    
      url.pathname = "/api/auth/signin";  
      return NextResponse.redirect(url)
    }
    
    if (req.nextUrl.pathname.startsWith("/monitor")) {
      if (!(token.roles?.includes('2') || token.roles?.includes('3'))) {
        url.pathname = "/agent/"+token.id; // Redirect to an unauthorized page
        return NextResponse.redirect(url);
      }
    }

    if (req.nextUrl.pathname == "/") {
      if (!(token.roles?.includes('2') || token.roles?.includes('3'))) {
        url.pathname = "/agent/"+token.id; // Redirect to an unauthorized page
      }else{
        url.pathname = "/monitor"
      }
      return NextResponse.redirect(url);
    }

    // Allow access for users with role 2 or 3 to all pages
    return NextResponse.next();

  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  },
)
 
// See "Matching Paths" below to learn more
export const config = {
  // matcher: '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|login).*)',
  matcher: ["/monitor/:path*", "/agent/:path*", "/"],
}