// pages/api/auth/[...nextauth].ts (Fixed)
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import { NextApiRequest, NextApiResponse } from "next";
import NextAuth, { NextAuthOptions } from "next-auth";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { MongoClient, ObjectId } from "mongodb";

// Create MongoDB client for NextAuth
const client = new MongoClient(process.env.MONGO_URI || "");
const clientPromise = client.connect();

export const authOptions: NextAuthOptions = {
  // MongoDB adapter
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
      profile(profile) {
        console.log("GitHub Profile:", profile);
        return {
          id: profile.id.toString(),
          name: profile.name || profile.login,
          email: profile.email,
          image: profile.avatar_url,
        };
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      console.log("User signing in:", user);
      return true;
    },
    async jwt({ token, user, account, trigger, session }) {
      // If user is signing in for the first time
      if (user) {
        token.name = user.name;
        token.role = user.role || null;
      }

      // Handle role updates from client
      if (trigger === "update" && session?.user?.role) {
        token.role = session.user.role;
      }

      // Fetch role from database if not in token (for existing users)
      if (!token.role && token.sub) {
        try {
          await client.connect();
          const db = client.db();
          const users = db.collection('users');
          
          // Try both ObjectId and string formats
          let dbUser;
          try {
            const { ObjectId } = require('mongodb');
            dbUser = await users.findOne({ _id: new ObjectId(token.sub) });
          } catch (e) {
            // Fallback to string ID
            dbUser = await users.findOne({ _id: new ObjectId(token.sub) });
          }
          
          if (dbUser && dbUser.role) {
            token.role = dbUser.role;
          }
        } catch (error) {
          console.error('Error fetching user role from JWT callback:', error);
        }
      }

      return token;
    },
    async session({ session, token, user }) {
      console.log("Session callback token:", token);
      console.log("Session before:", session);
      
      if (token?.sub) {
        session.user.id = token.sub;
      }
      
      if (!session.user.name && token?.name) {
        session.user.name = token.name;
      }
      
      // Add role to session from token
      if (token?.role) {
        session.user.role = token.role;
      }

      console.log("Session after:", session);
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  debug: process.env.NODE_ENV === "development",
};

export default async function auth(req: NextApiRequest, res: NextApiResponse) {
  return await NextAuth(req, res, authOptions);
}