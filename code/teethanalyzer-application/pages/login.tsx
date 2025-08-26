// pages/login.tsx
import LoginForm from "@/components/LoginPage/LoginForm";
import type { ReactElement } from "react";

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-white px-4">
      <LoginForm />
    </main>
  );
}

// This tells _app.tsx to skip the Layout
LoginPage.getLayout = function PageLayout(page: ReactElement) {
  return page;
};