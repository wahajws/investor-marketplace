import { createContext, ReactNode, useContext, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { clearSession, getRefreshToken, saveSession } from '../../lib/auth-storage';
import type { CurrentUser, UserRole } from '../../lib/auth-types';
import * as authApi from './auth-api';

type AuthContextValue = {
  user: CurrentUser | null;
  isLoading: boolean;
  login: (input: { email: string; password: string }) => Promise<CurrentUser>;
  register: (input: { email: string; password: string; role: Exclude<UserRole, 'ADMIN'> }) => Promise<CurrentUser>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const meQuery = useQuery({
    queryKey: ['auth.me'],
    queryFn: authApi.getMe,
    retry: false
  });

  const loginMutation = useMutation({
    mutationFn: authApi.login
  });

  const registerMutation = useMutation({
    mutationFn: authApi.register
  });

  const value = useMemo<AuthContextValue>(
    () => ({
      user: meQuery.data ?? null,
      isLoading: meQuery.isLoading,
      login: async (input) => {
        const auth = await loginMutation.mutateAsync(input);
        saveSession(auth);
        queryClient.setQueryData(['auth.me'], auth.user);
        return auth.user;
      },
      register: async (input) => {
        const auth = await registerMutation.mutateAsync(input);
        saveSession(auth);
        queryClient.setQueryData(['auth.me'], auth.user);
        return auth.user;
      },
      logout: async () => {
        const refreshToken = getRefreshToken();
        if (refreshToken) {
          await authApi.logout(refreshToken).catch(() => undefined);
        }
        clearSession();
        queryClient.setQueryData(['auth.me'], null);
        queryClient.clear();
      }
    }),
    [loginMutation, meQuery.data, meQuery.isLoading, queryClient, registerMutation]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error('useAuth must be used inside AuthProvider.');
  }
  return value;
}

