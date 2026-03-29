import { Routes } from "@angular/router";
import { authGuard, guestGuard } from "./core/auth/auth.guard";

export const routes: Routes = [
  {
    path: "",
    loadComponent: () =>
      import("./features/landing/landing.component").then(
        (m) => m.LandingComponent,
      ),
  },
  {
    path: "login",
    loadComponent: () =>
      import("./features/auth/login/login.component").then(
        (m) => m.LoginComponent,
      ),
    canActivate: [guestGuard],
  },
  {
    path: "register",
    loadComponent: () =>
      import("./features/auth/register/register.component").then(
        (m) => m.RegisterComponent,
      ),
    canActivate: [guestGuard],
  },
  {
    path: "verify-email",
    loadComponent: () =>
      import("./features/auth/verify-email/verify-email.component").then(
        (m) => m.VerifyEmailComponent,
      ),
  },
  {
    path: "forgot-password",
    loadComponent: () =>
      import("./features/auth/forgot-password/forgot-password.component").then(
        (m) => m.ForgotPasswordComponent,
      ),
    canActivate: [guestGuard],
  },
  {
    path: "onboarding",
    loadComponent: () =>
      import("./features/onboarding/onboarding.component").then(
        (m) => m.OnboardingComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: "dashboard",
    loadComponent: () =>
      import("./features/dashboard/dashboard.component").then(
        (m) => m.DashboardComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: "medical-id",
    loadComponent: () =>
      import("./features/medical-id/medical-id.component").then(
        (m) => m.MedicalIdComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: "first-aid",
    loadComponent: () =>
      import("./features/first-aid/first-aid.component").then(
        (m) => m.FirstAidComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: "first-aid/:id",
    loadComponent: () =>
      import("./features/first-aid/first-aid-detail.component").then(
        (m) => m.FirstAidDetailComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: "vitals",
    loadComponent: () =>
      import("./features/metrics/vitals-dashboard.component").then(
        (m) => m.VitalsDashboardComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: "activity",
    loadComponent: () =>
      import("./features/metrics/activity-page.component").then(
        (m) => m.ActivityPageComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: "nutrition",
    loadComponent: () =>
      import("./features/metrics/nutrition-page.component").then(
        (m) => m.NutritionPageComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: "goals",
    loadComponent: () =>
      import("./features/metrics/goals-page.component").then(
        (m) => m.GoalsPageComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: "workouts",
    loadComponent: () =>
      import("./features/metrics/workouts-page.component").then(
        (m) => m.WorkoutsPageComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: "journal",
    loadComponent: () =>
      import("./features/wellness/journal/wellness-journal-page.component").then(
        (m) => m.WellnessJournalPageComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: "not-found",
    loadComponent: () =>
      import("./features/not-found/not-found.component").then(
        (m) => m.NotFoundComponent,
      ),
  },
  {
    path: "**",
    redirectTo: "/not-found",
  },
];
