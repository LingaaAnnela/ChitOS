import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';
import { ConsoleStore } from '../console.store';
import { IndianCurrencyPipe, IndianDatePipe } from '@shared/pipes';
import {
  CountdownTimerComponent,
  SkeletonLoaderComponent,
  EmptyStateComponent,
} from '@shared/components';
import { MOCK_PROFILES } from '@core/mock/seed.data';
import type { EnrichedMember } from '@core/mock/seed.data';

type DrawState = 'idle' | 'counting' | 'revealed';

@Component({
  selector: 'app-lottery-console',
  standalone: true,
  imports: [
    TranslocoDirective,
    IndianCurrencyPipe,
    IndianDatePipe,
    CountdownTimerComponent,
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

    /* ── Stat cards ──────────────────────────────────────── */
    .stats-row { display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 10px; }
    .stat-card { background: var(--card); border: 0.5px solid var(--b);
                 border-radius: var(--r); padding: 14px 16px; }
    .sc-lbl { font-size: 10px; color: var(--t3); font-weight: 500; text-transform: uppercase;
              letter-spacing: 0.05em; margin-bottom: 7px; font-family: var(--font-mono); }
    .sc-val { font-family: var(--font-serif); font-size: 24px; font-weight: 300;
              color: var(--t1); letter-spacing: -0.5px; }
    .sc-val.green { color: var(--green); }
    .sc-sub { font-size: 11px; color: var(--t3); margin-top: 4px; }

    /* ── Main two-col grid ───────────────────────────────── */
    .main-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; align-items: start; }

    /* ── Card ────────────────────────────────────────────── */
    .card { background: var(--card); border: 0.5px solid var(--b); border-radius: var(--r); }
    .card-head { padding: 14px 16px; border-bottom: 0.5px solid var(--b);
                 display: flex; align-items: center; justify-content: space-between; }
    .card-title { font-size: 13px; font-weight: 500; color: var(--t1); }
    .card-sub { font-size: 11px; color: var(--t3); margin-top: 2px; }

    /* ── Eligible members chips ──────────────────────────── */
    .eligible-body { padding: 14px; display: flex; flex-wrap: wrap; gap: 8px; }
    .member-chip {
      display: flex; align-items: center; gap: 7px;
      padding: 6px 10px; background: var(--warm2);
      border: 0.5px solid var(--b); border-radius: 100px;
    }
    .chip-name { font-size: 12px; color: var(--t1); font-weight: 400; }
    .no-eligible { padding: 20px; font-size: 13px; color: var(--t3); text-align: center; }

    /* ── Avatar ──────────────────────────────────────────── */
    .av { width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center;
          justify-content: center; font-size: 9px; font-weight: 500; flex-shrink: 0; }
    .av-g { background: var(--gbg); color: var(--green); border: 0.5px solid var(--gborder); }
    .av-b { background: var(--bbg); color: var(--blue);  border: 0.5px solid var(--bborder); }
    .av-a { background: var(--abg); color: var(--amber); border: 0.5px solid var(--aborder); }
    .av-r { background: var(--rbg); color: var(--red);   border: 0.5px solid var(--rborder); }
    .av-lg { width: 56px; height: 56px; font-size: 18px; font-weight: 500; }

    /* ── Draw panel ──────────────────────────────────────── */
    .draw-panel { padding: 24px; display: flex; flex-direction: column;
                  align-items: center; gap: 16px; text-align: center; }
    .draw-idle-hint { font-size: 12px; color: var(--t3); }

    /* ── Countdown display ───────────────────────────────── */
    .countdown-wrap { padding: 20px;
      background: var(--warm2); border-radius: var(--r); border: 0.5px solid var(--b);
      display: flex; flex-direction: column; align-items: center; gap: 6px; width: 100%; }
    .countdown-label { font-size: 11px; color: var(--t3); font-family: var(--font-mono);
                       text-transform: uppercase; letter-spacing: 0.05em; }

    /* ── Winner reveal card ──────────────────────────────── */
    .winner-card {
      width: 100%;
      background: #FEF0E6;
      border: 0.5px solid rgba(230,124,42,0.3);
      border-radius: var(--r);
      padding: 24px;
      display: flex; flex-direction: column; align-items: center; gap: 12px;
      text-align: center;
    }
    .winner-label { font-size: 11px; font-weight: 500; color: #E67C2A;
                    text-transform: uppercase; letter-spacing: 0.08em; font-family: var(--font-mono); }
    .winner-name { font-family: var(--font-serif); font-size: 22px; font-weight: 300; color: var(--t1); }
    .winner-amount { font-family: var(--font-serif); font-size: 28px; font-weight: 300;
                     color: #E67C2A; letter-spacing: -0.5px; }

    /* ── Buttons ─────────────────────────────────────────── */
    .btn-sm { font-size: 12px; padding: 9px 20px; border-radius: var(--rs);
              cursor: pointer; font-weight: 400; font-family: var(--font-sans);
              transition: background 0.1s; }
    .btn-primary { background: var(--t1); color: #fff; border: none; font-weight: 500; }
    .btn-primary:hover { opacity: 0.85; }
    .btn-primary:disabled { opacity: 0.45; cursor: not-allowed; }
    .btn-ghost { background: none; color: var(--t1); border: 0.5px solid var(--b2); }
    .btn-ghost:hover { background: var(--warm); }
    .btn-saffron { background: #E67C2A; color: #fff; border: none; font-weight: 500; }
    .btn-saffron:hover { opacity: 0.85; }
    .btn-saffron:disabled { opacity: 0.45; cursor: not-allowed; }

    /* ── Previous draws table ────────────────────────────── */
    .tbl-wrap { background: var(--card); border: 0.5px solid var(--b);
                border-radius: var(--r); overflow: hidden; }
    table { width: 100%; border-collapse: collapse; }
    thead tr { border-bottom: 0.5px solid var(--b2); background: var(--warm2); }
    th { font-size: 10px; font-weight: 500; color: var(--t3); text-transform: uppercase;
         letter-spacing: 0.05em; padding: 10px 16px; text-align: left;
         font-family: var(--font-mono); white-space: nowrap; }
    td { padding: 11px 16px; font-size: 13px; color: var(--t1);
         border-bottom: 0.5px solid var(--b); vertical-align: middle; }
    tbody tr:last-child td { border-bottom: none; }
    tbody tr:hover { background: var(--warm); }
    .cycle-num { font-family: var(--font-mono); font-size: 12px; color: var(--t2); }
    .winner-cell { display: flex; align-items: center; gap: 8px; }
    .winner-cell-name { font-size: 13px; color: var(--t1); }

    /* ── Mobile card list for previous draws ─────────────── */
    .draws-card-list { display: none; flex-direction: column; gap: 10px; }
    .draw-card { background: var(--card); border: 0.5px solid var(--b);
                 border-radius: var(--r); padding: 14px; }
    .dc-top { display: flex; align-items: center; justify-content: space-between;
              margin-bottom: 10px; }
    .dc-num { font-family: var(--font-mono); font-size: 11px; font-weight: 500; color: var(--t2); }
    .dc-winner { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
    .dc-rows { display: flex; flex-direction: column; gap: 4px; }
    .dc-row { display: flex; justify-content: space-between; align-items: center; }
    .dc-lbl { font-size: 11px; color: var(--t3); }
    .dc-val { font-size: 12px; color: var(--t1); font-family: var(--font-mono); }

    /* ── Section header ──────────────────────────────────── */
    .sec-hdr { display: flex; align-items: center; justify-content: space-between; }
    .sec-title { font-size: 13px; font-weight: 500; color: var(--t1); }

    /* ── Responsive ──────────────────────────────────────── */
    @media (max-width: 767px) {
      :host { padding: 14px; gap: 12px; }
      .page-title { font-size: 18px; }
      .stats-row { grid-template-columns: 1fr 1fr; }
      .stats-row .stat-card:last-child { grid-column: span 2; }
      .main-grid { grid-template-columns: 1fr; }
      .tbl-wrap { display: none; }
      .draws-card-list { display: flex; }
    }
  `],
  template: `
    <ng-container *transloco="let t">

      <!-- Header -->
      <div class="page-hdr">
        <div>
          <h1 class="page-title">{{ t('lottery.heading') }}</h1>
          @if (group()) {
            <p class="page-sub">{{ group()!.name }}</p>
          }
        </div>
      </div>

      <!-- Skeleton -->
      @if (loading() && !group()) {
        <app-skeleton-loader type="card" [count]="3" />
      }

      <!-- Empty: no active cycle -->
      @if (!loading() && !activeCycle() && group()) {
        <app-empty-state
          [title]="t('lottery.noActiveCycle')"
          [subtitle]="t('lottery.noActiveCycleSub')" />
      }

      @if (!loading() && group() && activeCycle()) {
        @let g = group()!;
        @let potValue = g.contribution_amount * g.member_count;

        <!-- Stat cards -->
        <div class="stats-row">
          <div class="stat-card">
            <div class="sc-lbl">{{ t('lottery.potValue') }}</div>
            <div class="sc-val green">{{ potValue | indianCurrency }}</div>
            <div class="sc-sub">{{ t('lottery.cycleLabel', { n: activeCycle()!.cycle_number }) }}</div>
          </div>
          <div class="stat-card">
            <div class="sc-lbl">{{ t('lottery.eligibleCount') }}</div>
            <div class="sc-val">{{ eligibleMembers().length }}</div>
            <div class="sc-sub">{{ t('lottery.eligibleSub') }}</div>
          </div>
          <div class="stat-card">
            <div class="sc-lbl">{{ t('lottery.previousDraws') }}</div>
            <div class="sc-val">{{ completedCycles().length }}</div>
            <div class="sc-sub">{{ t('lottery.ofTotal', { total: g.total_cycles }) }}</div>
          </div>
        </div>

        <!-- Main grid -->
        <div class="main-grid">

          <!-- LEFT: Eligible members + Draw panel -->
          <div style="display:flex;flex-direction:column;gap:14px;">

            <!-- Eligible members -->
            <div class="card">
              <div class="card-head">
                <div>
                  <div class="card-title">{{ t('lottery.eligibleLabel') }}</div>
                  <div class="card-sub">{{ t('lottery.eligibleSub') }}</div>
                </div>
                <span class="badge badge-g">{{ eligibleMembers().length }}</span>
              </div>
              <div class="eligible-body">
                @if (eligibleMembers().length === 0) {
                  <div class="no-eligible">{{ t('lottery.noEligible') }}</div>
                }
                @for (m of eligibleMembers(); track m.id) {
                  <div class="member-chip">
                    <div [class]="'av av-' + m.profile.avatar_color">{{ m.profile.initials }}</div>
                    <span class="chip-name">{{ m.profile.name }}</span>
                  </div>
                }
              </div>
            </div>

            <!-- Draw panel -->
            <div class="card">
              <div class="card-head">
                <div class="card-title">{{ t('lottery.drawPanel') }}</div>
                @if (drawState() === 'idle') {
                  <div class="badge badge-grey">{{ t('lottery.ready') }}</div>
                } @else if (drawState() === 'counting') {
                  <div class="badge badge-b">{{ t('lottery.drawing') }}</div>
                } @else {
                  <div class="badge badge-g">{{ t('lottery.done') }}</div>
                }
              </div>

              <div class="draw-panel">

                <!-- Idle state -->
                @if (drawState() === 'idle') {
                  <div class="draw-idle-hint">{{ t('lottery.idleHint') }}</div>
                  <button class="btn-sm btn-primary"
                    [disabled]="eligibleMembers().length === 0"
                    (click)="startDraw()">
                    {{ t('lottery.startDraw') }}
                  </button>
                }

                <!-- Counting state -->
                @if (drawState() === 'counting') {
                  <div class="countdown-wrap">
                    <app-countdown-timer
                      [closeAt]="drawCloseAt()"
                      (onExpired)="onDrawComplete()" />
                    <div class="countdown-label">{{ t('lottery.drawingLabel') }}</div>
                  </div>
                }

                <!-- Revealed state -->
                @if (drawState() === 'revealed' && drawnWinner()) {
                  @let winner = drawnWinner()!;
                  <div class="winner-card">
                    <div class="winner-label">{{ t('lottery.winnerLabel') }}</div>
                    <div [class]="'av av-lg av-' + winner.profile.avatar_color">
                      {{ winner.profile.initials }}
                    </div>
                    <div class="winner-name">{{ winner.profile.name }}</div>
                    <div class="winner-amount">{{ potValue | indianCurrency }}</div>
                  </div>
                  <div style="display:flex;gap:10px;width:100%;">
                    <button class="btn-sm btn-ghost" style="flex:1;" (click)="resetDraw()">
                      {{ t('lottery.redraw') }}
                    </button>
                    <button class="btn-sm btn-saffron" style="flex:2;"
                      [disabled]="loading()"
                      (click)="confirmWinner()">
                      {{ t('lottery.confirmRecord') }}
                    </button>
                  </div>
                }

              </div>
            </div>

          </div>

          <!-- RIGHT: Previous draws -->
          <div style="display:flex;flex-direction:column;gap:14px;">

            <!-- Desktop table -->
            <div class="sec-hdr">
              <div class="sec-title">{{ t('lottery.previousDrawsTitle') }}</div>
            </div>

            @if (completedCycles().length === 0) {
              <app-empty-state
                [title]="t('lottery.noDraws')"
                [subtitle]="t('lottery.noDrawsSub')" />
            } @else {
              <div class="tbl-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>{{ t('lottery.colCycle') }}</th>
                      <th>{{ t('lottery.colDate') }}</th>
                      <th>{{ t('lottery.colWinner') }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (cycle of completedCycles(); track cycle.id) {
                      <tr>
                        <td><span class="cycle-num">{{ t('lottery.cycleLabel', { n: cycle.cycle_number }) }}</span></td>
                        <td>{{ cycle.due_date | indianDate }}</td>
                        <td>
                          @if (profileById(cycle.winner_profile_id!); as wp) {
                            <div class="winner-cell">
                              <div [class]="'av av-' + wp.avatar_color">{{ wp.initials }}</div>
                              <span class="winner-cell-name">{{ wp.name }}</span>
                            </div>
                          }
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>

              <!-- Mobile card list -->
              <div class="draws-card-list">
                @for (cycle of completedCycles(); track cycle.id) {
                  <div class="draw-card">
                    <div class="dc-top">
                      <span class="dc-num">{{ t('lottery.cycleLabel', { n: cycle.cycle_number }) }}</span>
                      <span class="badge badge-g">{{ t('lottery.drawn') }}</span>
                    </div>
                    @if (profileById(cycle.winner_profile_id!); as wp) {
                      <div class="dc-winner">
                        <div [class]="'av av-' + wp.avatar_color">{{ wp.initials }}</div>
                        <span style="font-size:13px;font-weight:500;color:var(--t1);">{{ wp.name }}</span>
                      </div>
                    }
                    <div class="dc-rows">
                      <div class="dc-row">
                        <span class="dc-lbl">{{ t('lottery.colDate') }}</span>
                        <span class="dc-val">{{ cycle.due_date | indianDate }}</span>
                      </div>
                    </div>
                  </div>
                }
              </div>
            }

          </div>
        </div>
      }

    </ng-container>
  `,
})
export class LotteryConsolePage implements OnInit {
  private route = inject(ActivatedRoute);
  private store  = inject(ConsoleStore);

  loading = this.store.loading;
  group   = this.store.selectedGroup;

  drawState   = signal<DrawState>('idle');
  drawCloseAt = signal('');
  drawnWinnerId = signal('');

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    this.store.loadGroup(id);
    this.store.loadMembers(id);
  }

  activeCycle = computed(() =>
    this.store.cycles().find(c => c.status === 'active') ?? null
  );

  completedCycles = computed(() =>
    this.store.cycles()
      .filter(c => c.status === 'completed' && c.winner_profile_id)
      .sort((a, b) => a.cycle_number - b.cycle_number)
  );

  eligibleMembers = computed((): EnrichedMember[] => {
    const wonIds = new Set(
      this.completedCycles().map(c => c.winner_profile_id).filter(Boolean)
    );
    return (this.store.members() as EnrichedMember[])
      .filter(m => m.approval_status === 'approved' && !wonIds.has(m.profile_id));
  });

  drawnWinner = computed((): EnrichedMember | null => {
    const id = this.drawnWinnerId();
    if (!id) return null;
    return (this.store.members() as EnrichedMember[]).find(m => m.profile_id === id) ?? null;
  });

  profileById(profileId: string) {
    return MOCK_PROFILES.find(p => p.id === profileId) ?? null;
  }

  startDraw() {
    this.drawCloseAt.set(new Date(Date.now() + 3000).toISOString());
    this.drawState.set('counting');
  }

  onDrawComplete() {
    const eligible = this.eligibleMembers();
    if (eligible.length === 0) return;
    const idx = Math.floor(Math.random() * eligible.length);
    this.drawnWinnerId.set(eligible[idx].profile_id);
    this.drawState.set('revealed');
  }

  resetDraw() {
    this.drawState.set('idle');
    this.drawnWinnerId.set('');
  }

  async confirmWinner() {
    const cycle    = this.activeCycle();
    const winnerId = this.drawnWinnerId();
    if (!cycle || !winnerId) return;
    await this.store.recordLotteryWinner(cycle.id, winnerId);
    this.drawState.set('idle');
    this.drawnWinnerId.set('');
  }
}
