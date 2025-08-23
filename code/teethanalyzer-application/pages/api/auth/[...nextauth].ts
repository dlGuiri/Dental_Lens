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
    // Add MongoDB adapter - this is what was missing!
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
      async signIn({ user, account }) {
        // With MongoDB adapter, this is handled automatically
        console.log("User signing in:", user);
        return true;
      },

      async jwt({ token, user }) {      
        if (user) {
          token.name = user.name;
        }
        
        return token;
      },

      async session({ session, token }) {
        console.log("Session callback token:", token);
        console.log("Session before:", session);

        if (token?.sub) {
          session.user.id = token.sub;
        }
        
        if (!session.user.name && token?.name) {
          session.user.name = token.name;
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