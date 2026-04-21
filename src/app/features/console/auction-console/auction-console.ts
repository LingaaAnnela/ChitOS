import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TranslocoDirective } from '@jsverse/transloco';
import { ConsoleStore } from '../console.store';
import { AuctionStore } from './auction.store';
import { IndianCurrencyPipe } from '@shared/pipes';
import {
  CountdownTimerComponent, ProgressBarComponent,
  SkeletonLoaderComponent, EmptyStateComponent,
} from '@shared/components';
import { MOCK_CURRENT_USER_ID } from '@core/mock/seed.data';
import type { EnrichedMember } from '@core/mock/seed.data';

@Component({
  selector: 'app-auction-console',
  standalone: true,
  providers: [AuctionStore],
  imports: [DatePipe, IndianCurrencyPipe, TranslocoDirective, CountdownTimerComponent, ProgressBarComponent,
    SkeletonLoaderComponent, EmptyStateComponent],
  styles: [`
    :host { display: flex; flex-direction: column; padding: 20px; gap: 16px; }

    .auc-header { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 10px; }
    .auc-title-row { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
    .auc-title { font-family: Newsreader, serif; font-size: 22px; font-weight: 300; color: var(--t1); }
    .auc-sub { font-size: 12px; color: var(--t3); }
    .hdr-btns { display: flex; gap: 8px; }

    .auc-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      grid-template-areas: "bids timer" "bids override" "bids dividend";
      gap: 14px;
      align-items: start;
    }
    .grid-bids     { grid-area: bids; }
    .grid-timer    { grid-area: timer; }
    .grid-override { grid-area: override; }
    .grid-dividend { grid-area: dividend; }

    .bids-list { display: flex; flex-direction: column; padding: 14px; padding-bottom: 0; }
    .bid-row { display: flex; gap: 10px; align-items: center; padding: 10px 12px;
      border: 0.5px solid var(--b); border-radius: var(--rs); margin-bottom: 6px; }
    .bid-1st { background: var(--abg); border-color: rgba(180,83,9,0.25) !important; }
    .bid-me  { border-color: var(--bborder) !important; }
    .bid-rank { font-size: 11px; font-weight: 500; color: var(--t3); min-width: 28px; }
    .bid-rank.first { color: var(--amber); }
    .bid-name { flex: 1; font-size: 13px; color: var(--t1); }
    .bid-name.me { font-weight: 500; }
    .bid-amt { font-size: 13px; font-weight: 500; color: var(--t1); display: flex; align-items: center; gap: 6px; }
    .bid-winner-tag { font-size: 10px; background: var(--abg); color: var(--amber);
      padding: 2px 6px; border-radius: 100px; font-weight: 500; }
    .no-bids { font-size: 13px; color: var(--t3); text-align: center; padding: 20px; }

    .div-box { margin: 0 14px 14px; padding: 10px; background: var(--warm2);
      border-radius: var(--rs); font-size: 12px; color: var(--t2); line-height: 1.5; }

    .no-bidders { padding: 0 14px 14px; }
    .nb-label { font-size: 11px; color: var(--t3); margin-bottom: 8px; font-weight: 500;
      text-transform: uppercase; letter-spacing: 0.04em; }
    .nb-chips { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
    .nb-count { font-size: 11px; color: var(--t3); margin-left: 4px; }

    .timer-display { padding: 16px; }
    .timer-dates { display: flex; justify-content: space-between; margin-top: 4px;
      font-size: 10px; color: var(--t3); }

    .override-body { padding: 14px; display: flex; flex-direction: column; gap: 10px; }
    .override-desc { font-size: 12px; color: var(--t2); line-height: 1.5; margin: 0; }

    .div-detail { padding: 14px; display: flex; flex-direction: column; gap: 6px;
      font-size: 12px; color: var(--t2); }
    .div-row { display: flex; justify-content: space-between; }
    .div-row span:last-child { font-weight: 500; color: var(--t1); }
    .div-sep { padding-top: 6px; border-top: 0.5px solid var(--b); }

    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.45);
      display: flex; align-items: center; justify-content: center; z-index: 200; }
    .modal-card { width: min(360px,94vw); background: var(--card); border-radius: var(--r);
      border: 0.5px solid var(--b); overflow: hidden; }
    .confirm-msg { font-size: 13px; color: var(--t2); line-height: 1.5; padding: 12px 16px; margin: 0; }
    .modal-footer { display: flex; justify-content: flex-end; gap: 8px; padding: 12px 16px;
      border-top: 0.5px solid var(--b); }

    @media (max-width: 768px) {
      :host { padding: 14px; gap: 12px; }
      .auc-title { font-size: 18px; }
      .auc-grid { grid-template-columns: 1fr;
        grid-template-areas: "timer" "bids" "override" "dividend"; }
      .hdr-btns { width: 100%; }
      .stats-row { display: none; }
    }
  `],
  template: `
    <ng-container *transloco="let t">
    @if (loading() && !group()) {
      <app-skeleton-loader type="card" [count]="3" />
    } @else if (!group()) {
      <app-empty-state title="No active group" subtitle="Open a group first, then return to the auction room." />
    } @else {
      @let g = group()!;
      @let cycle = activeCycle();

      <!-- Header -->
      <div class="auc-header">
        <div>
          <div class="auc-title-row">
            <span class="auc-title">{{ t('auction.title') }}</span>
            @if (!auctionExpired() && status() !== 'closed') {
              <div class="badge badge-live">{{ t('auction.live') }}</div>
            } @else {
              <div class="badge badge-grey">{{ t('auction.closed') }}</div>
            }
          </div>
          <div class="auc-sub">{{ g.name }} · {{ cycle?.month_label }} · Pot: {{ g.contribution_amount * g.member_count | indianCurrency }}</div>
        </div>
        @if (status() !== 'closed' && !auctionExpired()) {
          <div class="hdr-btns">
            <button class="btn-sm btn-sm-o">{{ t('auction.extendWindow') }}</button>
            <button class="btn-sm btn-sm-r" (click)="showCloseConfirm.set(true)">{{ t('auction.closeAuction') }}</button>
          </div>
        }
      </div>

      <!-- Stat cards (desktop only) -->
      <div class="stats-row">
        <div class="stat-card">
          <div class="sc-lbl">{{ t('auction.potValue') }}</div>
          <div class="sc-val">{{ g.contribution_amount * g.member_count | indianCurrency }}</div>
          <div class="sc-sub">{{ t('auction.fullPotAvailable') }}</div>
        </div>
        <div class="stat-card">
          <div class="sc-lbl">{{ t('auction.bidsSubmitted') }}</div>
          <div class="sc-val" style="color:var(--blue)">{{ bids().length }}</div>
          <div class="sc-sub">{{ nonBidders().length }} {{ t('auction.yetToBid') }}</div>
        </div>
        <div class="stat-card">
          <div class="sc-lbl">{{ t('auction.currentLowest') }}</div>
          <div class="sc-val">{{ lowestBid() ? (lowestBid()!.bid_amount | indianCurrency) : '—' }}</div>
          <div class="sc-sub">{{ lowestBidderName() }}</div>
        </div>
        <div class="stat-card">
          <div class="sc-lbl">{{ t('auction.closesIn') }}</div>
          <div class="sc-val" style="font-size:16px">{{ cycle?.auction_close_date | date:'d MMM' }}</div>
          <div class="sc-sub">{{ t('auction.at8am') }}</div>
        </div>
      </div>

      <!-- Main grid -->
      <div class="auc-grid">

        <!-- LEFT: Live bids -->
        <div class="card grid-bids">
          <div class="card-head">
            <div>
              <div class="card-title">{{ t('auction.liveBids') }}</div>
              <div class="card-sub">{{ t('auction.membersHaveBid', { total: g.member_count }) }}</div>
            </div>
            @if (status() !== 'closed' && !auctionExpired()) {
              <div class="badge badge-live">{{ t('auction.updatingLive') }}</div>
            }
          </div>
          <div class="bids-list">
            @if (bids().length === 0) {
              <div class="no-bids">{{ t('auction.noBidsYet') }}</div>
            }
            @for (bid of enrichedBids(); track bid.id) {
              <div class="bid-row"
                [class.bid-1st]="bid.isLowest"
                [class.bid-me]="bid.isMe && !bid.isLowest">
                <div class="bid-rank" [class.first]="bid.isLowest">{{ ordinalRank(bid.rank) }}</div>
                <div class="av av-sm" [class]="'av-' + bid.avatarColor">{{ bid.initials }}</div>
                <div class="bid-name" [class.me]="bid.isMe">{{ bid.name }}{{ bid.isMe ? ' (you)' : '' }}</div>
                <div class="bid-amt">
                  {{ bid.bid_amount | indianCurrency }}
                  @if (bid.isLowest) { <span class="bid-winner-tag">{{ t('auction.lowestBadge') }}</span> }
                </div>
              </div>
            }
          </div>
          @if (lowestBid()) {
            <div class="div-box">
              If {{ lowestBidderName() }} wins at {{ lowestBid()!.bid_amount | indianCurrency }} — each of the {{ g.member_count - 1 }} other members receives a dividend of <strong style="color:var(--green)">{{ dividend() | indianCurrency }}</strong>
            </div>
          }
          @if (nonBidders().length > 0) {
            <div class="no-bidders">
              <div class="nb-label">{{ t('auction.haventBid') }}</div>
              <div class="nb-chips">
                @for (m of nonBidders(); track m.id) {
                  <div class="av av-sm" [class]="'av-' + m.profile.avatar_color" [title]="m.profile.name">{{ m.profile.initials }}</div>
                }
                <span class="nb-count">{{ t('auction.noBidCount') }}</span>
              </div>
            </div>
          }
        </div>

        <!-- RIGHT TOP: Timer -->
        <div class="card grid-timer timer-display">
          @if (cycle?.auction_close_date) {
            <app-countdown-timer
              [closeAt]="cycle!.auction_close_date!"
              (onExpired)="onTimerExpired()" />
            <div style="margin-top:14px;">
              <app-progress-bar [value]="timeElapsed()" color="b" />
            </div>
            <div class="timer-dates">
              <span>Opened {{ cycle!.auction_open_date | date:'d MMM' }}</span>
              <span>Closes {{ cycle!.auction_close_date | date:'d MMM' }} 8am</span>
            </div>
          } @else {
            <div style="font-size:13px;color:var(--t3);text-align:center;padding:16px;">{{ t('auction.noCloseDate') }}</div>
          }
        </div>

        <!-- RIGHT MID: Override winner -->
        <div class="card grid-override">
          <div class="card-head"><div class="card-title">{{ t('auction.overrideWinner') }}</div></div>
          <div class="override-body">
            <p class="override-desc">{{ t('auction.overrideDesc') }}</p>
            <select class="form-input form-select" style="font-size:13px;" (change)="setOverride($event)">
              <option value="">{{ t('auction.selectMember') }}</option>
              @for (m of allMembers(); track m.id) {
                <option [value]="m.profile_id">{{ m.profile.name }}</option>
              }
            </select>
            <button class="btn-sm btn-sm-p"
              [disabled]="!overrideWinnerId()"
              (click)="overrideWinner()">{{ t('auction.confirmPayout') }}</button>
          </div>
        </div>

        <!-- RIGHT BOTTOM: Dividend breakdown -->
        <div class="card grid-dividend">
          <div class="card-head"><div class="card-title">{{ t('auction.dividendTitle') }}</div></div>
          <div class="div-detail">
            <div class="div-row">
              <span>{{ t('auction.potValue') }}</span>
              <span>{{ g.contribution_amount * g.member_count | indianCurrency }}</span>
            </div>
            <div class="div-row">
              <span>{{ t('auction.winningBid') }}</span>
              <span>{{ lowestBid() ? (lowestBid()!.bid_amount | indianCurrency) : '—' }}</span>
            </div>
            <div class="div-row div-sep">
              <span>{{ t('auction.discountPool') }}</span>
              <span>{{ discountPool() | indianCurrency }}</span>
            </div>
            <div class="div-row">
              <span>{{ t('auction.perMemberDividend') }}</span>
              <span style="color:var(--green)">+{{ dividend() | indianCurrency }} each</span>
            </div>
          </div>
        </div>

      </div>

      <!-- Close auction confirm overlay -->
      @if (showCloseConfirm()) {
        <div class="modal-overlay" (click)="showCloseConfirm.set(false)">
          <div class="modal-card" (click)="$event.stopPropagation()">
            <div class="card-head"><div class="card-title">{{ t('auction.closeModalTitle') }}</div></div>
            @if (lowestBid()) {
              <p class="confirm-msg">
                {{ t('auction.closeModalDesc', { name: lowestBidderName(), amount: lowestBid()!.bid_amount | indianCurrency }) }}
              </p>
            }
            <div class="modal-footer">
              <button class="btn-sm btn-sm-o" (click)="showCloseConfirm.set(false)">{{ t('auction.cancel') }}</button>
              <button class="btn-sm btn-sm-r" (click)="closeAuction()">{{ t('auction.confirmClose') }}</button>
            </div>
          </div>
        </div>
      }
    }
    </ng-container>
  `,
})
export class AuctionConsolePage {
  private consoleStore = inject(ConsoleStore);
  private auctionStore = inject(AuctionStore);

