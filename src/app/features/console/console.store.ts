import { computed, inject } from '@angular/core';
import {
  signalStore, withState, withComputed, withMethods, withHooks, patchState,
} from '@ngrx/signals';
import { SUPABASE_SERVICE } from '@core/supabase/supabase.token';
import { UIStore } from '@core/stores/ui.store';
import { MOCK_TENANT_ID } from '@core/mock/seed.data';
import type {
  Group, GroupMember, Cycle, Contribution, Payout,
  Announcement, ActivityLog, AuctionBid,
} from '@core/mock/seed.data';

interface GroupSummary { paidCount: number; overdueCount: number; }

interface ConsoleState {
  groups: Group[];
  selectedGroup: Group | null;
  members: GroupMember[];
  cycles: Cycle[];
  contributions: Contribution[];
  payouts: Payout[];
  auctionBids: AuctionBid[];
  pendingApprovals: GroupMember[];
  announcements: Announcement[];
  activityLog: ActivityLog[];
  groupSummaries: Record<string, GroupSummary>;
  loading: boolean;
  error: string | null;
}

export const ConsoleStore = signalStore(
  { providedIn: 'root' },
  withState<ConsoleState>({
    groups: [],
    selectedGroup: null,
    members: [],
    cycles: [],
    contributions: [],
    payouts: [],
    auctionBids: [],
    pendingApprovals: [],
    announcements: [],
    activityLog: [],
    groupSummaries: {},
    loading: false,
    error: null,
  }),
  withComputed((store) => {
    const activeGroups = computed(() => store.groups().filter(g => g.status === 'active'));
    const overdueCount = computed(() =>
      Object.values(store.groupSummaries()).reduce((sum: number, s) => sum + s.overdueCount, 0)
    );
    const potThisMonth = computed(() =>
      store.groups()
        .filter(g => g.status === 'active')
        .reduce((sum, g) => sum + g.contribution_amount * g.member_count, 0)
    );

    return {
      activeGroups,
      overdueCount,
      potThisMonth,
      dashboardStats: computed(() => ({
        activeGroups: activeGroups().length,
        totalMembers: store.groups().reduce((sum, g) => sum + g.member_count, 0),
        potThisMonth: potThisMonth(),
        overdueCount: overdueCount(),
        pendingApprovals: store.pendingApprovals().length,
      })),
    };
  }),
  withMethods((store) => {
    const db = inject(SUPABASE_SERVICE);
    const ui = inject(UIStore);

    const refreshMembers = async (groupId: string) => {
      const members = await db.getMembers(groupId) as GroupMember[];
      const groupPending = members.filter(m => m.approval_status === 'pending');
      const otherPending = store.pendingApprovals().filter(m => m.group_id !== groupId);
      patchState(store, { members, pendingApprovals: [...otherPending, ...groupPending] });
    };

    return {
      async loadGroups() {
        patchState(store, { loading: true, error: null });
        try {
          const groups = await db.getGroups() as Group[];
          patchState(store, { groups, loading: false });
        } catch (e: unknown) {
          patchState(store, { loading: false, error: errMsg(e) });
        }
      },

      async loadGroup(id: string) {
        patchState(store, { loading: true, error: null });
        try {
          const [group, cycles, payouts, announcements] = await Promise.all([
            db.getGroup(id) as Promise<Group>,
            db.getCycles(id) as Promise<Cycle[]>,
            db.getPayouts(id) as Promise<Payout[]>,
            db.getAnnouncements(id) as Promise<Announcement[]>,
          ]);
          const activeCycle = cycles.find(c => c.status === 'active');
          const contributions = activeCycle
            ? await db.getContributions(activeCycle.id) as Contribution[]
            : [];
          const auctionBids = activeCycle
            ? await db.getAuctionBids(activeCycle.id) as AuctionBid[]
            : [];
          patchState(store, {
            selectedGroup: group,
            cycles,
            payouts,
            announcements,
            contributions,
            auctionBids,
            loading: false,
          });
        } catch (e: unknown) {
          patchState(store, { loading: false, error: errMsg(e) });
        }
      },

      async loadMembers(groupId: string) {
        try {
          await refreshMembers(groupId);
        } catch (e: unknown) {
          patchState(store, { error: errMsg(e) });
        }
      },

      async loadContributions(cycleId: string) {
        try {
          const contributions = await db.getContributions(cycleId) as Contribution[];
          patchState(store, { contributions });
        } catch (e: unknown) {
          patchState(store, { error: errMsg(e) });
        }
      },

      async loadActivityLog() {
        try {
          const activityLog = await db.getActivityLog(MOCK_TENANT_ID) as ActivityLog[];
          patchState(store, { activityLog });
        } catch (e: unknown) {
          patchState(store, { error: errMsg(e) });
        }
      },

      async loadDashboardData() {
        try {
          const summaries: Record<string, GroupSummary> = {};
          const allPending: GroupMember[] = [];
          for (const group of store.groups()) {
            const members = await db.getMembers(group.id) as GroupMember[];
            allPending.push(...members.filter(m => m.approval_status === 'pending'));
            if (group.status === 'active') {
              const cycles = await db.getCycles(group.id) as Cycle[];
              const activeCycle = cycles.find(c => c.status === 'active');
              if (activeCycle) {
                const contribs = await db.getContributions(activeCycle.id) as Contribution[];
                summaries[group.id] = {
                  paidCount:    contribs.filter(c => c.status === 'paid').length,
                  overdueCount: contribs.filter(c => c.status === 'overdue').length,
                };
              }
            }
          }
          patchState(store, { pendingApprovals: allPending, groupSummaries: summaries });
        } catch (e: unknown) {
          patchState(store, { error: errMsg(e) });
        }
      },

      selectGroup(id: string) {
        const group = store.groups().find(g => g.id === id) ?? null;
        patchState(store, { selectedGroup: group });
      },

      async markContributionPaid(id: string, data: Record<string, unknown>) {
        try {
          await db.markContributionPaid(id, data);
          const cycleId = store.contributions().find(c => c.id === id)?.cycle_id ?? '';
          if (cycleId) {
            const contributions = await db.getContributions(cycleId) as Contribution[];
            patchState(store, { contributions });
          }
          ui.addToast('Contribution marked as paid', 'success');
        } catch (e: unknown) {
          patchState(store, { error: errMsg(e) });
          ui.addToast(errMsg(e), 'error');
        }
      },

      async approveMember(gmId: string) {
        try {
          await db.approveMember(gmId);
          const gm = store.pendingApprovals().find(m => m.id === gmId);
          const groupId = gm?.group_id ?? store.selectedGroup()?.id ?? '';
          if (groupId) await refreshMembers(groupId);
          ui.addToast('Member approved', 'success');
        } catch (e: unknown) {
          patchState(store, { error: errMsg(e) });
          ui.addToast(errMsg(e), 'error');
        }
      },

      async rejectMember(gmId: string, reason: string) {
        try {
          await db.rejectMember(gmId, reason);
          const gm = store.pendingApprovals().find(m => m.id === gmId);
          const groupId = gm?.group_id ?? store.selectedGroup()?.id ?? '';
          if (groupId) await refreshMembers(groupId);
          ui.addToast('Request rejected', 'info');
        } catch (e: unknown) {
          patchState(store, { error: errMsg(e) });
          ui.addToast(errMsg(e), 'error');
        }
      },

      async markCyclePaid(cycleId: string) {
        const cycle = store.cycles().find(c => c.id === cycleId);
        const group = store.selectedGroup();
        if (!cycle || !group) return;
        try {
          await db.recordPayout({
            cycle_id: cycle.id,
            group_id: cycle.group_id,
            profile_id: cycle.winner_profile_id ?? '',
            amount: cycle.payout_amount ?? group.contribution_amount * group.member_count,
            payment_date: new Date().toISOString().slice(0, 10),
            strategy: group.strategy,
          });
          patchState(store, {
            cycles: store.cycles().map(c =>
              c.id === cycleId ? { ...c, status: 'completed' as const } : c
            ),
          });
          ui.addToast('Payout marked as paid', 'success');
        } catch (e: unknown) {
          patchState(store, { error: errMsg(e) });
          ui.addToast(errMsg(e), 'error');
        }
      },

      async postAnnouncement(groupId: string, text: string) {
        try {
          await db.createAnnouncement(groupId, MOCK_TENANT_ID, text);
          const announcements = await db.getAnnouncements(groupId) as Announcement[];
          patchState(store, { announcements });
        } catch (e: unknown) {
          patchState(store, { error: errMsg(e) });
        }
      },

      async approveAllPending() {
        try {
          await Promise.all(store.pendingApprovals().map(gm => db.approveMember(gm.id)));
          const groupId = store.selectedGroup()?.id ?? '';
          if (groupId) await refreshMembers(groupId);
        } catch (e: unknown) {
          patchState(store, { error: errMsg(e) });
        }
      },
    };
  }),
  withHooks({
    onInit(store) {
      store.loadGroups();
      store.loadActivityLog();
    },
  }),
);

function errMsg(e: unknown): string {
  return e instanceof Error ? e.message : 'An error occurred';
}
