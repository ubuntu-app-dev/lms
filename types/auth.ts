export type DashboardUser = {
  id: string;
  email: string;
  fullName: string;
  role: string;
  approvalStatus: string;
};

export type NavigationUser = DashboardUser & {
  unreadNotifications: number;
};
