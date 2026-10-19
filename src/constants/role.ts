export const role = {
  superAdmin: "SUPER_ADMIN",
  admin: "ADMIN",
  sender: "SENDER",
  receiver: "RECEIVER"
} as const;

export type Role = (typeof role)[keyof typeof role];