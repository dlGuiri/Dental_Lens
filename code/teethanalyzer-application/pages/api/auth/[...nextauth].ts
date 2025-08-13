import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import { NextApiRequest, NextApiResponse } from "next";
import NextAuth from "next-auth";
import { createUser, findUserByOauthId } from "mongoose/users/services";
import type { UserType } from "mongoose/users/schema";

export default async function auth(req: NextApiRequest, res: NextApiResponse) {
  return await NextAuth(req, res, {
    providers: [
      GithubProvider({
        clientId: process.env.GITHUB_CLIENT_ID || "",
        clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
        profile(profile) {
            console.log("GitHub Profile:", profile);
            return {
                id: profile.id.toString(),
                name: profile.name || profile.login, // fallback
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
        const oauthProvider = account?.provider as UserType["oauthProvider"];;
        const oauthId = account?.providerAccountId;

        if (!oauthProvider || !oauthId) return false;

        const existingUser = await findUserByOauthId(oauthId);
        if (!existingUser) {
          await createUser({
            oauthProvider,
            oauthId,
            name: user.name || "Unnamed",
            email: user.email,
            avatarUrl: user.image,
          });
        }

        return true;
      },

      async jwt({ token, user, account }) {
        if (account?.providerAccountId) {
          token.sub = account.providerAccountId;
        }

        if (user) {
            token.name = user.name;
        }

        return token;
      },

      async session({ session, token }) {
        // Attach oauthId for GraphQL queries
        if (token?.sub) {
          session.user.oauthId = token.sub;
        }

        if (!session.user.name && token?.name) {
            session.user.name = token.name;
        }

        return session;
      },    
    },
    pages: {
      signIn: "/login", // Optional: your custom login page
    },
    session: {
      strategy: "jwt",
    },
  });
}
