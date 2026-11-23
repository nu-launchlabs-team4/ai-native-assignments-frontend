import type { Metadata } from "next";

import { AuthFooterLink, AuthLayout } from "@/features/auth/components/AuthLayout";
import { ResetPasswordForm } from "@/features/auth/components/ResetPasswordForm";
import { ROUTES } from "@/lib/constants";

export const metadata: Metadata = { title: "Choose a new password" };

export default function ResetPasswordPage() {
  return (
    <AuthLayout
      title="Choose a new password"
      description="You'll be logged in once it's saved."
      footer={
        <>
          Remembered it? <AuthFooterLink href={ROUTES.LOGIN}>Log in</AuthFooterLink>
        </>
      }
    >
      <ResetPasswordForm />
    </AuthLayout>
  );
}
