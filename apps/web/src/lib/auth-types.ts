export type UserRole = 'ADMIN' | 'FOUNDER' | 'INVESTOR';

export type CurrentUser = {
  id: string;
  email: string;
  roles: UserRole[];
  status: string;
  profileStatus?: {
    founderProfileComplete: boolean;
    investorProfileComplete: boolean;
    organizationComplete: boolean;
  };
  organizationMemberships?: unknown[];
};

export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  user: CurrentUser;
};

