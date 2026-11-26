import type { Metadata } from "next";

import { ShellPage } from "@/features/app-shell/components/ShellPage";
import { ProfileView } from "@/features/profile/components/ProfileView";

export const metadata: Metadata = { title: "Profile" };

export default function ProfilePage() {
  return (
    <ShellPage title="Profile">
      <ProfileView />
    </ShellPage>
  );
}
