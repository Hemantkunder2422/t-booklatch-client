"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { acceptInvite, getInvite } from "./api";
import type { AcceptInvitePayload } from "./types";

export const inviteKeys = {
  all: ["invite"] as const,
  detail: (token: string) => [...inviteKeys.all, token] as const,
};

/** Load the invite details for a given token. */
export function useInvite(token: string) {
  return useQuery({
    queryKey: inviteKeys.detail(token),
    queryFn: () => getInvite(token),
    enabled: Boolean(token),
    staleTime: Infinity,
    retry: false,
  });
}

/** Accept the invite and create the account. */
export function useAcceptInvite() {
  return useMutation({
    mutationFn: (payload: AcceptInvitePayload) => acceptInvite(payload),
  });
}
