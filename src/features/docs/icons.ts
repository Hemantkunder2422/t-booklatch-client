import {
  Building2,
  CalendarCheck,
  CreditCard,
  type LucideIcon,
  IndianRupee,
  MessageCircle,
  Phone,
  Search,
  Send,
  ShieldCheck,
  Users,
  Wallet,
} from "lucide-react";
import type { RoleId } from "./types";

/**
 * Icon registry for docs. Kept out of `content.ts` so the content stays plain,
 * serializable data — components map slugs/ids to icons here. Only icons known
 * to exist in this project's lucide version are used.
 */

export const SCENARIO_ICON: Record<string, LucideIcon> = {
  "an-enquiry-just-came-in": MessageCircle,
  "turn-an-enquiry-into-a-quote": Send,
  "confirm-the-booking": CalendarCheck,
  "collect-a-deposit": Wallet,
  "is-the-space-free": Search,
  "set-up-a-new-venue": Building2,
  "close-the-month": IndianRupee,
  "invite-your-team": Users,
};

export const ROLE_ICON: Record<RoleId, LucideIcon> = {
  owner: ShieldCheck,
  coordinator: Phone,
  finance: CreditCard,
};

/** Fallback for any scenario without an explicit mapping. */
export const DEFAULT_SCENARIO_ICON: LucideIcon = CalendarCheck;
