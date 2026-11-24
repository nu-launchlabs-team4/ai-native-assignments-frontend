import { AppShell } from "@/features/app-shell/components/AppShell";

// The signed-in home pages and Profile share the sidebar. The student workspace and the
// professor's full-screen tools stay outside this group so they keep the whole width.
export default function ShellLayout({ children }: LayoutProps<"/">) {
  return <AppShell>{children}</AppShell>;
}
