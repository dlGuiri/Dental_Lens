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
        // Add allowDangerousEmailAccountLinking here for newer versions
        allowDangerousEmailAccountLinking: true,
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
        // Add allowDangerousEmailAccountLinking here too
        allowDangerousEmailAccountLinking: true,
      }),
    ],
    callbacks: {
      async signIn({ user, account, profile, email, credentials }) {
        console.log("=== SIGN IN DEBUG ===");
        console.log("User:", user);
        console.log("Account:", account);
        console.log("Profile:", profile);
        console.log("==================");
        
        // Always allow OAuth sign-ins (will create new accounts automatically)
        if (account?.provider === "github" || account?.provider === "google") {
          return true;
        }
        
        return true;
      },
      async jwt({ token, user, account }) {
        if (user) {
          token.name = user.name;
        }
        
        if (account && account.provider) {
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