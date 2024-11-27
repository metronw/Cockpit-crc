import { NextAuthOptions } from "next-auth";
import AzureADProvider from "next-auth/providers/azure-ad";
import { loginSSO } from "@/app/actions/login";

// Defining the authOptions with proper types
export const authOptions: NextAuthOptions = {
  providers: [
    // Azure AD provider configuration
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      tenantId: process.env.AZURE_AD_TENANT_ID!,
    }),
  ],
  callbacks: {
    // Handling the JWT callback
    async jwt({ token, user }) {
      // If user is available, add it to the token
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;

        loginSSO({email:user.email ?? '', name: user.name ?? ''})
      }
      return token;
    },
    // Handling session callback
    async session({ session, token }) {
      
      // Attach the token properties to the session
      loginSSO({email:token.email ?? '', name: token.name ?? ''})
      
      // session.user.id = token.id;
      // session.user.email = token.email;
      // session.user.name = token.name;
      return session;
    },
  },
  session: {
    strategy: "jwt", // Use JWT for session management
  },
  secret: process.env.NEXTAUTH_SECRET! ?? '0dOzK3k2p+NSShP3OZIElctLLPRs6doJ0Jue14pIHoM=',
  // pages:{
  //   signIn: '/monitor',
  //   signOut: '/login'
  // }
};