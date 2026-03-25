import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, of, firstValueFrom, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { User, SignInCredentials, SignUpCredentials, AuthResponse, AuthError, OAuthProvider } from './auth.types';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly apiUrl = `${environment.apiUrl}/api/auth`;

  // Signals for reactive state
  private readonly userSignal = signal<User | null>(null);
  private readonly loadingSignal = signal(true);
  private readonly errorSignal = signal<string | null>(null);
  private readonly enabledProvidersSignal = signal<OAuthProvider[]>([]);

  // Public computed values
  readonly user = this.userSignal.asReadonly();
  readonly isAuthenticated = computed(() => !!this.userSignal());
  readonly isLoading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();
  readonly enabledProviders = this.enabledProvidersSignal.asReadonly();
  readonly isEmailVerified = computed(() => this.userSignal()?.emailVerified ?? false);

  constructor() {
    // Startup session load should be invoked explicitly by the app bootstrap flow.
  }

  async initSession(): Promise<void> {
    await Promise.all([
      this.loadSession(),
      this.loadOAuthProviders(),
    ]);
  }

  private async loadSession(): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.http.get<{ user: User; session: unknown }>(`${this.apiUrl}/get-session`, {
          withCredentials: true,
        }).pipe(
          catchError((error) => {
            if (!environment.production) {
              console.error('Session load failed:', error);
            }
            return of(null);
          })
        )
      );

      if (response?.user) {
        this.userSignal.set(response.user);
      }
    } finally {
      this.loadingSignal.set(false);
    }
  }

  // Generic helper for auth requests to reduce boilerplate
  private async executeAuthRequest<T>(
    request$: Observable<T>,
    errorMessage: string
  ): Promise<T | null> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    try {
      return await firstValueFrom(
        request$.pipe(
          catchError((error: HttpErrorResponse) => {
            const authError = error.error as AuthError;
            throw new Error(authError?.message || authError?.error || errorMessage);
          })
        )
      );
    } catch (error) {
      this.errorSignal.set(error instanceof Error ? error.message : errorMessage);
      return null;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async signIn(credentials: SignInCredentials): Promise<boolean> {
    const response = await this.executeAuthRequest(
      this.http.post<AuthResponse>(`${this.apiUrl}/sign-in/email`, credentials, { withCredentials: true }),
      'Sign in failed'
    );

    if (response?.user) {
      this.userSignal.set(response.user);
      return true;
    }
    return false;
  }

  async signUp(credentials: SignUpCredentials): Promise<boolean> {
    const response = await this.executeAuthRequest(
      this.http.post<AuthResponse>(`${this.apiUrl}/sign-up/email`, credentials, { withCredentials: true }),
      'Sign up failed'
    );

    if (response?.user) {
      this.userSignal.set(response.user);
      return true;
    }
    return false;
  }

  async signOut(): Promise<void> {
    this.loadingSignal.set(true);

    try {
      await firstValueFrom(
        this.http.post(`${this.apiUrl}/sign-out`, {}, { withCredentials: true }).pipe(
          catchError(() => of(null))
        )
      );
    } finally {
      this.userSignal.set(null);
      this.loadingSignal.set(false);
      this.router.navigate(['/login']);
    }
  }

  async sendMagicLink(email: string): Promise<boolean> {
    const response = await this.executeAuthRequest(
      this.http.post(
        `${this.apiUrl}/sign-in/magic-link`,
        {
          email,
          callbackURL: `${globalThis.location.origin}/dashboard`,
          errorCallbackURL: `${globalThis.location.origin}/login`,
        },
        { withCredentials: true }
      ),
      'Failed to send magic link'
    );
    return response !== null;
  }

  async sendEmailVerificationOtp(email: string): Promise<boolean> {
    const response = await this.executeAuthRequest(
      this.http.post(
        `${this.apiUrl}/email-otp/send-verification-otp`,
        { email, type: 'email-verification' },
        { withCredentials: true }
      ),
      'Failed to send verification code'
    );
    return response !== null;
  }

  async resendVerificationEmail(): Promise<boolean> {
    const email = this.userSignal()?.email;
    if (!email) {
      this.errorSignal.set('No authenticated email address found. Please sign in again.');
      return false;
    }

    return this.sendEmailVerificationOtp(email);
  }

  async verifyEmailWithOtp(otp: string, email?: string): Promise<boolean> {
    const targetEmail = email ?? this.userSignal()?.email;
    if (!targetEmail) {
      this.errorSignal.set('No email address available for verification.');
      return false;
    }

    const response = await this.executeAuthRequest(
      this.http.post(
        `${this.apiUrl}/email-otp/verify-email`,
        { email: targetEmail, otp },
        { withCredentials: true }
      ),
      'Failed to verify email code'
    );

    if (response !== null) {
      await this.loadSession();
      return true;
    }

    return false;
  }

  async sendSignInOtp(email: string): Promise<boolean> {
    const response = await this.executeAuthRequest(
      this.http.post(
        `${this.apiUrl}/email-otp/send-verification-otp`,
        { email, type: 'sign-in' },
        { withCredentials: true }
      ),
      'Failed to send sign-in code'
    );
    return response !== null;
  }

  async signInWithOtp(email: string, otp: string, name?: string): Promise<boolean> {
    const response = await this.executeAuthRequest<AuthResponse>(
      this.http.post<AuthResponse>(
        `${this.apiUrl}/sign-in/email-otp`,
        { email, otp, name },
        { withCredentials: true }
      ),
      'Sign in with code failed'
    );

    if (response?.user) {
      this.userSignal.set(response.user);
      return true;
    }

    return false;
  }

  async requestPasswordResetOtp(email: string): Promise<boolean> {
    const response = await this.executeAuthRequest(
      this.http.post(
        `${this.apiUrl}/email-otp/request-password-reset`,
        { email },
        { withCredentials: true }
      ),
      'Failed to send password reset code'
    );
    return response !== null;
  }

  async resetPasswordWithOtp(email: string, otp: string, password: string): Promise<boolean> {
    const response = await this.executeAuthRequest(
      this.http.post(
        `${this.apiUrl}/email-otp/reset-password`,
        { email, otp, password },
        { withCredentials: true }
      ),
      'Failed to reset password'
    );
    return response !== null;
  }

  getOAuthUrl(provider: OAuthProvider): string {
    const callbackUrl = encodeURIComponent(globalThis.location.origin + '/dashboard');
    return `${this.apiUrl}/sign-in/social/${provider}?callbackURL=${callbackUrl}`;
  }

  private async loadOAuthProviders(): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.http.get<{ providers: OAuthProvider[] }>(`${this.apiUrl}/providers`, {
          withCredentials: true,
        }).pipe(
          catchError((error) => {
            if (!environment.production) {
              console.error('OAuth providers load failed:', error);
            }
            return of({ providers: [] });
          })
        )
      );

      this.enabledProvidersSignal.set(response.providers);
    } catch {
      this.enabledProvidersSignal.set([]);
    }
  }

  clearError(): void {
    this.errorSignal.set(null);
  }
}
