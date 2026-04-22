import { inject } from '@angular/core';
import { signalStore, withState, withMethods, withHooks, patchState } from '@ngrx/signals';
import { SUPABASE_SERVICE } from '@core/supabase/supabase.token';
import {
  MOCK_PROFILES, MOCK_CURRENT_USER_ID,
  type Profile, type Tenant,
} from '@core/mock/seed.data';

interface AuthState {
  user: { id: string } | null;
  profile: Profile | null;
  tenant: Tenant | null;
  isOrganizer: boolean;
  loading: boolean;
  error: string | null;
}

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState<AuthState>({
    user: null,
    profile: null,
    tenant: null,
    isOrganizer: false,
    loading: false,
    error: null,
  }),
  withMethods((store) => {
    const db = inject(SUPABASE_SERVICE);
    return {
      async loadSession() {
        patchState(store, { loading: true, error: null });
        try {
          const tenant = await db.getTenant() as Tenant;
          const profile = MOCK_PROFILES.find(p => p.id === MOCK_CURRENT_USER_ID) ?? null;
          patchState(store, {
            user: { id: MOCK_CURRENT_USER_ID },
            profile,
            tenant,
            isOrganizer: true,
            loading: false,
          });
        } catch (e: unknown) {
          patchState(store, {
            loading: false,
            error: e instanceof Error ? e.message : 'Failed to load session',
          });
        }
      },
      updateProfile(updates: Partial<Pick<Profile, 'name' | 'phone' | 'email'>>) {
        const current = store.profile();
        if (!current) return;
        patchState(store, { profile: { ...current, ...updates } });
      },
      async login(emailInput: string, _password: string) {
        patchState(store, { loading: true, error: null });
        await new Promise(r => setTimeout(r, 500));
        const profile = MOCK_PROFILES.find(
          p => p.email.toLowerCase() === emailInput.toLowerCase().trim(),
        );
        if (!profile) {
          patchState(store, { loading: false, error: 'Invalid email or password' });
          return;
        }
        patchState(store, {
          user: { id: profile.id },
          profile,
          isOrganizer: profile.id === MOCK_CURRENT_USER_ID,
          loading: false,
          error: null,
        });
      },
      async register(name: string, phone: string, emailInput: string, _password: string) {
        patchState(store, { loading: true, error: null });
        await new Promise(r => setTimeout(r, 500));
        const existing = MOCK_PROFILES.find(
          p => p.email.toLowerCase() === emailInput.toLowerCase().trim(),
        );
        if (existing) {
          patchState(store, { loading: false, error: 'An account with this email already exists' });
          return;
        }
        const newProfile: Profile = {
          id: `u-new-${Date.now()}`,
          name: name.trim(),
          initials: name.trim().split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2),
          phone: phone.trim(),
          email: emailInput.trim(),
          trust_score: 0,
          trust_label: 'Good',
          avatar_color: 'b',
        };
        patchState(store, {
          user: { id: newProfile.id },
          profile: newProfile,
          isOrganizer: false,
          loading: false,
          error: null,
        });
      },
      signOut() {
        patchState(store, { user: null, profile: null, tenant: null, isOrganizer: false });
      },
    };
  }),
  withHooks({
    onInit(store) { store.loadSession(); },
  }),
);
