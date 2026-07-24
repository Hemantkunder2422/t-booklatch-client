import type { Metadata } from "next";
import { DocsShell } from "@/features/docs/docs-shell";

export const metadata: Metadata = {
  title: "Docs — Run your venue",
  description:
    "Learn BookLatch by the job you're doing, not the menu you're in. Scenario-first guides, one mental model, and a path for every role.",
};

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DocsShell>{children}</DocsShell>;
}
