import type { Metadata } from "next";

import { AuthFooterLink, AuthLayout } from "@/features/auth/components/AuthLayout";
import { SignupForm } from "@/features/auth/components/SignupForm";
import { ROUTES } from "@/lib/constants";

export const metadata: Metadata = { title: "Create an account" };

export default function SignupPage() {
  return (
    <AuthLayout
      title="Create an account"
      footer={
        <>
          Already have an account? <AuthFooterLink href={ROUTES.LOGIN}>Log in</AuthFooterLink>
        </>
      }
    >
      <SignupForm />
    </AuthLayout>
  );
}
