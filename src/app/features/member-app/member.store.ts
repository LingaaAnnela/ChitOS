import { inject } from '@angular/core';
import {
  signalStore, withState, withMethods, withHooks, patchState,
} from '@ngrx/signals';
import { SUPABASE_SERVICE } from '@core/supabase/supabase.token';
import { MOCK_CURRENT_USER_ID } from '@core/mock/seed.data';
import type { Group, Contribution, Payout, Notification } from '@core/mock/seed.data';

interface MemberState {
  myGroups: Group[];
  myContributions: Contribution[];
  myPayouts: Payout[];
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
}

export const MemberStore = signalStore(
  { providedIn: 'root' },
  withState<MemberState>({
    myGroups: [],
    myContributions: [],
    myPayouts: [],
    notifications: [],
    unreadCount: 0,
    loading: false,
  }),
  withMethods((store) => {
    const db = inject(SUPABASE_SERVICE);

    return {
      async loadMyGroups() {
        patchState(store, { loading: true });
        try {
          const [myGroups, myContributions, myPayouts] = await Promise.all([
            db.getGroups() as Promise<Group[]>,
            db.getMyContributions(MOCK_CURRENT_USER_ID) as Promise<Contribution[]>,
            db.getMyPayouts(MOCK_CURRENT_USER_ID) as Promise<Payout[]>,
          ]);
          patchState(store, { myGroups, myContributions, myPayouts, loading: false });
        } catch {
          patchState(store, { loading: false });
        }
      },

      async loadNotifications() {
        try {
          const notifications = await db.getNotifications(MOCK_CURRENT_USER_ID) as Notification[];
          const unreadCount = notifications.filter(n => !n.read).length;
          patchState(store, { notifications, unreadCount });
        } catch {
          // no-op
        }
      },

      markNotificationRead(id: string) {
        const notifications = store.notifications().map(n =>
          n.id === id ? { ...n, read: true } : n
        );
        patchState(store, {
          notifications,
          unreadCount: notifications.filter(n => !n.read).length,
        });
      },

      markAllRead() {
        const notifications = store.notifications().map(n => ({ ...n, read: true }));
        patchState(store, { notifications, unreadCount: 0 });
      },
    };
  }),
  withHooks({
    onInit(store) {
      store.loadMyGroups();
      store.loadNotifications();
    },
  }),
);