  bids      = this.auctionStore.sortedBids;
  lowestBid = this.auctionStore.lowestBid;
  dividend  = this.auctionStore.dividend;
  status    = this.auctionStore.status;
  loading   = this.consoleStore.loading;

  overrideWinnerId = signal('');
  showCloseConfirm = signal(false);
  auctionExpired   = signal(false);

  group       = this.consoleStore.selectedGroup;
  activeCycle = computed(() => this.consoleStore.cycles().find(c => c.status === 'active') ?? null);
  allMembers  = computed(() => this.consoleStore.members() as EnrichedMember[]);

  enrichedBids = computed(() => {
    const members = this.allMembers();
    return this.bids().map((bid, idx) => {
      const m = members.find(em => em.profile_id === bid.profile_id);
      return {
        ...bid,
        rank:        idx + 1,
        name:        m?.profile.name        ?? 'Unknown',
        initials:    m?.profile.initials    ?? '??',
        avatarColor: m?.profile.avatar_color ?? 'g',
        isMe:        bid.profile_id === MOCK_CURRENT_USER_ID,
        isLowest:    idx === 0,
      };
    });
  });

  nonBidders = computed(() => {
    const ids = new Set(this.bids().map(b => b.profile_id));
    return this.allMembers().filter(m => !ids.has(m.profile_id));
  });

