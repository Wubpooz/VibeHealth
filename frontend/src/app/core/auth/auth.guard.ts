import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from './auth.service';

const AUTH_LOAD_TIMEOUT = 10000; // 10 seconds max wait
const AUTH_POLL_INTERVAL = 50;
let pendingAuthReadyCheck: Promise<void> | null = null;

// Helper to wait for auth service to finish loading
function waitForAuthReady(auth: AuthService): Promise<void> {
  if (!auth.isLoading()) return Promise.resolve();

  if (pendingAuthReadyCheck) {
    return pendingAuthReadyCheck;
  }

  pendingAuthReadyCheck = new Promise((resolve) => {
    const startTime = Date.now();

    const poll = () => {
      if (!auth.isLoading() || Date.now() - startTime > AUTH_LOAD_TIMEOUT) {
        pendingAuthReadyCheck = null;
        resolve();
        return;
      }

      setTimeout(poll, AUTH_POLL_INTERVAL);
    };

    poll();
  });

  return pendingAuthReadyCheck;
}

// Guard for routes that require authentication
export const authGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  await waitForAuthReady(auth);

  return auth.isAuthenticated() ? true : router.createUrlTree(['/login']);
};

// Guard for routes that should only be accessible to guests (not logged in)
export const guestGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  await waitForAuthReady(auth);

  return auth.isAuthenticated() ? router.createUrlTree(['/dashboard']) : true;
};

// Guard for routes that require email verification
export const verifiedEmailGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  await waitForAuthReady(auth);

  if (!auth.isAuthenticated()) {
    return router.createUrlTree(['/login']);
  }

  if (auth.isEmailVerified()) {
    return true;
  }

  return router.createUrlTree(['/verify-email']);
};
