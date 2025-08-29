// Update your existing declaration file
import mongoose from "mongoose";
import { DefaultSession } from "next-auth";

declare global {
    var mongoose: mongoose;
}

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            role?: "patient" | "dentist" | null;
        } & DefaultSession["user"];
    }

    interface User {
        role?: "patient" | "dentist" | null;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        role?: "patient" | "dentist" | null;
    }
}