  lowestBidderName = computed(() => {
    const low = this.lowestBid();
    if (!low) return '';
    return this.allMembers().find(m => m.profile_id === low.profile_id)?.profile.name ?? 'Unknown';
  });

  timeElapsed = computed(() => {
    const c = this.activeCycle();
    if (!c?.auction_open_date || !c?.auction_close_date) return 0;
    const total   = new Date(c.auction_close_date).getTime() - new Date(c.auction_open_date).getTime();
    const elapsed = Date.now() - new Date(c.auction_open_date).getTime();
    return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
  });

  discountPool = computed(() => {
    const g   = this.group();
    const low = this.lowestBid();
    if (!g || !low) return 0;
    return g.contribution_amount * g.member_count - low.bid_amount;
  });

  constructor() {
    const cycle = this.consoleStore.cycles().find(c => c.status === 'active');
    const g     = this.consoleStore.selectedGroup();
    if (cycle && g) {
      this.auctionStore.initContext({
        cycleId:     cycle.id,
        potValue:    g.contribution_amount * g.member_count,
        memberCount: g.member_count,
        openAt:      cycle.auction_open_date  ?? new Date().toISOString(),
        closeAt:     cycle.auction_close_date ?? new Date().toISOString(),
      });
      this.auctionStore.loadBids(cycle.id);
    }
  }

  ordinalRank(n: number): string { return (['1st', '2nd', '3rd'] as const)[n - 1] ?? `${n}th`; }

  setOverride(e: Event) { this.overrideWinnerId.set((e.target as HTMLSelectElement).value); }

  onTimerExpired() { this.auctionExpired.set(true); }

  async closeAuction() {
    const low = this.lowestBid();
    if (!low) return;
    this.showCloseConfirm.set(false);
    await this.auctionStore.closeAuction(low.profile_id);
  }

  async overrideWinner() {
    const id = this.overrideWinnerId();
    if (!id) return;
    await this.auctionStore.closeAuction(id);
    this.overrideWinnerId.set('');
  }
}
