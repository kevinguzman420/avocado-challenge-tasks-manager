export enum UserRole {
  ADMIN = "admin",
  REGULAR = "regular",
}

export const ROLE_LABELS = {
  [UserRole.ADMIN]: "Administrator",
  [UserRole.REGULAR]: "Regular User",
};

export const ROLE_COLORS = {
  [UserRole.ADMIN]: "bg-purple-100 text-purple-800",
  [UserRole.REGULAR]: "bg-blue-100 text-blue-800",
};
