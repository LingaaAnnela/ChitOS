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
      signOut() {
        patchState(store, { user: null, profile: null, tenant: null, isOrganizer: false });
      },
    };
  }),
  withHooks({
    onInit(store) { store.loadSession(); },
  }),
);
