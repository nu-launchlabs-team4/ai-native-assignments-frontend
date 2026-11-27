import type { Metadata } from "next";

import { ShellPage } from "@/features/app-shell/components/ShellPage";
import { StudentHome } from "@/features/student-home/components/StudentHome";

export const metadata: Metadata = { title: "Student" };

export default function StudentPage() {
  return (
    <ShellPage title="Assignments" description="Join a course, then work through each assignment in five steps.">
      <StudentHome />
    </ShellPage>
  );
}
