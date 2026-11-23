import type { Metadata } from "next";

import { AuthFooterLink, AuthLayout } from "@/features/auth/components/AuthLayout";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { LoginIntro } from "@/features/auth/components/LoginIntro";
import { ROUTES } from "@/lib/constants";

export const metadata: Metadata = { title: "Log in" };

export default function LoginPage() {
  return (
    <AuthLayout
      title="Log in"
      description={<LoginIntro />}
      footer={
        <>
          New here? <AuthFooterLink href={ROUTES.SIGNUP}>Create an account</AuthFooterLink>
        </>
      }
    >
      <LoginForm />
    </AuthLayout>
  );
}
