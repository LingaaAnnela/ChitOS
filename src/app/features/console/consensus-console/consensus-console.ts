import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';
import { ConsoleStore } from '../console.store';
import { IndianCurrencyPipe, IndianDatePipe } from '@shared/pipes';
import {
  ProgressBarComponent,
  SkeletonLoaderComponent,
  EmptyStateComponent,
  ConfirmDialog,
} from '@shared/components';
import { MOCK_PROFILES } from '@core/mock/seed.data';
import type { EnrichedMember } from '@core/mock/seed.data';

interface CandidateRow {
  profileId: string;
  name: string;
  initials: string;
  avatarColor: string;
  voteCount: number;
  votePct: number;
}

@Component({
  selector: 'app-consensus-console',
  standalone: true,
  imports: [
    DecimalPipe,
    TranslocoDirective,
    IndianCurrencyPipe,
    IndianDatePipe,
    ProgressBarComponent,
    SkeletonLoaderComponent,
    EmptyStateComponent,
    ConfirmDialog,
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
    .sc-val.amber { color: var(--amber); }
    .sc-sub { font-size: 11px; color: var(--t3); margin-top: 4px; }

    /* ── Main two-col grid ───────────────────────────────── */
    .main-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; align-items: start; }

    /* ── Card ────────────────────────────────────────────── */
    .card { background: var(--card); border: 0.5px solid var(--b); border-radius: var(--r); }
    .card-head { padding: 14px 16px; border-bottom: 0.5px solid var(--b);
                 display: flex; align-items: center; justify-content: space-between; gap: 8px; }
    .card-title { font-size: 13px; font-weight: 500; color: var(--t1); }
    .card-sub { font-size: 11px; color: var(--t3); margin-top: 2px; }

    /* ── Quorum section ──────────────────────────────────── */
    .quorum-body { padding: 14px 16px; display: flex; flex-direction: column; gap: 10px; }
    .quorum-row { display: flex; align-items: center; justify-content: space-between; }
    .quorum-lbl { font-size: 12px; color: var(--t2); }
    .quorum-val { font-family: var(--font-mono); font-size: 12px; color: var(--t1); font-weight: 500; }

    /* ── Candidates list ─────────────────────────────────── */
    .candidate-list { display: flex; flex-direction: column; }
    .candidate-row {
      display: flex; align-items: center; gap: 10px;
      padding: 11px 16px; border-bottom: 0.5px solid var(--b);
    }
    .candidate-row:last-child { border-bottom: none; }
    .av { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center;
          justify-content: center; font-size: 10px; font-weight: 500; flex-shrink: 0; }
    .av-g { background: var(--gbg); color: var(--green); border: 0.5px solid var(--gborder); }
    .av-b { background: var(--bbg); color: var(--blue);  border: 0.5px solid var(--bborder); }
    .av-a { background: var(--abg); color: var(--amber); border: 0.5px solid var(--aborder); }
    .av-r { background: var(--rbg); color: var(--red);   border: 0.5px solid var(--rborder); }
    .cand-info { flex: 1; min-width: 0; }
    .cand-name { font-size: 13px; color: var(--t1); white-space: nowrap; overflow: hidden;
                 text-overflow: ellipsis; }
    .cand-bar-wrap { margin-top: 4px; }
    .cand-meta { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
    .cand-votes { font-family: var(--font-mono); font-size: 12px; font-weight: 500; color: var(--t1); }
    .cand-pct { font-size: 11px; color: var(--t3); }
    .leader-badge {
      font-size: 9px; font-weight: 500; color: #E67C2A; background: #FEF0E6;
      border: 0.5px solid rgba(230,124,42,0.3); border-radius: 100px;
      padding: 2px 7px; font-family: var(--font-mono); text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    /* ── Action footer ───────────────────────────────────── */
    .action-footer { padding: 14px 16px; border-top: 0.5px solid var(--b); }
    .quorum-note { font-size: 11px; color: var(--t3); margin-top: 8px; text-align: center; }

    /* ── Buttons ─────────────────────────────────────────── */
    .btn-sm { font-size: 12px; padding: 9px 20px; border-radius: var(--rs);
              cursor: pointer; font-weight: 400; font-family: var(--font-sans);
              transition: background 0.1s; width: 100%; }
    .btn-primary { background: var(--t1); color: #fff; border: none; font-weight: 500; }
    .btn-primary:hover { opacity: 0.85; }
    .btn-primary:disabled { opacity: 0.45; cursor: not-allowed; }

    /* ── Past rounds table ───────────────────────────────── */
    .sec-hdr { display: flex; align-items: center; justify-content: space-between; }
    .sec-title { font-size: 13px; font-weight: 500; color: var(--t1); }
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
    .votes-cell { font-family: var(--font-mono); font-size: 12px; }

    /* ── Mobile card list ────────────────────────────────── */
    .rounds-card-list { display: none; flex-direction: column; gap: 10px; }
    .round-card { background: var(--card); border: 0.5px solid var(--b);
                  border-radius: var(--r); padding: 14px; }
    .rc-top { display: flex; align-items: center; justify-content: space-between;
              margin-bottom: 10px; }
    .rc-num { font-family: var(--font-mono); font-size: 11px; font-weight: 500; color: var(--t2); }
    .rc-winner { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
    .rc-rows { display: flex; flex-direction: column; gap: 4px; }
    .rc-row { display: flex; justify-content: space-between; align-items: center; }
    .rc-lbl { font-size: 11px; color: var(--t3); }
    .rc-val { font-size: 12px; color: var(--t1); font-family: var(--font-mono); }

    /* ── Responsive ──────────────────────────────────────── */
    @media (max-width: 767px) {
      :host { padding: 14px; gap: 12px; }
      .page-title { font-size: 18px; }
      .stats-row { grid-template-columns: 1fr 1fr; }
      .stats-row .stat-card:last-child { grid-column: span 2; }
      .main-grid { grid-template-columns: 1fr; }
      .tbl-wrap { display: none; }
      .rounds-card-list { display: flex; }
    }
  `],
  template: `
    <ng-container *transloco="let t">

      <!-- Header -->
      <div class="page-hdr">
        <div>
          <h1 class="page-title">{{ t('consensus.heading') }}</h1>
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
          [title]="t('consensus.noActiveCycle')"
          [subtitle]="t('consensus.noActiveCycleSub')" />
      }

      @if (!loading() && group() && activeCycle()) {
        @let g = group()!;
        @let cycle = activeCycle()!;
        @let potValue = g.contribution_amount * g.member_count;
        @let total = members().length;
        @let cast = votesCast();
        @let threshold = quorumThreshold();
        @let met = quorumMet();

        <!-- Stat cards -->
        <div class="stats-row">
          <div class="stat-card">
            <div class="sc-lbl">{{ t('consensus.potValue') }}</div>
            <div class="sc-val green">{{ potValue | indianCurrency }}</div>
            <div class="sc-sub">{{ t('consensus.cycleLabel', { n: cycle.cycle_number }) }}</div>
          </div>
          <div class="stat-card">
            <div class="sc-lbl">{{ t('consensus.votesCast') }}</div>
            <div [class]="'sc-val ' + (met ? 'green' : 'amber')">{{ cast }}</div>
            <div class="sc-sub">{{ t('consensus.ofMembers', { total }) }}</div>
          </div>
          <div class="stat-card">
            <div class="sc-lbl">{{ t('consensus.pastRounds') }}</div>
            <div class="sc-val">{{ completedCycles().length }}</div>
            <div class="sc-sub">{{ t('consensus.ofTotal', { total: g.total_cycles }) }}</div>
          </div>
        </div>

        <!-- Main grid -->
        <div class="main-grid">

          <!-- LEFT: Active voting round -->
          <div style="display:flex;flex-direction:column;gap:14px;">
            <div class="card">
              <div class="card-head">
                <div>
                  <div class="card-title">
                    {{ t('consensus.activeRound', { n: cycle.cycle_number }) }}
                  </div>
                  <div class="card-sub">
                    {{ t('consensus.closes') }} {{ cycle.due_date | indianDate }}
                  </div>
                </div>
                @if (met) {
                  <span class="badge badge-g">{{ t('consensus.quorumMet') }}</span>
                } @else {
                  <span class="badge badge-a">{{ t('consensus.quorumNeeded', { n: threshold - cast }) }}</span>
                }
              </div>

              <!-- Quorum progress -->
              <div class="quorum-body">
                <div class="quorum-row">
                  <span class="quorum-lbl">{{ t('consensus.quorumProgress') }}</span>
                  <span class="quorum-val">{{ cast }} / {{ total }}</span>
                </div>
                <app-progress-bar
                  [value]="total > 0 ? (cast / total) * 100 : 0"
                  [color]="met ? 'g' : 'a'"
                  [showLabel]="false" />
              </div>

              <!-- Candidates -->
              <div class="candidate-list">
                @for (c of candidates(); track c.profileId; let i = $index) {
                  <div class="candidate-row">
                    <div [class]="'av av-' + c.avatarColor">{{ c.initials }}</div>
                    <div class="cand-info">
                      <div class="cand-name">{{ c.name }}</div>
                      <div class="cand-bar-wrap">
                        <app-progress-bar [value]="c.votePct" color="b" [showLabel]="false" />
                      </div>
                    </div>
                    <div class="cand-meta">
                      @if (i === 0 && c.voteCount > 0) {
                        <span class="leader-badge">{{ t('consensus.leading') }}</span>
                      }
                      <span class="cand-votes">{{ c.voteCount }}</span>
                      <span class="cand-pct">{{ c.votePct | number:'1.0-0' }}%</span>
                    </div>
                  </div>
                }
              </div>

              <!-- Action footer -->
              <div class="action-footer">
                <button class="btn-sm btn-primary"
                  [disabled]="!met || loading()"
                  (click)="openConfirm()">
                  {{ t('consensus.closeVoting') }}
                </button>
                @if (!met) {
                  <div class="quorum-note">
                    {{ t('consensus.quorumNote', { n: threshold - cast, total: threshold }) }}
                  </div>
                }
              </div>
            </div>
          </div>

          <!-- RIGHT: Past rounds -->
          <div style="display:flex;flex-direction:column;gap:14px;">
            <div class="sec-hdr">
              <div class="sec-title">{{ t('consensus.pastRoundsTitle') }}</div>
            </div>

            @if (completedCycles().length === 0) {
              <app-empty-state
                [title]="t('consensus.noRounds')"
                [subtitle]="t('consensus.noRoundsSub')" />
            } @else {
              <div class="tbl-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>{{ t('consensus.colCycle') }}</th>
                      <th>{{ t('consensus.colWinner') }}</th>
                      <th>{{ t('consensus.colVotes') }}</th>
                      <th>{{ t('consensus.colDate') }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (c of completedCycles(); track c.id) {
                      <tr>
                        <td><span class="cycle-num">{{ t('consensus.cycleLabel', { n: c.cycle_number }) }}</span></td>
                        <td>
                          @if (profileById(c.winner_profile_id!); as wp) {
                            <div class="winner-cell">
                              <div [class]="'av av-' + wp.avatar_color">{{ wp.initials }}</div>
                              {{ wp.name }}
                            </div>
                          }
                        </td>
                        <td><span class="votes-cell">{{ payoutVotesLabel(c.id) }}</span></td>
                        <td>{{ c.due_date | indianDate }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>

              <!-- Mobile card list -->
              <div class="rounds-card-list">
                @for (c of completedCycles(); track c.id) {
                  <div class="round-card">
                    <div class="rc-top">
                      <span class="rc-num">{{ t('consensus.cycleLabel', { n: c.cycle_number }) }}</span>
                      <span class="badge badge-g">{{ t('consensus.declared') }}</span>
                    </div>
                    @if (profileById(c.winner_profile_id!); as wp) {
                      <div class="rc-winner">
                        <div [class]="'av av-' + wp.avatar_color">{{ wp.initials }}</div>
                        <span style="font-size:13px;font-weight:500;color:var(--t1);">{{ wp.name }}</span>
                      </div>
                    }
                    <div class="rc-rows">
                      <div class="rc-row">
                        <span class="rc-lbl">{{ t('consensus.colDate') }}</span>
                        <span class="rc-val">{{ c.due_date | indianDate }}</span>
                      </div>
                      <div class="rc-row">
                        <span class="rc-lbl">{{ t('consensus.colVotes') }}</span>
                        <span class="rc-val">{{ payoutVotesLabel(c.id) }}</span>
                      </div>
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        </div>
      }

      <!-- Confirm dialog -->
      @if (showConfirm()) {
        <app-confirm-dialog
          [title]="confirmTitle()"
          [message]="confirmMessage()"
          [confirmLabel]="'Close Voting'"
          (confirmed)="onConfirm()"
          (cancelled)="showConfirm.set(false)" />
      }

    </ng-container>
  `,
})
export class ConsensusConsolePage implements OnInit {
  private route = inject(ActivatedRoute);
  private store  = inject(ConsoleStore);

  loading = this.store.loading;
  group   = this.store.selectedGroup;

  showConfirm = signal(false);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    this.store.loadGroup(id);
    this.store.loadMembers(id);
    this.store.loadGroup(id).then(() => {
      const cycle = this.activeCycle();
      if (cycle) this.store.loadConsensusVotes(cycle.id);
    });
  }

  activeCycle = computed(() =>
    this.store.cycles().find(c => c.status === 'active') ?? null
  );

  completedCycles = computed(() =>
    this.store.cycles()
      .filter(c => c.status === 'completed' && c.winner_profile_id)
      .sort((a, b) => a.cycle_number - b.cycle_number)
  );

  members = computed((): EnrichedMember[] =>
    (this.store.members() as EnrichedMember[])
      .filter(m => m.approval_status === 'approved')
  );

  votesCast = computed(() => this.store.consensusVotes().length);

  quorumThreshold = computed(() =>
    Math.ceil(this.members().length * 0.5)
  );

  quorumMet = computed(() =>
    this.votesCast() >= this.quorumThreshold()
  );

  candidates = computed((): CandidateRow[] => {
    const votes = this.store.consensusVotes();
    const totalVotes = votes.length;
    const tally = new Map<string, number>();
    for (const v of votes) {
      tally.set(v.candidate_profile_id, (tally.get(v.candidate_profile_id) ?? 0) + 1);
    }
    return this.members()
      .map(m => {
        const count = tally.get(m.profile_id) ?? 0;
        return {
          profileId:   m.profile_id,
          name:        m.profile.name,
          initials:    m.profile.initials,
          avatarColor: m.profile.avatar_color,
          voteCount:   count,
          votePct:     totalVotes > 0 ? (count / totalVotes) * 100 : 0,
        };
      })
      .sort((a, b) => b.voteCount - a.voteCount);
  });

  topCandidate = computed((): CandidateRow | null =>
    this.candidates()[0] ?? null
  );

  confirmTitle = computed(() => {
    const top = this.topCandidate();
    return top ? `Declare ${top.name} as winner?` : 'Declare winner?';
  });

  confirmMessage = computed(() => {
    const top = this.topCandidate();
    const cycle = this.activeCycle();
    if (!top || !cycle) return '';
    return `${top.name} leads with ${top.voteCount} vote${top.voteCount !== 1 ? 's' : ''}. Closing voting will end Cycle ${cycle.cycle_number} and record the payout.`;
  });

  profileById(profileId: string) {
    return MOCK_PROFILES.find(p => p.id === profileId) ?? null;
  }

  payoutVotesLabel(cycleId: string): string {
    const votes = this.store.consensusVotes().filter(v => v.cycle_id === cycleId);
    return votes.length > 0 ? `${votes.length}` : '—';
  }

  openConfirm() {
    if (!this.quorumMet()) return;
    const top = this.topCandidate();
    if (!top || top.voteCount === 0) return;
    this.showConfirm.set(true);
  }

  async onConfirm() {
    this.showConfirm.set(false);
    const cycle = this.activeCycle();
    const top   = this.topCandidate();
    if (!cycle || !top) return;
    await this.store.recordConsensusWinner(cycle.id, top.profileId);
  }
}
