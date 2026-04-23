import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';
import { ConsoleStore } from '../console.store';
import { IndianCurrencyPipe, IndianDatePipe } from '@shared/pipes';
import { SkeletonLoaderComponent, EmptyStateComponent } from '@shared/components';
import { MOCK_PROFILES } from '@core/mock/seed.data';
import type { Cycle } from '@core/mock/seed.data';

type FixedStatus = 'paid' | 'upcoming' | 'overdue' | 'scheduled';

@Component({
  selector: 'app-fixed-console',
  standalone: true,
  imports: [
    TranslocoDirective,
    IndianCurrencyPipe,
    IndianDatePipe,
    SkeletonLoaderComponent,
    EmptyStateComponent,
  ],
  styles: [`
    :host { display: flex; flex-direction: column; padding: 20px; gap: 16px; }

    /* ── Page header ─────────────────────────────────────── */
    .page-hdr { display: flex; align-items: flex-start; justify-content: space-between;
                flex-wrap: wrap; gap: 10px; }
    .page-title { font-family: var(--font-serif); font-size: 22px; font-weight: 300;
                  color: var(--t1); margin: 0; }
    .page-sub { font-size: 12px; color: var(--t3); margin-top: 2px; }

    /* ── Summary stat cards ──────────────────────────────── */
    .stats-row { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
    .stat-card { background: var(--card); border: 0.5px solid var(--b);
                 border-radius: var(--r); padding: 14px 16px; }
    .sc-lbl { font-size: 10px; color: var(--t3); font-weight: 500; text-transform: uppercase;
              letter-spacing: 0.05em; margin-bottom: 7px; font-family: var(--font-mono); }
    .sc-val { font-family: var(--font-serif); font-size: 24px; font-weight: 300;
              color: var(--t1); letter-spacing: -0.5px; }
    .sc-val.green { color: var(--green); }
    .sc-val.amber { color: var(--amber); }
    .sc-sub { font-size: 11px; color: var(--t3); margin-top: 4px; }

    /* ── Desktop table ───────────────────────────────────── */
    .tbl-wrap { background: var(--card); border: 0.5px solid var(--b);
                border-radius: var(--r); overflow: hidden; }
    table { width: 100%; border-collapse: collapse; }
    thead tr { border-bottom: 0.5px solid var(--b2); background: var(--warm2); }
    th { font-size: 10px; font-weight: 500; color: var(--t3); text-transform: uppercase;
         letter-spacing: 0.05em; padding: 10px 16px; text-align: left;
         font-family: var(--font-mono); white-space: nowrap; }
    td { padding: 12px 16px; font-size: 13px; color: var(--t1);
         border-bottom: 0.5px solid var(--b); vertical-align: middle; }
    tbody tr:last-child td { border-bottom: none; }
    tbody tr:hover { background: var(--warm); }

    .cycle-num { font-family: var(--font-mono); font-size: 12px; font-weight: 500;
                 color: var(--t2); white-space: nowrap; }
    .winner-cell { display: flex; align-items: center; gap: 8px; }
    .winner-name { font-size: 13px; font-weight: 500; color: var(--t1); }
    .no-winner { color: var(--t3); font-size: 12px; }
    .payout-amt { font-family: var(--font-mono); font-size: 13px; }
    .actions { display: flex; gap: 6px; justify-content: flex-end; }

    /* ── Mobile card list ────────────────────────────────── */
    .card-list { display: none; flex-direction: column; gap: 10px; }
    .cycle-card { background: var(--card); border: 0.5px solid var(--b);
                  border-radius: var(--r); padding: 14px; }
    .cc-top { display: flex; align-items: center; justify-content: space-between;
              margin-bottom: 10px; }
    .cc-num { font-family: var(--font-mono); font-size: 11px; font-weight: 500; color: var(--t2); }
    .cc-winner { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
    .cc-winner-name { font-size: 13px; font-weight: 500; color: var(--t1); }
    .cc-rows { display: flex; flex-direction: column; gap: 6px; }
    .cc-row { display: flex; justify-content: space-between; align-items: center; }
    .cc-label { font-size: 11px; color: var(--t3); }
    .cc-value { font-size: 12px; color: var(--t1); font-family: var(--font-mono); }
    .cc-action { margin-top: 12px; }

    /* ── Avatar ──────────────────────────────────────────── */
    .av { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center;
          justify-content: center; font-size: 9px; font-weight: 500; flex-shrink: 0; }
    .av-g { background: var(--gbg); color: var(--green); border: 0.5px solid var(--gborder); }
    .av-b { background: var(--bbg); color: var(--blue);  border: 0.5px solid var(--bborder); }
    .av-a { background: var(--abg); color: var(--amber); border: 0.5px solid var(--aborder); }
    .av-r { background: var(--rbg); color: var(--red);   border: 0.5px solid var(--rborder); }

    /* ── Buttons ─────────────────────────────────────────── */
    .btn-sm { font-size: 12px; padding: 6px 14px; border-radius: var(--rs);
              cursor: pointer; font-weight: 400; font-family: var(--font-sans);
              transition: background 0.1s; }
    .btn-sm-p { background: var(--t1); color: #fff; border: none; font-weight: 500; }
    .btn-sm-p:hover { opacity: 0.85; }
    .btn-sm-p:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-sm-o { background: none; color: var(--t1); border: 0.5px solid var(--b2); }
    .btn-sm-o:hover { background: var(--warm); }
    .btn-sm-g { background: var(--gbg); color: var(--green);
                border: 0.5px solid var(--gborder); font-weight: 500; }
    .btn-sm-g:hover { background: #d4edda; }
    .btn-sm-g:disabled { opacity: 0.5; cursor: not-allowed; }

    /* ── Confirm dialog ──────────────────────────────────── */
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4);
                     display: flex; align-items: center; justify-content: center;
                     z-index: 200; padding: 16px; }
    .modal-card { width: min(360px, 94vw); background: var(--card);
                  border-radius: var(--r); border: 0.5px solid var(--b); overflow: hidden; }
    .modal-head { padding: 14px 16px; border-bottom: 0.5px solid var(--b); }
    .modal-title { font-size: 14px; font-weight: 500; color: var(--t1); margin: 0; }
    .modal-body { padding: 12px 16px; font-size: 13px; color: var(--t2); line-height: 1.5; }
    .modal-foot { display: flex; justify-content: flex-end; gap: 8px;
                  padding: 12px 16px; border-top: 0.5px solid var(--b); }

    /* ── Responsive ──────────────────────────────────────── */
    @media (max-width: 767px) {
      :host { padding: 14px; gap: 12px; }
      .page-title { font-size: 18px; }
      .stats-row { grid-template-columns: 1fr 1fr; }
      .stats-row .stat-card:last-child { grid-column: span 2; }
      .tbl-wrap { display: none; }
      .card-list { display: flex; }
    }
  `],
  template: `
    <ng-container *transloco="let t">

      <!-- Header -->
      <div class="page-hdr">
        <div>
          <h1 class="page-title">{{ t('fixed.heading') }}</h1>
          @if (group()) {
            <p class="page-sub">{{ group()!.name }}</p>
          }
        </div>
      </div>

      <!-- Skeleton -->
      @if (loading() && !group()) {
        <app-skeleton-loader type="card" [count]="3" />
      }

      <!-- Empty -->
      @if (!loading() && cycles().length === 0) {
        <app-empty-state
          [title]="t('fixed.emptyTitle')"
          [subtitle]="t('fixed.emptySub')"
        />
      }

      @if (!loading() && cycles().length > 0) {

        <!-- Summary stat cards -->
        <div class="stats-row">
          <div class="stat-card">
            <div class="sc-lbl">{{ t('fixed.totalCollected') }}</div>
            <div class="sc-val green">{{ totalCollected() | indianCurrency }}</div>
            <div class="sc-sub">{{ completedCount() }} {{ t('fixed.cyclesComplete') }}</div>
          </div>
          <div class="stat-card">
            <div class="sc-lbl">{{ t('fixed.totalDisbursed') }}</div>
            <div class="sc-val">{{ totalDisbursed() | indianCurrency }}</div>
            <div class="sc-sub">{{ t('fixed.disbursedSub') }}</div>
          </div>
          <div class="stat-card">
            <div class="sc-lbl">{{ t('fixed.remaining') }}</div>
            <div class="sc-val amber">{{ remainingAmount() | indianCurrency }}</div>
            <div class="sc-sub">{{ remainingCycles() }} {{ t('fixed.cyclesLeft') }}</div>
          </div>
        </div>

        <!-- Desktop table -->
        <div class="tbl-wrap">
          <table>
            <thead>
              <tr>
                <th>{{ t('fixed.colNum') }}</th>
                <th>{{ t('fixed.colDate') }}</th>
                <th>{{ t('fixed.colWinner') }}</th>
                <th>{{ t('fixed.colAmount') }}</th>
                <th>{{ t('fixed.colStatus') }}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              @for (cycle of cycles(); track cycle.id) {
                <tr>
                  <td>
                    <span class="cycle-num">{{ t('fixed.cycleLabel', { n: cycle.cycle_number }) }}</span>
                  </td>
                  <td>{{ cycle.due_date | indianDate }}</td>
                  <td>
                    @if (winnerProfile(cycle); as wp) {
                      <div class="winner-cell">
                        <div [class]="'av av-' + wp.avatar_color">{{ wp.initials }}</div>
                        <span class="winner-name">{{ wp.name }}</span>
                      </div>
                    } @else {
                      <span class="no-winner">{{ t('fixed.unassigned') }}</span>
                    }
                  </td>
                  <td>
                    <span class="payout-amt">{{ cycleAmount(cycle) | indianCurrency }}</span>
                  </td>
                  <td>
                    <span [class]="'badge ' + statusBadgeClass(cycle)">
                      {{ t('fixed.status.' + cycleUIStatus(cycle)) }}
                    </span>
                  </td>
                  <td>
                    <div class="actions">
                      @if (canConfirmPayout(cycle)) {
                        <button
                          class="btn-sm btn-sm-g"
                          [disabled]="loading()"
                          (click)="openConfirm(cycle)"
                        >{{ t('fixed.confirmPayout') }}</button>
                      }
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- Mobile card list -->
        <div class="card-list">
          @for (cycle of cycles(); track cycle.id) {
            <div class="cycle-card">
              <div class="cc-top">
                <span class="cc-num">{{ t('fixed.cycleLabel', { n: cycle.cycle_number }) }}</span>
                <span [class]="'badge ' + statusBadgeClass(cycle)">
                  {{ t('fixed.status.' + cycleUIStatus(cycle)) }}
                </span>
              </div>

              @if (winnerProfile(cycle); as wp) {
                <div class="cc-winner">
                  <div [class]="'av av-' + wp.avatar_color">{{ wp.initials }}</div>
                  <span class="cc-winner-name">{{ wp.name }}</span>
                </div>
              } @else {
                <div style="font-size:12px;color:var(--t3);margin-bottom:10px;">
                  {{ t('fixed.unassigned') }}
                </div>
              }

              <div class="cc-rows">
                <div class="cc-row">
                  <span class="cc-label">{{ t('fixed.colDate') }}</span>
                  <span class="cc-value">{{ cycle.due_date | indianDate }}</span>
                </div>
                <div class="cc-row">
                  <span class="cc-label">{{ t('fixed.colAmount') }}</span>
                  <span class="cc-value">{{ cycleAmount(cycle) | indianCurrency }}</span>
                </div>
              </div>

              @if (canConfirmPayout(cycle)) {
                <div class="cc-action">
                  <button
                    class="btn-sm btn-sm-g"
                    style="width:100%;"
                    [disabled]="loading()"
                    (click)="openConfirm(cycle)"
                  >{{ t('fixed.confirmPayout') }}</button>
                </div>
              }
            </div>
          }
        </div>

      }

      <!-- Inline confirm dialog -->
      @if (confirmCycle()) {
        <div class="modal-overlay" (click)="cancelConfirm()">
          <div class="modal-card" (click)="$event.stopPropagation()">
            <div class="modal-head">
              <p class="modal-title">{{ t('fixed.confirmTitle') }}</p>
            </div>
            <div class="modal-body">
              @let cycle = confirmCycle()!;
              @let wp = winnerProfile(cycle);
              {{ t('fixed.confirmMsg', {
                n: cycle.cycle_number,
                name: wp?.name ?? t('fixed.unassigned'),
                amount: cycleAmount(cycle) | indianCurrency
              }) }}
            </div>
            <div class="modal-foot">
              <button class="btn-sm btn-sm-o" (click)="cancelConfirm()">
                {{ t('fixed.cancel') }}
              </button>
              <button class="btn-sm btn-sm-p" [disabled]="loading()" (click)="doConfirmPayout()">
                {{ t('fixed.confirmPayout') }}
              </button>
            </div>
          </div>
        </div>
      }

    </ng-container>
  `,
})
export class FixedConsolePage implements OnInit {
  private route = inject(ActivatedRoute);
  private store  = inject(ConsoleStore);

