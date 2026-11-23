import { Role, ROUTES } from "@/lib/constants";

export type NavIcon = "assignments" | "new";

export interface NavItem {
  label: string;
  href: string;
  icon: NavIcon;
}

const STUDENT_ITEMS: readonly NavItem[] = [{ label: "Assignments", href: ROUTES.STUDENT, icon: "assignments" }];

const PROFESSOR_ITEMS: readonly NavItem[] = [
  { label: "Assignments", href: ROUTES.PROFESSOR, icon: "assignments" },
  { label: "New assignment", href: ROUTES.PROFESSOR_NEW_ASSIGNMENT, icon: "new" },
];

/** The sidebar menu for a role. Profile and Log out sit below it for everyone. */
export function navItemsFor(role: Role): readonly NavItem[] {
  return role === Role.PROFESSOR ? PROFESSOR_ITEMS : STUDENT_ITEMS;
}

/** The role a page belongs to, or null for pages every signed-in person can open (Profile). */
export function areaRoleFor(pathname: string): Role | null {
  if (pathname === ROUTES.STUDENT || pathname.startsWith(`${ROUTES.STUDENT}/`)) return Role.STUDENT;
  if (pathname === ROUTES.PROFESSOR || pathname.startsWith(`${ROUTES.PROFESSOR}/`)) return Role.PROFESSOR;
  return null;
}
