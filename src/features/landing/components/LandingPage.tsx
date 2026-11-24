import Link from "next/link";

import { ROUTES } from "@/lib/constants";

import { CONTAINER_CLASS, FOCUS_CLASS } from "../styles";
import { GraduationCapIcon, PersonIcon } from "./icons";
import { LandingHeader } from "./LandingHeader";
import { RoleCard } from "./RoleCard";
import { StepStrip } from "./StepStrip";

const ROLES = [
  {
    href: ROUTES.STUDENT,
    title: "Student",
    description: "Work through an assignment in five steps.",
    action: "Continue as student",
    icon: <GraduationCapIcon />,
  },
  {
    href: ROUTES.PROFESSOR,
    title: "Professor",
    description: "Set up assignments and review submissions.",
    action: "Continue as professor",
    icon: <PersonIcon />,
  },
] as const;

/** The public landing page, in Northeastern's black, white and red. */
export function LandingPage() {
  return (
    <div className="flex flex-1 flex-col bg-brand-page text-brand-ink">
      <LandingHeader />

      <main className={`${CONTAINER_CLASS} flex flex-1 flex-col gap-12 py-12 sm:gap-16 sm:py-20`}>
        <div className="flex max-w-2xl flex-col gap-5">
          <h1 className="text-display tracking-tight">
            <span className="block">Show your work.</span>
            <span className="block">Sharpen your thinking.</span>
          </h1>
          <p className="text-title font-normal text-brand-muted">
            Work through assignments with an AI tutor that gives feedback without giving away the answer.
          </p>
        </div>

        <StepStrip />

        <nav aria-label="Choose your role">
          <ul className="grid gap-4 sm:grid-cols-2 sm:gap-6">
            {ROLES.map((role) => (
              <li key={role.href}>
                <RoleCard {...role} />
              </li>
            ))}
          </ul>
        </nav>
      </main>

      <footer className="border-t border-brand-line">
        <div className={`${CONTAINER_CLASS} py-6`}>
          <Link
            href={ROUTES.STATUS}
            className={`text-footnote text-brand-muted underline-offset-4 hover:text-brand-ink hover:underline ${FOCUS_CLASS}`}
          >
            System status
          </Link>
        </div>
      </footer>
    </div>
  );
}
