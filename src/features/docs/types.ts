/**
 * Content model for the public `/docs` site.
 *
 * Docs are authored as structured data (not free-form MDX) so that a single
 * source drives the rendered page, the sidebar navigation, and the ⌘K search
 * index — and so every page renders with the same theme-aware primitives.
 */

/** A single renderable block within a scenario or role page. */
export type Block =
  | { kind: "prose"; text: string }
  | { kind: "heading"; text: string }
  | { kind: "steps"; items: Step[] }
  | { kind: "callout"; tone: CalloutTone; title?: string; text: string }
  | { kind: "keypoints"; title?: string; items: string[] };

export type CalloutTone = "tip" | "note" | "warning";

export interface Step {
  title: string;
  detail?: string;
}

export type RoleId = "owner" | "coordinator" | "finance";

/** A jobs-to-be-done guide — organized around a real venue moment. */
export interface Scenario {
  slug: string;
  /** The situation, phrased the way a user would think of it. */
  title: string;
  /** One-line framing of the moment this guide covers. */
  tagline: string;
  /** Rough reading time, e.g. "3 min". */
  time: string;
  /** Which roles most often live this scenario. */
  roles: RoleId[];
  /** Product areas this scenario threads through (used as chips). */
  touches: string[];
  blocks: Block[];
  /** Slugs of related scenarios. */
  related: string[];
}

/** A "start here" path tailored to one kind of person. */
export interface Role {
  id: RoleId;
  name: string;
  /** Who this person is, in their words. */
  tagline: string;
  intro: string;
  /** Ordered scenario slugs that make up this role's happy path. */
  path: string[];
}

/** One entity in the BookLatch domain model. */
export interface Concept {
  id: string;
  name: string;
  /** One-liner shown in the diagram / list. */
  short: string;
  detail: string;
}

export interface NavItem {
  title: string;
  href: string;
  description?: string;
  keywords?: string[];
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}
