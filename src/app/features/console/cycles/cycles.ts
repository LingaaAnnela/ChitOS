import { Component, computed, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';
import { ConsoleStore } from '../console.store';
import { IndianCurrencyPipe, IndianDatePipe } from '@shared/pipes';
import { SkeletonLoaderComponent, EmptyStateComponent } from '@shared/components';
import { MOCK_PROFILES } from '@core/mock/seed.data';
import type { Cycle } from '@core/mock/seed.data';

type CycleUIStatus = 'paid' | 'pending' | 'overdue';

@Component({
  selector: 'app-cycles-page',
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

    /* ── Header ─────────────────────────────────────────────── */
    .page-title { font-family: var(--font-serif); font-size: 22px; font-weight: 300; color: var(--t1); margin: 0; }
    .page-sub   { font-size: 12px; color: var(--t3); margin-top: 2px; }

    /* ── Desktop table ───────────────────────────────────────── */
    .tbl-wrap { background: var(--card); border: 0.5px solid var(--b); border-radius: var(--r); overflow: hidden; }
    table { width: 100%; border-collapse: collapse; }
    thead tr { border-bottom: 0.5px solid var(--b2); }
    th { font-size: 10px; font-weight: 500; color: var(--t3); text-transform: uppercase;
         letter-spacing: 0.05em; padding: 10px 16px; text-align: left;
         font-family: var(--font-mono); white-space: nowrap; }
    td { padding: 12px 16px; font-size: 13px; color: var(--t1); border-bottom: 0.5px solid var(--b); }
    tbody tr:last-child td { border-bottom: none; }
    tbody tr:hover { background: var(--warm); }

    .cycle-num { font-family: var(--font-mono); font-size: 12px; font-weight: 500;
                 color: var(--t2); white-space: nowrap; }
    .winner-cell { display: flex; align-items: center; gap: 8px; }
    .winner-name { font-size: 13px; font-weight: 500; color: var(--t1); }
    .no-winner { color: var(--t3); }
    .payout-amt { font-family: var(--font-mono); font-size: 13px; }
    .actions { display: flex; gap: 6px; justify-content: flex-end; }

    /* ── Mobile cards ────────────────────────────────────────── */
    .card-list { display: none; flex-direction: column; gap: 10px; }
    .cycle-card {
      background: var(--card); border: 0.5px solid var(--b); border-radius: var(--r);
      padding: 14px;
    }
    .cc-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
    .cc-num { font-family: var(--font-mono); font-size: 11px; font-weight: 500; color: var(--t2); }
    .cc-winner { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
    .cc-winner-name { font-size: 13px; font-weight: 500; color: var(--t1); }
    .cc-rows { display: flex; flex-direction: column; gap: 6px; }
    .cc-row { display: flex; justify-content: space-between; align-items: center; }
    .cc-label { font-size: 11px; color: var(--t3); }
    .cc-value { font-size: 12px; color: var(--t1); font-family: var(--font-mono); }
    .cc-action { margin-top: 12px; }

    /* ── Avatars ─────────────────────────────────────────────── */
    .av { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center;
          justify-content: center; font-size: 9px; font-weight: 500; flex-shrink: 0; }
    .av-g { background: var(--gbg); color: var(--green); border: 0.5px solid var(--gb); }
    .av-b { background: var(--bbg); color: var(--blue);  border: 0.5px solid var(--bb); }
    .av-a { background: var(--abg); color: var(--amber); border: 0.5px solid var(--ab); }
    .av-r { background: var(--rbg); color: var(--red);   border: 0.5px solid var(--rb); }

    /* ── Buttons ─────────────────────────────────────────────── */
    .btn-sm {
      font-size: 12px; padding: 6px 14px; border-radius: var(--rs);
      cursor: pointer; font-weight: 400; font-family: var(--font-sans);
      transition: background 0.1s; border: none;
    }
    .btn-sm-g { background: var(--gbg); color: var(--green); border: 0.5px solid var(--gb); font-weight: 500; }
    .btn-sm-g:hover { background: #d4edda; }
    .btn-sm-g:disabled { opacity: 0.5; cursor: not-allowed; }

    /* ── Responsive ──────────────────────────────────────────── */
    @media (max-width: 767px) {
      :host { padding: 14px; gap: 12px; }
      .page-title { font-size: 18px; }
      .tbl-wrap { display: none; }
      .card-list { display: flex; }
    }
  `],
  template: `
    <ng-container *transloco="let t">

      <!-- Header -->
      <div>
        <h1 class="page-title">{{ t('cycles.heading') }}</h1>
        @if (group()) {
          <p class="page-sub">{{ group()!.name }}</p>
        }
      </div>

      <!-- Skeleton -->
      @if (loading()) {
        <app-skeleton-loader type="row" [count]="5" />
      }

      <!-- Empty state -->
      @if (!loading() && cycles().length === 0) {
        <app-empty-state
          [title]="t('cycles.emptyTitle')"
          [subtitle]="t('cycles.emptySub')"
        />
      }

      <!-- Desktop table -->
      @if (!loading() && cycles().length > 0) {
        <div class="tbl-wrap">
          <table>
            <thead>
              <tr>
                <th>{{ t('cycles.colNum') }}</th>
                <th>{{ t('cycles.colDrawDate') }}</th>
                <th>{{ t('cycles.colWinner') }}</th>
                <th>{{ t('cycles.colPayout') }}</th>
                <th>{{ t('cycles.colStatus') }}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              @for (cycle of cycles(); track cycle.id) {
                <tr>
                  <td>
                    <span class="cycle-num">{{ t('cycles.cycleLabel', { n: cycle.cycle_number }) }}</span>
                  </td>
                  <td>{{ cycle.due_date | indianDate }}</td>
                  <td>
                    @if (winnerProfile(cycle); as wp) {
                      <div class="winner-cell">
                        <div [class]="'av av-' + wp.avatar_color">{{ wp.initials }}</div>
                        <span class="winner-name">{{ wp.name }}</span>
                      </div>
                    } @else {
                      <span class="no-winner">—</span>
                    }
                  </td>
                  <td>
                    @if (cycle.payout_amount != null) {
                      <span class="payout-amt">{{ cycle.payout_amount | indianCurrency }}</span>
                    } @else {
                      <span class="no-winner">—</span>
                    }
                  </td>
                  <td>
                    <span [class]="'badge ' + statusBadgeClass(cycle)">
                      {{ t('cycles.status.' + cycleUIStatus(cycle)) }}
                    </span>
                  </td>
                  <td>
                    <div class="actions">
                      @if (canMarkPaid(cycle)) {
                        <button
                          class="btn-sm btn-sm-g"
                          (click)="markPaid(cycle)"
                          [disabled]="loading()"
                        >{{ t('cycles.markPaid') }}</button>
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
                <span class="cc-num">{{ t('cycles.cycleLabel', { n: cycle.cycle_number }) }}</span>
                <span [class]="'badge ' + statusBadgeClass(cycle)">
                  {{ t('cycles.status.' + cycleUIStatus(cycle)) }}
                </span>
              </div>

              @if (winnerProfile(cycle); as wp) {
                <div class="cc-winner">
                  <div [class]="'av av-' + wp.avatar_color">{{ wp.initials }}</div>
                  <span class="cc-winner-name">{{ wp.name }}</span>
                </div>
              } @else {
                <div class="cc-winner">
                  <span class="no-winner" style="font-size:12px;color:var(--t3);">{{ t('cycles.noWinner') }}</span>
                </div>
              }

              <div class="cc-rows">
                <div class="cc-row">
                  <span class="cc-label">{{ t('cycles.colDrawDate') }}</span>
                  <span class="cc-value">{{ cycle.due_date | indianDate }}</span>
                </div>
                <div class="cc-row">
                  <span class="cc-label">{{ t('cycles.colPayout') }}</span>
                  <span class="cc-value">
                    {{ cycle.payout_amount != null ? (cycle.payout_amount | indianCurrency) : '—' }}
                  </span>
                </div>
              </div>

              @if (canMarkPaid(cycle)) {
                <div class="cc-action">
                  <button
                    class="btn-sm btn-sm-g"
                    style="width:100%;"
                    (click)="markPaid(cycle)"
                    [disabled]="loading()"
                  >{{ t('cycles.markPaid') }}</button>
                </div>
              }
            </div>
          }
        </div>
      }

    </ng-container>
  `,
})
export class CyclesPage implements OnInit {
  private route = inject(ActivatedRoute);
  private store  = inject(ConsoleStore);

  loading = this.store.loading;
  group   = this.store.selectedGroup;
  cycles  = this.store.cycles;

  private today = new Date();

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    this.store.loadGroup(id);
  }

  cycleUIStatus(cycle: Cycle): CycleUIStatus {
    if (cycle.status === 'completed') return 'paid';
    if (cycle.status === 'active' && new Date(cycle.due_date) < this.today) return 'overdue';
    return 'pending';
  }

  statusBadgeClass(cycle: Cycle): string {
    const s = this.cycleUIStatus(cycle);
    if (s === 'paid')    return 'badge-g';
    if (s === 'overdue') return 'badge-r';
    return 'badge-grey';
  }

  winnerProfile(cycle: Cycle) {
    if (!cycle.winner_profile_id) return null;
    return MOCK_PROFILES.find(p => p.id === cycle.winner_profile_id) ?? null;
  }

  canMarkPaid(cycle: Cycle): boolean {
    return cycle.status === 'active';
  }

  markPaid(cycle: Cycle) {
    this.store.markCyclePaid(cycle.id);
  }
}
