// types/next-auth.d.ts (TypeScript definitions)
import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role?: "patient" | "dentist";
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role?: "patient" | "dentist";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "patient" | "dentist";
  }
}
