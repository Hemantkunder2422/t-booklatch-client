export type WorkspaceRole =
  | "Owner"
  | "Admin"
  | "Manager"
  | "Coordinator"
  | "Viewer";

export interface InviteDetails {
  token: string;
  email: string;
  organization: string;
  role: WorkspaceRole;
  invitedBy: {
    name: string;
    email: string;
  };
  /** ISO date string after which the invite is no longer valid. */
  expiresAt: string;
}

export interface AcceptInvitePayload {
  token: string;
  username: string;
  password: string;
}
