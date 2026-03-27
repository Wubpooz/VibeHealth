export interface User {
  id: string;
  email: string;
  name: string | null;
  image?: string | null;
  emailVerified: boolean;
  role?: 'USER' | 'CAREGIVER' | 'ADMIN';
  createdAt?: string;
  updatedAt?: string;
}

export interface Session {
  id: string;
  userId: string;
  token: string;
  expiresAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface SignInCredentials {
  email: string;
  password: string;
}

export interface SignUpCredentials {
  email: string;
  password: string;
  name?: string;
}

export interface AuthResponse {
  user: User;
  session?: Session;
}

export interface AuthError {
  error: string;
  message?: string;
}

export type OAuthProvider = 'google' | 'github' | 'apple';
