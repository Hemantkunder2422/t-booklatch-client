import { api } from "@/lib/axios";
import type { AcceptInvitePayload, InviteDetails } from "./types";

/**
 * Sample invite used when no backend is wired up yet.
 * Replace the request bodies below with your real endpoints.
 */
function sampleInvite(token: string): InviteDetails {
  return {
    token,
    email: "jordan.lee@aurora-events.com",
    organization: "Aurora Events",
    role: "Manager",
    invitedBy: {
      name: "Sarah Chen",
      email: "sarah.chen@aurora-events.com",
    },
    expiresAt: "2026-07-01T00:00:00.000Z",
  };
}

/** Fetch invite details for a token so we can show who invited the user. */
export async function getInvite(token: string): Promise<InviteDetails> {
  try {
    const { data } = await api.get<InviteDetails>(`/invites/${token}`);
    return data;
  } catch {
    return sampleInvite(token);
  }
}

/** Accept an invite — creates the account and activates membership. */
export async function acceptInvite(
  payload: AcceptInvitePayload,
): Promise<{ ok: true }> {
  await api.post("/invites/accept", payload);
  return { ok: true };
}
