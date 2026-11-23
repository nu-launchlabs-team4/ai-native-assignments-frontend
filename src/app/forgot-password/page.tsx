import type { Metadata } from "next";

import { AuthFooterLink, AuthLayout } from "@/features/auth/components/AuthLayout";
import { ForgotPasswordForm } from "@/features/auth/components/ForgotPasswordForm";
import { ROUTES } from "@/lib/constants";

export const metadata: Metadata = { title: "Reset your password" };

export default function ForgotPasswordPage() {
  return (
    <AuthLayout
      title="Reset your password"
      description="Enter your email and you'll get a link to choose a new password."
      footer={
        <>
          Remembered it? <AuthFooterLink href={ROUTES.LOGIN}>Log in</AuthFooterLink>
        </>
      }
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
