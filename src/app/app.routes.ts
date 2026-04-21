import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'landing', pathMatch: 'full' },
  {
    path: 'landing',
    loadComponent: () => import('./features/landing').then(m => m.LandingPage),
  },
  {
    path: 'auth',
    loadComponent: () =>
      import('./features/onboarding/auth-shell').then(m => m.AuthShell),
  },
  {
    path: 'console',
    loadComponent: () =>
      import('./features/console/console-shell').then(m => m.ConsoleShell),
    // canActivate: [authGuard],  // uncomment when AuthStore is implemented
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard',  loadComponent: () => import('./features/console/dashboard').then(m => m.DashboardPage) },
      { path: 'groups/:id/members', loadComponent: () => import('./features/console/members').then(m => m.MemberApprovalsPage) },
      { path: 'groups/:id', loadComponent: () => import('./features/console/group-detail').then(m => m.GroupDetailPage) },
      { path: 'auction',    loadComponent: () => import('./features/console/auction-console').then(m => m.AuctionConsolePage) },
      { path: 'import',     loadComponent: () => import('./features/console/import').then(m => m.ImportWizardPage) },
      { path: 'settings',   loadComponent: () => import('./features/console/settings').then(m => m.SettingsPage) },
    ],
  },
  {
    path: 'app',
    loadComponent: () =>
      import('./features/member-app/member-app-shell').then(m => m.MemberAppShell),
    // canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home',          loadComponent: () => import('./features/member-app/home').then(m => m.MemberHomePage) },
      { path: 'groups/:id',    loadComponent: () => import('./features/member-app/group-view').then(m => m.GroupViewPage) },
      { path: 'auction',       loadComponent: () => import('./features/member-app/auction-room').then(m => m.AuctionRoomPage) },
      { path: 'notifications', loadComponent: () => import('./features/member-app/notifications').then(m => m.NotificationsPage) },
      { path: 'profile',       loadComponent: () => import('./features/member-app/profile').then(m => m.ProfilePage) },
    ],
  },
  {
    path: 'onboarding',
    loadComponent: () =>
      import('./features/onboarding/onboarding-shell').then(m => m.OnboardingShell),
  },
  {
    path: 'join/:token',
    loadComponent: () =>
      import('./features/onboarding/join-page').then(m => m.JoinPage),
  },
];