  loading = this.store.loading;
  group   = this.store.selectedGroup;
  cycles  = this.store.cycles;

  confirmCycle = signal<Cycle | null>(null);

  private today = new Date();

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    this.store.loadGroup(id);
    this.store.loadMembers(id);
  }

  /* ── Computed summary ────────────────────────────────── */

  private potPerCycle = computed(() => {
    const g = this.group();
    return g ? g.contribution_amount * g.member_count : 0;
  });

  completedCount = computed(() =>
    this.cycles().filter(c => c.status === 'completed').length
  );

  remainingCycles = computed(() =>
    this.cycles().filter(c => c.status !== 'completed').length
  );

  totalCollected = computed(() =>
    this.completedCount() * this.potPerCycle()
  );

  totalDisbursed = computed(() =>
    this.cycles()
      .filter(c => c.status === 'completed')
      .reduce((sum, c) => sum + (c.payout_amount ?? this.potPerCycle()), 0)
  );

  remainingAmount = computed(() =>
    this.remainingCycles() * this.potPerCycle()
  );

  /* ── Helpers ─────────────────────────────────────────── */

  cycleAmount(cycle: Cycle): number {
    return cycle.payout_amount ?? this.potPerCycle();
  }

  winnerProfile(cycle: Cycle) {
    if (!cycle.winner_profile_id) return null;
    return MOCK_PROFILES.find(p => p.id === cycle.winner_profile_id) ?? null;
  }

  cycleUIStatus(cycle: Cycle): FixedStatus {
    if (cycle.status === 'completed') return 'paid';
    if (cycle.status === 'active') {
      return new Date(cycle.due_date) < this.today ? 'overdue' : 'upcoming';
    }
    return 'scheduled';
  }

  statusBadgeClass(cycle: Cycle): string {
    const s = this.cycleUIStatus(cycle);
    if (s === 'paid')     return 'badge-g';
    if (s === 'overdue')  return 'badge-r';
    if (s === 'upcoming') return 'badge-b';
    return 'badge-grey';
  }

  canConfirmPayout(cycle: Cycle): boolean {
    return cycle.status === 'active';
  }

  /* ── Confirm dialog ──────────────────────────────────── */

  openConfirm(cycle: Cycle) {
    this.confirmCycle.set(cycle);
  }

  cancelConfirm() {
    this.confirmCycle.set(null);
  }

  async doConfirmPayout() {
    const cycle = this.confirmCycle();
    if (!cycle) return;
    this.confirmCycle.set(null);
    await this.store.markCyclePaid(cycle.id);
  }
}
