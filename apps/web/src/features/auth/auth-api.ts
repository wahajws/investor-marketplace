import { apiGet, apiPost } from '../../lib/api-client';
import type { AuthResponse, CurrentUser, UserRole } from '../../lib/auth-types';

export function login(input: { email: string; password: string }) {
  return apiPost<AuthResponse>('/auth/login', input);
}

export function register(input: { email: string; password: string; role: Exclude<UserRole, 'ADMIN'> }) {
  return apiPost<AuthResponse>('/auth/register', input);
}

export function logout(refreshToken: string) {
  return apiPost<{ success: boolean }>('/auth/logout', { refreshToken });
}

export function getMe() {
  return apiGet<CurrentUser>('/auth/me');
}

export function forgotPassword(email: string) {
  return apiPost<{ success: boolean; developmentToken?: string }>('/auth/forgot-password', { email });
}

export function resetPassword(input: { token: string; newPassword: string }) {
  return apiPost<{ success: boolean }>('/auth/reset-password', input);
}

export function verifyEmail(token: string) {
  return apiPost<{ success: boolean }>('/auth/verify-email', { token });
}

