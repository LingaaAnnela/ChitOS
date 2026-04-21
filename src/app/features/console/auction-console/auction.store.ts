import { computed, inject } from '@angular/core';
import {
  signalStore, withState, withComputed, withMethods, patchState,
} from '@ngrx/signals';
import { SUPABASE_SERVICE } from '@core/supabase/supabase.token';
import { InterestService } from '@core/services/interest.service';
import { MOCK_CURRENT_USER_ID } from '@core/mock/seed.data';
import type { AuctionBid } from '@core/mock/seed.data';

type AuctionStatus = 'pending' | 'open' | 'closed';

interface AuctionState {
  bids: AuctionBid[];
  myBid: AuctionBid | null;
  status: AuctionStatus;
  winner: AuctionBid | null;
  auctionOpenAt: string | null;
  auctionCloseAt: string | null;
  potValue: number;
  memberCount: number;
  cycleId: string | null;
}

export const AuctionStore = signalStore(
  withState<AuctionState>({
    bids: [],
    myBid: null,
    status: 'pending',
    winner: null,
    auctionOpenAt: null,
    auctionCloseAt: null,
    potValue: 0,
    memberCount: 0,
    cycleId: null,
  }),
  withComputed((store) => {
    const interestSvc = inject(InterestService);

    const sortedBids = computed(() =>
      [...store.bids()].sort((a, b) => a.bid_amount - b.bid_amount)
    );
    const lowestBid = computed(() => sortedBids()[0] ?? null);

    return {
      sortedBids,
      lowestBid,
      timeRemaining: computed(() => {
        if (!store.auctionCloseAt()) return 0;
        return Math.max(0, Math.floor((new Date(store.auctionCloseAt()!).getTime() - Date.now()) / 1000));
      }),
      dividend: computed(() => {
        const lowest = lowestBid();
        if (!lowest || store.potValue() === 0) return 0;
        return interestSvc.calculateDividend(store.potValue(), lowest.bid_amount, store.memberCount());
      }),
    };
  }),
  withMethods((store) => {
    const db = inject(SUPABASE_SERVICE);

    return {
      async loadBids(cycleId: string) {
        try {
          const bids = await db.getAuctionBids(cycleId) as AuctionBid[];
          const myBid = bids.find(b => b.profile_id === MOCK_CURRENT_USER_ID) ?? null;
          const winner = bids.find(b => b.is_winner) ?? null;
          patchState(store, { bids, myBid, winner, cycleId });
        } catch {
          // no-op — caller handles errors
        }
      },

      async submitBid(amount: number) {
        const cycleId = store.cycleId();
        if (!cycleId) return;
        try {
          const bid = await db.createAuctionBid({
            cycle_id: cycleId,
            group_id: '',
            profile_id: MOCK_CURRENT_USER_ID,
            bid_amount: amount,
          }) as AuctionBid;
          patchState(store, {
            bids: [...store.bids(), bid],
            myBid: bid,
          });
        } catch {
          // no-op
        }
      },

      async updateBid(id: string, amount: number) {
        try {
          await db.updateAuctionBid(id, { bid_amount: amount });
          const updated = store.bids().map(b =>
            b.id === id ? { ...b, bid_amount: amount } : b
          );
          const myBid = updated.find(b => b.profile_id === MOCK_CURRENT_USER_ID) ?? null;
          patchState(store, { bids: updated, myBid });
        } catch {
          // no-op
        }
      },

      initContext(ctx: { cycleId: string; potValue: number; memberCount: number; openAt: string; closeAt: string }) {
        patchState(store, {
          cycleId:       ctx.cycleId,
          potValue:      ctx.potValue,
          memberCount:   ctx.memberCount,
          auctionOpenAt: ctx.openAt,
          auctionCloseAt: ctx.closeAt,
          status: 'open',
        });
      },

      async closeAuction(winnerId: string) {
        const cycleId = store.cycleId();
        if (!cycleId) return;
        try {
          await db.closeAuction(cycleId, winnerId);
          const bids = store.bids().map(b => ({
            ...b, is_winner: b.profile_id === winnerId,
          }));
          const winner = bids.find(b => b.is_winner) ?? null;
          patchState(store, { bids, winner, status: 'closed' });
        } catch {
          // no-op
        }
      },
    };
  }),
);
