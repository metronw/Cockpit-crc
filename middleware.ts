import { withAuth } from "next-auth/middleware";
import { NextResponse, NextRequest } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const url = req.nextUrl.clone();

    // Redirect to sign-in page if no token
    if (!token || token.id == 0 ) {
      url.pathname = "/api/auth/signin";
      return NextResponse.redirect(url);
    }

    // if(!token.terms_accepted){
    //   url.pathname = '/compliance'
    //   return NextResponse.redirect(url);
    // }

    // Authorization logic for specific routes
    if (req.nextUrl.pathname.startsWith("/monitor")) {
      if (!(token.roles?.includes("2") || token.roles?.includes("3"))) {
        url.pathname = "/agent/" + token.id; // Redirect unauthorized users
        return NextResponse.redirect(url);
      }
    }

    if (req.nextUrl.pathname === "/") {
      if (!(token.roles?.includes("2") || token.roles?.includes("3"))) {
        url.pathname = "/agent/" + token.id; // Redirect unauthorized users
      } else {
        url.pathname = "/monitor"; // Redirect authorized users
      }
      return NextResponse.redirect(url);
    }

    // Allow access to all other pages for authenticated users
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token, // Only allow access if token exists
    },
  }
);

// Configure middleware to match additional API routes
export const config = {
  matcher: [
    "/monitor/:path*",
    "/agent/:path*",
    "/",
    "/api/phone/:path*" // Protect the `prefix` API route
  ],
};
