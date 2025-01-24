import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: number;
      email: string;
      name: string;
      roles: string[];
      metro_id?: number;
    };
  }

  interface User extends DefaultUser {
    id: number;
    email: string;
    name: string;
  }

}

declare module "next-auth/jwt" {
  interface JWT {
    id: number; // Custom field for user ID
    roles?: string[]; // Custom field for user role (optional)
    metro_id?:number;
    exp: number;
    email: string;
    
  }
}