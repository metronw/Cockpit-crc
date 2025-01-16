import { NextAuthOptions, Session } from "next-auth";
import AzureADProvider from "next-auth/providers/azure-ad";
import CredentialsProvider from "next-auth/providers/credentials";
import { loginSSO } from "@/app/actions/login";
import bcrypt from 'bcrypt'; // Assuming passwords are hashed in the database
import prisma  from '@/app/lib/localDb';
import { syncUserGestor } from "../actions/api";


// Defining the authOptions with proper types
export const authOptions: NextAuthOptions = {
  providers: [
    // Azure AD provider configuration
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      tenantId: process.env.AZURE_AD_TENANT_ID!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "pessoa@email.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {

        const { email, password } = credentials || {};
        
        const user = await prisma.user.findUnique({
          where: { email },
        });
      
        if (!user || !bcrypt.compare(password ?? '', user.password)) {
          throw new Error('Invalid email or password');
        }

        return { id: user.id, name: user.name ?? '', email: user.email, metro_id: user.metro_id };
      },
    }),
  ],
  callbacks: {
    // Handling the JWT callback
    async jwt({ token, user, account }) {      
      
      // If user is available, add it to the token
      if (user) {
        const metro_id = await syncUserGestor(user.email ?? ``)
        const localUser = await loginSSO({email:user.email ?? '', name: user.name ?? '', metro_id })
        
        token.id = localUser.id;
        token.email = localUser.email;
        token.name = localUser.name;
        token.metro_id = localUser.metro_id;

        if (account?.id_token) {
          // Decode Azure AD token to extract roles
          const decodedToken = JSON.parse(
            Buffer.from(account.id_token.split('.')[1], 'base64').toString()
          );
          token.roles = decodedToken.roles || [];
        }else{
          token.roles = ['1']
        }
      }
      
      return token;
    },
    // Handling session callback
    async session({ session, token }) {
      const newSession: Session = {...session, user: {id:token.id, email:token.email ?? '', name: token.name ?? '', roles: token.roles ?? [], metro_id: token.metro_id}}
      return newSession;
    },
  },
  session: {
    strategy: "jwt", // Use JWT for session management
    maxAge: 12 * 60 * 60
  },
  secret: process.env.NEXTAUTH_SECRET! ?? '0dOzK3k2p+NSShP3OZIElctLLPRs6doJ0Jue14pIHoM=',
  pages:{
    signIn: '/login',
    // signOut: '/login'
  }
};
