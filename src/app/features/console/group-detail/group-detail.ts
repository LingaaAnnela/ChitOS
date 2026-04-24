import { Component, computed, inject, signal } from '@angular/core';
import { TitleCasePipe, DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';
import { ConsoleStore } from '../console.store';
import { InterestService } from '@core/services/interest.service';
import { IndianCurrencyPipe, RelativeTimePipe } from '@shared/pipes';
import {
  SkeletonLoaderComponent, EmptyStateComponent,
  PaymentMethodModalComponent, TrustScorePillComponent,
} from '@shared/components';
import type { EnrichedMember, EnrichedContribution, Contribution, Cycle, Group } from '@core/mock/seed.data';
import type { PaymentData } from '@shared/components/payment-method-modal/payment-method-modal';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

@Component({
  selector: 'app-group-detail',
  standalone: true,
  imports: [
    TitleCasePipe, DecimalPipe, IndianCurrencyPipe, RelativeTimePipe, TranslocoDirective,
    SkeletonLoaderComponent, EmptyStateComponent,
    PaymentMethodModalComponent, TrustScorePillComponent,
  ],
  styles: [`
    :host { display: flex; flex-direction: column; padding: 20px; gap: 16px; }

    .grp-header { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 10px; }
    .grp-title { font-family: Newsreader, serif; font-size: 22px; font-weight: 300; color: var(--t1); margin: 0 0 6px; }
    .badges-row { display: flex; gap: 6px; align-items: center; flex-wrap: wrap; margin-bottom: 4px; }
    .grp-meta { font-size: 12px; color: var(--t2); margin: 4px 0 0; }
    .hdr-btns { display: flex; gap: 8px; align-items: flex-start; flex-shrink: 0; flex-wrap: wrap; }

    .stats2 { display: flex; gap: 8px; overflow-x: auto; scrollbar-width: none; }
    .stats2 .sc { flex: 1; min-width: 80px; }
    .sc-l { font-size: 10px; color: var(--t3); text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 4px; }
    .sc-v { font-family: Newsreader, serif; font-size: 20px; font-weight: 300; line-height: 1.1; }
    .sc-v.g { color: var(--green); } .sc-v.r { color: var(--red); }
    .sc-s { font-size: 10px; color: var(--t3); margin-top: 2px; }

    .sec-hdr { display: flex; justify-content: space-between; align-items: center; }
    .sec-title { font-size: 13px; font-weight: 500; color: var(--t1); }
    .sec-link { font-size: 12px; color: var(--blue); cursor: pointer; }

    .timeline { display: flex; gap: 10px; overflow-x: auto; -webkit-overflow-scrolling: touch;
      scrollbar-width: none; padding: 16px; }
    .tl-item { display: flex; flex-direction: column; align-items: center; gap: 6px; min-width: 54px; }
    .tl-circle { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center;
      justify-content: center; font-size: 11px; font-weight: 500; flex-shrink: 0; text-align: center; }
    .tl-done   { background: var(--gbg); border: 1.5px solid var(--green); color: var(--green); }
    .tl-active { background: var(--bbg); border: 2px solid var(--blue); color: var(--blue); }
    .tl-future { background: var(--warm2); border: 1.5px dashed var(--b3); color: var(--t3); }
    .tl-label  { font-size: 9px; text-align: center; color: var(--t3); line-height: 1.3; }
    .tl-label.g { color: var(--green); font-weight: 500; }
    .tl-label.b { color: var(--blue); font-weight: 500; }

    .acc-header { display: flex; justify-content: space-between; align-items: center;
      padding: 12px 16px; cursor: pointer; border-bottom: 0.5px solid var(--b); }
    .acc-header:hover { background: var(--warm); }
    .chev { transition: transform 200ms; width: 16px; height: 16px; color: var(--t3); flex-shrink: 0; }
    .chev.open { transform: rotate(180deg); }
    .acc-body { display: none; } .acc-body.open { display: block; }

    .member-row { display: flex; gap: 12px; padding: 11px 16px; border-bottom: 0.5px solid var(--b);
      cursor: pointer; align-items: center; }
    .member-row:last-child { border-bottom: none; }
    .member-row:hover { background: var(--warm); }
    .mr-info { flex: 1; min-width: 0; }
    .mr-name { font-size: 13px; font-weight: 500; color: var(--t1); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .mr-meta { font-size: 11px; color: var(--t2); margin-top: 2px; }
    .mr-right { display: flex; gap: 8px; align-items: center; flex-shrink: 0; flex-wrap: wrap; justify-content: flex-end; }

    .act-row { display: flex; gap: 10px; padding: 10px 16px; border-bottom: 0.5px solid var(--b); align-items: flex-start; }
    .act-row:last-child { border-bottom: none; }
    .act-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; margin-top: 3px; background: var(--blue); }
    .act-body { flex: 1; min-width: 0; }
    .act-text { font-size: 12px; color: var(--t1); line-height: 1.4; }
    .act-meta { font-size: 10px; color: var(--t3); font-family: 'JetBrains Mono', monospace; margin-top: 2px; }

    .int-rows { display: flex; flex-direction: column; gap: 8px; padding: 12px 16px; }
    .int-row { display: flex; justify-content: space-between; align-items: center;
      background: var(--warm2); border-radius: var(--rs); padding: 10px; gap: 8px; }
    .int-label { font-size: 12px; font-weight: 500; color: var(--t1); }
    .int-pos { font-size: 11px; color: var(--t2); margin-top: 2px; }
    .int-amt { font-size: 16px; font-weight: 500; }
    .int-amt.r { color: var(--red); } .int-amt.g { color: var(--green); }

    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.45); display: flex;
      align-items: center; justify-content: center; z-index: 200; padding: 16px; }
    .modal-card { width: min(360px,94vw); background: var(--card); border-radius: var(--r);
      border: 0.5px solid var(--b); overflow: hidden; }
    .ann-input { width: 100%; box-sizing: border-box; padding: 12px 16px; border: none;
      border-top: 0.5px solid var(--b); resize: none; font-size: 13px; color: var(--t1);
      background: var(--warm); font-family: inherit; display: block; }
    .ann-input:focus { outline: none; background: #fff; }
    .modal-footer { display: flex; justify-content: flex-end; gap: 8px; padding: 12px 16px;
      border-top: 0.5px solid var(--b); }

    @media (max-width: 768px) {
      :host { padding: 14px; gap: 12px; }
      .grp-title { font-size: 18px; }
      .hdr-btns { width: 100%; }
      .stats-row { display: none !important; }
      .two-col { grid-template-columns: 1fr; }
    }
    @media (min-width: 769px) {
      .stats2 { display: none !important; }
    }
  `],
  template: `
    <ng-container *transloco="let t">
    @if (loading()) {
      <app-skeleton-loader type="card" [count]="3" />
    }

    @if (!group() && !loading()) {
      <app-empty-state [title]="t('groupDetail.notFound')" [subtitle]="t('groupDetail.notFoundSub')" />
    }

    @if (group(); as g) {

      <!-- Header -->
      <div class="grp-header">
        <div>
          <h1 class="grp-title">{{ g.name }}</h1>
          <div class="badges-row">
            <span class="badge badge-{{ strategyVariant(g.strategy) }}">{{ g.strategy | titlecase }}</span>
            @if (activeCycle()) {
              <span class="badge badge-live">M{{ activeCycle()!.cycle_number }} · Live</span>
            } @else {
              <span class="badge badge-{{ statusVariant(g.status) }}">{{ g.status | titlecase }}</span>
            }
          </div>
          <p class="grp-meta">{{ groupMeta(g) }}</p>
        </div>
        <div class="hdr-btns">
          <button class="btn-sm btn-sm-o" (click)="postingAnnouncement.set(true)">{{ t('groupDetail.postAnnouncement') }}</button>
          <button class="btn-sm btn-sm-g" (click)="openAuction()">{{ actionLabel(g.strategy) }}</button>
        </div>
      </div>

      <!-- Stat cards — desktop -->
      <div class="stats-row">
        <div class="stat-card">
          <div class="sc-lbl">{{ t('groupDetail.potThisMonth') }}</div>
          <div class="sc-val">{{ potValue() | indianCurrency }}</div>
          <div class="sc-sub">{{ g.member_count }} × ₹{{ g.contribution_amount | number:'1.0-0' }}</div>
        </div>
        <div class="stat-card">
          <div class="sc-lbl">{{ t('groupDetail.collected') }}</div>
          <div class="sc-val g">{{ collectedAmount() | indianCurrency }}</div>
          <div class="sc-sub">{{ paidMembers().length }} {{ t('groupDetail.paidSub') }}</div>
        </div>
        <div class="stat-card">
          <div class="sc-lbl">{{ t('groupDetail.overdue') }}</div>
          <div class="sc-val r">{{ overdueAmount() | indianCurrency }}</div>
          <div class="sc-sub">{{ overdueMembers().length }} {{ t('groupDetail.membersSub') }}</div>
        </div>
        <div class="stat-card">
          <div class="sc-lbl">{{ g.strategy === 'auction' ? t('groupDetail.auctionBids') : t('groupDetail.payouts') }}</div>
          <div class="sc-val">{{ g.strategy === 'auction' ? auctionBids().length : store.payouts().length }}</div>
          <div class="sc-sub">{{ g.strategy === 'auction' ? t('groupDetail.thisCycle') : t('groupDetail.recorded') }}</div>
        </div>
      </div>

      <!-- Stat cards — mobile -->
      <div class="card stats2">
        <div class="sc" style="padding:12px 16px;">
          <div class="sc-l">{{ t('groupDetail.potThisMonth') }}</div>
          <div class="sc-v">{{ potValue() | indianCurrency }}</div>
        </div>
        <div class="sc" style="padding:12px 0;">
          <div class="sc-l">{{ t('groupDetail.collected') }}</div>
          <div class="sc-v g">{{ collectedAmount() | indianCurrency }}</div>
        </div>
        <div class="sc" style="padding:12px 0;">
          <div class="sc-l">{{ t('groupDetail.overdue') }}</div>
          <div class="sc-v r">{{ overdueAmount() | indianCurrency }}</div>
        </div>
        <div class="sc" style="padding:12px 16px;">
          <div class="sc-l">{{ t('groupDetail.auctionBids') }}</div>
          <div class="sc-v">{{ auctionBids().length }}</div>
        </div>
      </div>

      <!-- Cycle timeline -->
      <div class="sec-hdr">
        <span class="sec-title">{{ t('groupDetail.cycleTimeline') }}</span>
        <span class="sec-link">{{ t('groupDetail.allCycles') }}</span>
      </div>
      <div class="card">
        <div class="timeline">
          @for (c of cycles(); track c.id) {
            <div class="tl-item">
              <div class="tl-circle {{ cycleCircleClass(c) }}">{{ cycleContent(c) }}</div>
              <div class="tl-label {{ cycleLabelClass(c) }}">{{ cycleSubLabel(c) }}</div>
            </div>
          }
        </div>
      </div>

      <!-- Members accordion -->
      <div class="sec-hdr">
        <span class="sec-title">{{ t('groupDetail.membersThisMonth') }}</span>
      </div>
      <div class="card">
        <!-- Paid section -->
        <div class="acc-header" (click)="paidOpen.update(v => !v)">
          <div>
            <div class="card-title" style="color:var(--green)">{{ t('groupDetail.paidThisMonth') }}</div>
            <div class="card-sub">{{ paidMembers().length }} {{ t('groupDetail.membersSub') }}</div>
          </div>
          <svg class="chev" [class.open]="paidOpen()" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M4 6l4 4 4-4" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="acc-body" [class.open]="paidOpen()">
          @if (paidMembers().length === 0) {
            <div style="padding:16px;font-size:13px;color:var(--t3);">{{ t('groupDetail.noPaidYet') }}</div>
          }
          @for (m of paidMembers(); track m.id) {
            <div class="member-row">
              <div class="av av-md av-{{ m.profile.avatar_color }}">{{ m.profile.initials }}</div>
              <div class="mr-info">
                <div class="mr-name">{{ m.profile.name }}</div>
                <div class="mr-meta">{{ memberMeta(m) }}</div>
              </div>
              <div class="mr-right">
                <app-trust-score-pill [memberId]="m.profile_id" [groupId]="g.id" />
                @if (m.contribution) {
                  <span class="cs cs-paid">{{ t('groupDetail.paidBadge') }}</span>
                } @else {
                  <span class="cs cs-partial">{{ t('groupDetail.partial') }}</span>
                }
              </div>
            </div>
          }
        </div>

        <!-- Overdue section -->
        <div class="acc-header" (click)="overdueOpen.update(v => !v)">
          <div>
            <div class="card-title" style="color:var(--red)">{{ t('groupDetail.overdueAndPending') }}</div>
            <div class="card-sub">{{ overdueMembers().length }} {{ t('groupDetail.membersSub') }}</div>
          </div>
          <svg class="chev" [class.open]="overdueOpen()" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M4 6l4 4 4-4" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="acc-body" [class.open]="overdueOpen()">
          @if (overdueMembers().length === 0) {
            <div style="padding:16px;font-size:13px;color:var(--t3);">{{ t('groupDetail.allPaidUp') }}</div>
          }
          @for (m of overdueMembers(); track m.id) {
            <div class="member-row">
              <div class="av av-md av-{{ m.profile.avatar_color }}">{{ m.profile.initials }}</div>
              <div class="mr-info">
                <div class="mr-name">{{ m.profile.name }}</div>
                <div class="mr-meta">{{ memberMeta(m) }}</div>
              </div>
              <div class="mr-right">
                <app-trust-score-pill [memberId]="m.profile_id" [groupId]="g.id" />
                @if (m.contribution?.status === 'overdue') {
                  <span class="cs cs-over">{{ t('groupDetail.overdueBadge') }}</span>
                } @else {
                  <span class="cs cs-pending">{{ t('groupDetail.pendingBadge') }}</span>
                }
                @if (m.contribution) {
                  <button class="btn-sm btn-sm-g" (click)="markPaid(m.contribution)">{{ t('groupDetail.markPaid') }}</button>
                }
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Two-col: Announcements + Interest calc -->
      <div class="two-col">

        <!-- Announcements -->
        <div class="card">
          <div class="card-head">
            <span class="card-title">{{ t('groupDetail.announcements') }}</span>
            <button class="btn-sm btn-sm-o" (click)="postingAnnouncement.set(true)">{{ t('groupDetail.postShort') }}</button>
          </div>
          @if (recentAnnouncements().length === 0) {
            <div style="padding:16px;font-size:13px;color:var(--t3);">{{ t('groupDetail.noAnnouncements') }}</div>
          }
          @for (a of recentAnnouncements(); track a.id) {
            <div class="act-row">
              <div class="act-dot"></div>
              <div class="act-body">
                <div class="act-text">{{ a.text }}</div>
                <div class="act-meta">{{ a.created_at | relativeTime }} · {{ a.reactions }} {{ t('groupDetail.reactions') }}</div>
              </div>
            </div>
          }
        </div>

        <!-- Interest calculator -->
        <div class="card">
          <div class="card-head">
            <span class="card-title">{{ t('groupDetail.interestCalc') }}</span>
          </div>
          <div class="int-rows">
            @for (row of interestRows(); track row.position) {
              <div class="int-row">
                <div>
                  <div class="int-label">{{ row.label }}</div>
                  <div class="int-pos">{{ t('groupDetail.position', { n: row.position }) }}</div>
                </div>
                <div class="int-amt {{ row.color }}">{{ row.amount | indianCurrency }}</div>
              </div>
            }
          </div>
        </div>

      </div>
    }

    <!-- Payment modal -->
    @if (markingContrib()) {
      <app-payment-method-modal
        [contribution]="markingContrib()!"
        [visible]="true"
        (confirmed)="onPaymentConfirmed($event)"
        (cancelled)="cancelPayment()" />
    }

    <!-- Post announcement modal -->
    @if (postingAnnouncement()) {
      <div class="modal-overlay" (click)="postingAnnouncement.set(false)">
        <div class="modal-card" (click)="$event.stopPropagation()">
          <div class="card-head"><span class="card-title">{{ t('groupDetail.postAnnouncement') }}</span></div>
          <textarea class="ann-input" rows="4" [value]="announcementText()"
            (input)="announcementText.set($any($event.target).value)"
            [placeholder]="t('groupDetail.writeAnnouncement')"></textarea>
          <div class="modal-footer">
            <button class="btn-sm btn-sm-o" (click)="postingAnnouncement.set(false)">{{ t('groupDetail.cancel') }}</button>
            <button class="btn-sm btn-sm-g" (click)="submitAnnouncement()">{{ t('groupDetail.post') }}</button>
          </div>
        </div>
      </div>
    }
    </ng-container>
  `,
})
export class GroupDetailPage {
  store    = inject(ConsoleStore);
  private router   = inject(Router);
  private interest = inject(InterestService);

  // Store signals
  group         = this.store.selectedGroup;
  cycles        = this.store.cycles;
  auctionBids   = this.store.auctionBids;
  loading       = this.store.loading;

  // Local signals
  paidOpen            = signal(true);
  overdueOpen         = signal(true);
  markingContrib      = signal<EnrichedContribution | null>(null);
  postingAnnouncement = signal(false);
  announcementText    = signal('');

  // Computed
  enrichedMembers = computed(() => this.store.members() as EnrichedMember[]);
  paidMembers     = computed(() => this.enrichedMembers().filter(
    m => m.contribution?.status === 'paid' || m.contribution?.status === 'partial'
  ));
  overdueMembers  = computed(() => this.enrichedMembers().filter(
    m => !m.contribution || m.contribution.status === 'overdue' || m.contribution.status === 'pending'
  ));
  potValue        = computed(() => {
    const g = this.group(); return g ? g.contribution_amount * g.member_count : 0;
  });
  collectedAmount = computed(() =>
    this.store.contributions().reduce((sum, c) => sum + (c.amount_paid ?? 0), 0)
  );
  overdueAmount   = computed(() =>
    this.store.contributions().filter(c => c.status === 'overdue')
      .reduce((sum, c) => sum + c.amount_due, 0)
  );
  activeCycle     = computed(() => this.store.cycles().find(c => c.status === 'active') ?? null);
  recentAnnouncements = computed(() => this.store.announcements().slice(0, 3));
  interestRows    = computed(() => {
    const g = this.group(); if (!g) return [];
    const n = g.member_count; const base = g.contribution_amount;
    return [
      { label: 'Early taker',    position: 1,             amount: this.interest.calculateAdjustedContribution(1, n, base),  color: 'r' },
      { label: 'Base',           position: Math.ceil(n/2), amount: base,                                                    color: '' },
      { label: 'Patient waiter', position: n,              amount: this.interest.calculateAdjustedContribution(n, n, base), color: 'g' },
    ];
  });

  constructor() {
    const id = inject(ActivatedRoute).snapshot.paramMap.get('id')!;
    this.store.loadGroup(id);
    this.store.loadMembers(id);
  }

  strategyVariant(s: string): string {
    return ({ auction: 'b', lottery: 'g', fixed: 'a', consensus: 'grey' } as Record<string, string>)[s] ?? 'grey';
  }

  statusVariant(s: string): string {
    return ({ active: 'g', inviting: 'a', completed: 'grey', paused: 'grey' } as Record<string, string>)[s] ?? 'grey';
  }

  actionLabel(strategy: string): string {
    return ({ auction: 'Open auction room', lottery: 'Run lottery', fixed: 'Payout manager', consensus: 'Start vote' } as Record<string, string>)[strategy] ?? 'Manage';
  }

  groupMeta(g: Group): string {
    const [yr, mo] = g.start_date.split('-');
    const freq = ({ monthly: 'month', weekly: 'week', fortnightly: 'fortnight' } as Record<string, string>)[g.frequency] ?? g.frequency;
    const started = `${MONTHS[+mo - 1]} ${yr}`;
    const ac = this.activeCycle();
    const dueStr = ac
      ? `${+ac.due_date.split('-')[2]} ${MONTHS[+ac.due_date.split('-')[1] - 1]}`
      : `${g.due_day}`;
    return `₹${new Intl.NumberFormat('en-IN').format(g.contribution_amount)}/${freq} · ${g.member_count} members · Started ${started} · Due ${dueStr}`;
  }

  memberMeta(m: EnrichedMember): string {
    const p = m.profile.phone;
    return p.length === 10 ? `+91 ${p.slice(0,5)} ${p.slice(5)}` : p;
  }

  cycleCircleClass(c: Cycle): string {
    return ({ completed: 'tl-done', active: 'tl-active', future: 'tl-future' } as Record<string, string>)[c.status] ?? 'tl-future';
  }

  cycleLabelClass(c: Cycle): string {
    return ({ completed: 'g', active: 'b', future: '' } as Record<string, string>)[c.status] ?? '';
  }

  cycleContent(c: Cycle): string {
    if (c.status === 'active') return 'Now';
    if (c.status === 'future') {
      const parts = c.month_label.split(' · ');
      return parts[1] ?? c.month_label;
    }
    return `M${c.cycle_number}`;
  }

  cycleSubLabel(c: Cycle): string {
    if (c.status === 'completed' && c.payout_amount) {
      return `₹${Math.round(c.payout_amount / 1000)}K`;
    }
    return c.month_label.split(' · ')[0] ?? '';
  }

  markPaid(contrib: Contribution | undefined): void {
    if (!contrib) return;
    this.markingContrib.set(contrib as unknown as EnrichedContribution);
  }

  async onPaymentConfirmed(data: PaymentData): Promise<void> {
    const contrib = this.markingContrib();
    if (!contrib) return;
    await this.store.markContributionPaid(contrib.id, data as unknown as Record<string, unknown>);
    this.markingContrib.set(null);
  }

  cancelPayment(): void {
    this.markingContrib.set(null);
  }

  async submitAnnouncement(): Promise<void> {
    const text = this.announcementText().trim();
    const g = this.group();
    if (!text || !g) return;
    await this.store.postAnnouncement(g.id, text);
    this.announcementText.set('');
    this.postingAnnouncement.set(false);
  }

  openAuction(): void {
    const g = this.group();
    if (!g) return;
    const dest: Record<string, string[]> = {
      auction:   ['/console/auction'],
      lottery:   ['/console/groups', g.id, 'lottery'],
      fixed:     ['/console/groups', g.id, 'fixed'],
      consensus: ['/console/groups', g.id, 'consensus'],
    };
    this.router.navigate(dest[g.strategy] ?? ['/console/auction']);
  }
}
