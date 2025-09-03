import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import { NextApiRequest, NextApiResponse } from "next";
import NextAuth from "next-auth";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { MongoClient } from "mongodb";

// Create MongoDB client for NextAuth
const client = new MongoClient(process.env.MONGO_URI || "");
const clientPromise = client.connect();

export default async function auth(req: NextApiRequest, res: NextApiResponse) {
  return await NextAuth(req, res, {
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
      async jwt({ token, user, account }) {
        if (user) {
          token.name = user.name;
        }
        
        // Store role information from the sign-in request
        // You can access the role from the request or state
        if (account && account.provider) {
          // Extract role from the sign-in request if available
          // This is a basic implementation - you might need to adjust based on your needs
          token.role = token.role || null;
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
        
        // Add role to session
        if (token?.role) {
          session.user.role = token.role;
        }
        
        return session;
      },
    },
    pages: {
      signIn: "/login",
    },
    session: {
      strategy: "jwt",
    },
  });
}