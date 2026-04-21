import { Component, computed, effect, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ConsoleStore } from '../console.store';
import { TitleCasePipe } from '@angular/common';
import { TranslocoDirective } from '@jsverse/transloco';
import { IndianCurrencyPipe } from '@shared/pipes';
import { SkeletonLoaderComponent, EmptyStateComponent } from '@shared/components';
import type { Group, EnrichedMember } from '@core/mock/seed.data';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [TitleCasePipe, IndianCurrencyPipe, TranslocoDirective, SkeletonLoaderComponent, EmptyStateComponent],
  styles: [`
    :host { display: flex; flex-direction: column; padding: 20px; gap: 16px; }

    /* ── Stat cards ──────────────────────────────────────────── */
    .stats-row { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; }
    .stat-card {
      background: var(--card); border: 0.5px solid var(--b);
      border-radius: var(--r); padding: 14px 16px;
    }
    .sc-lbl {
      font-size: 10px; color: var(--t3); font-weight: 500;
      text-transform: uppercase; letter-spacing: 0.5px;
      margin-bottom: 7px; font-family: var(--font-mono);
    }
    .sc-val {
      font-family: var(--font-serif); font-size: 26px;
      font-weight: 300; color: var(--t1); letter-spacing: -0.5px;
    }
    .sc-val.g { color: var(--green); }
    .sc-val.r { color: var(--red); }
    .sc-sub { font-size: 11px; color: var(--t3); margin-top: 4px; }

    /* ── Section header ──────────────────────────────────────── */
    .sec-hdr { display: flex; justify-content: space-between; align-items: center; }
    .sec-title { font-size: 13px; font-weight: 500; color: var(--t1); }
    .sec-link { font-size: 11px; color: var(--blue); cursor: pointer; }

    /* ── Groups table (desktop) ──────────────────────────────── */
    .groups-tbl {
      background: var(--card); border: 0.5px solid var(--b);
      border-radius: var(--r); overflow: hidden;
    }
    .gt-head {
      display: grid; grid-template-columns: 2fr 90px 100px 110px 90px;
      padding: 9px 16px; border-bottom: 0.5px solid var(--b);
      background: var(--warm2);
    }
    .gt-hcell {
      font-size: 10px; color: var(--t3); font-weight: 500;
      text-transform: uppercase; letter-spacing: 0.4px; font-family: var(--font-mono);
    }
    .gt-row {
      display: grid; grid-template-columns: 2fr 90px 100px 110px 90px;
      padding: 12px 16px; border-bottom: 0.5px solid var(--b);
      align-items: center; cursor: pointer; transition: background 0.1s;
    }
    .gt-row:last-child { border-bottom: none; }
    .gt-row:hover { background: var(--warm); }
    .gr-name { font-size: 13px; font-weight: 500; color: var(--t1); }
    .gr-meta { font-size: 11px; color: var(--t3); margin-top: 2px; }
    .prog-wrap { display: flex; align-items: center; gap: 6px; }
    .prog-pct { font-size: 10px; color: var(--t3); white-space: nowrap; }
    .cell-actions { display: flex; gap: 5px; justify-content: flex-end; }

    /* ── Small buttons ───────────────────────────────────────── */
    .btn-sm {
      font-size: 12px; padding: 6px 14px; border-radius: var(--rs);
      cursor: pointer; font-weight: 400; font-family: var(--font-sans);
      transition: background 0.1s;
    }
    .btn-sm-o { background: none; color: var(--t1); border: 0.5px solid var(--b2); }
    .btn-sm-o:hover { background: var(--warm); }
    .btn-sm-g { background: var(--gbg); color: var(--green); border: 0.5px solid var(--gborder); font-weight: 500; }
    .btn-sm-a { background: var(--abg); color: var(--amber); border: 0.5px solid var(--aborder); }
    .btn-sm-b { background: var(--bbg); color: var(--blue);  border: 0.5px solid var(--bborder); }

    /* ── Group cards (mobile) ────────────────────────────────── */
    .mobile-cards { display: none; flex-direction: column; gap: 10px; }
    .grp-card {
      background: var(--card); border: 0.5px solid var(--b);
      border-radius: var(--r); padding: 12px;
    }
    .gc-top { display: flex; align-items: flex-start; gap: 8px; margin-bottom: 8px; }
    .gc-ind { width: 3px; min-height: 34px; border-radius: 2px; flex-shrink: 0; margin-top: 1px; }
    .gc-info { flex: 1; min-width: 0; }
    .gc-name { font-size: 13px; font-weight: 500; color: var(--t1); }
    .gc-meta { font-size: 11px; color: var(--t3); margin-top: 1px; }
    .gc-amounts {
      display: grid; grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 6px; margin: 8px 0;
    }
    .ga-l { font-size: 10px; color: var(--t3); margin-bottom: 2px; }
    .ga-v { font-size: 13px; font-weight: 500; color: var(--t1); }
    .gc-bottom {
      display: flex; align-items: center;
      justify-content: space-between; margin-top: 8px;
    }
    .gc-link { font-size: 11px; color: var(--blue); cursor: pointer; }

    /* ── Two-column layout ───────────────────────────────────── */
    .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    .card-title { font-size: 13px; font-weight: 500; color: var(--t1); }
    .card-sub { font-size: 11px; color: var(--t3); margin-top: 2px; }

    /* ── Pending approvals ───────────────────────────────────── */
    .approval-row {
      display: flex; align-items: center; gap: 12px;
      padding: 12px 16px; border-bottom: 0.5px solid var(--b);
    }
    .approval-row:last-child { border-bottom: none; }
    .ap-info { flex: 1; min-width: 0; }
    .ap-name { font-size: 13px; font-weight: 500; color: var(--t1); }
    .ap-meta { font-size: 11px; color: var(--t3); margin-top: 1px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .ap-btns { display: flex; gap: 6px; flex-shrink: 0; }
    .btn-approve {
      font-size: 11px; padding: 5px 11px; border-radius: var(--rs);
      border: 0.5px solid var(--gborder); color: var(--green);
      background: var(--gbg); cursor: pointer; font-weight: 500;
      font-family: var(--font-sans);
    }
    .btn-reject {
      font-size: 11px; padding: 5px 11px; border-radius: var(--rs);
      border: 0.5px solid var(--rborder); color: var(--red);
      background: var(--rbg); cursor: pointer; font-family: var(--font-sans);
    }

    /* ── Activity feed ───────────────────────────────────────── */
    .act-row {
      display: flex; gap: 10px; padding: 10px 16px;
      border-bottom: 0.5px solid var(--b); align-items: flex-start;
    }
    .act-row:last-child { border-bottom: none; }
    .act-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; margin-top: 5px; }
    .act-body { flex: 1; min-width: 0; }
    .act-text { font-size: 12px; color: var(--t1); line-height: 1.4; }
    .act-time { font-size: 10px; color: var(--t3); margin-top: 2px; font-family: var(--font-mono); }

    /* ── Empty / skeleton inside cards ──────────────────────── */
    .card-empty { padding: 24px 16px; text-align: center; }

    /* ── Responsive ──────────────────────────────────────────── */
    @media (max-width: 768px) {
      :host { padding: 14px; gap: 12px; }
      .stats-row { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
      .two-col { grid-template-columns: 1fr; }
      .groups-tbl { display: none; }
      .mobile-cards { display: flex; }
    }
  `],
  template: `
    <ng-container *transloco="let t">
    <!-- ── Stat cards ──────────────────────────────────────────── -->
    <div class="stats-row">
      <div class="stat-card">
        <div class="sc-lbl">{{ t('dashboard.activeGroups') }}</div>
        <div class="sc-val g">{{ stats().activeGroups }}</div>
        <div class="sc-sub">{{ groupSubLabel() }}</div>
      </div>
      <div class="stat-card">
        <div class="sc-lbl">{{ t('dashboard.totalMembers') }}</div>
        <div class="sc-val">{{ stats().totalMembers }}</div>
        <div class="sc-sub">{{ t('dashboard.acrossAllGroups') }}</div>
      </div>
      <div class="stat-card">
        <div class="sc-lbl">{{ t('dashboard.potThisMonth') }}</div>
        <div class="sc-val">{{ stats().potThisMonth | indianCurrency }}</div>
        <div class="sc-sub">{{ potDueLabel() }}</div>
      </div>
      <div class="stat-card">
        <div class="sc-lbl">{{ t('dashboard.overdue') }}</div>
        <div class="sc-val" [class.r]="stats().overdueCount > 0">{{ stats().overdueCount }}</div>
        <div class="sc-sub">{{ stats().overdueCount > 0 ? t('dashboard.actionNeeded') : t('dashboard.allClear') }}</div>
      </div>
    </div>

    <!-- ── Groups loading skeleton ─────────────────────────────── -->
    @if (loading()) {
      <div class="sec-hdr">
        <span class="sec-title">{{ t('dashboard.yourGroups') }}</span>
      </div>
      <app-skeleton-loader type="card" [count]="3" />
    }

    <!-- ── Empty state ─────────────────────────────────────────── -->
    @if (!loading() && groups().length === 0) {
      <app-empty-state
        [title]="t('dashboard.noGroupsTitle')"
        [subtitle]="t('dashboard.noGroupsSub')"
        [actionLabel]="t('dashboard.createGroup')" />
    }

    <!-- ── Groups section ──────────────────────────────────────── -->
    @if (!loading() && groups().length > 0) {
      <div class="sec-hdr">
        <span class="sec-title">{{ t('dashboard.yourGroups') }}</span>
        <span class="sec-link">{{ t('dashboard.createNew') }}</span>
      </div>

      <!-- Desktop table -->
      <div class="groups-tbl">
        <div class="gt-head">
          <div class="gt-hcell">{{ t('dashboard.colGroup') }}</div>
          <div class="gt-hcell">{{ t('dashboard.colStrategy') }}</div>
          <div class="gt-hcell">{{ t('dashboard.colProgress') }}</div>
          <div class="gt-hcell">{{ t('dashboard.colContributions') }}</div>
          <div class="gt-hcell"></div>
        </div>
        @for (g of groups(); track g.id) {
          <div class="gt-row" [style.opacity]="g.status === 'completed' ? '0.65' : '1'"
               (click)="goToGroup(g.id)">
            <div>
              <div class="gr-name">{{ g.name }}</div>
              <div class="gr-meta">{{ groupMeta(g) }}</div>
            </div>
            <div>
              <span class="badge badge-{{ strategyVariant(g.strategy) }}">
                {{ g.strategy | titlecase }}
              </span>
            </div>
            <div>
              <div class="prog-wrap">
                <div class="prog-track" style="flex:1;">
                  <div [class]="'prog-fill prog-fill-' + progressColor(g)"
                       [style.width.%]="cyclePct(g)"></div>
                </div>
                <span class="prog-pct">{{ cycleLabel(g) }}</span>
              </div>
            </div>
            <div>
              @if (g.status === 'active') {
                @let s = summaryFor(g.id);
                @if (s) {
                  <div style="font-size:12px;color:var(--green);font-weight:500;">{{ s.paidCount }} {{ t('dashboard.paid') }}</div>
                  @if (s.overdueCount > 0) {
                    <div style="font-size:11px;color:var(--red);">{{ s.overdueCount }} {{ t('dashboard.overdueBadge') }}</div>
                  }
                } @else {
                  <div style="font-size:12px;color:var(--t3);">{{ g.member_count }} {{ t('dashboard.members') }}</div>
                }
              } @else if (g.status === 'inviting') {
                @let pc = pendingCount(g.id);
                @if (pc > 0) {
                  <div style="font-size:12px;color:var(--amber);font-weight:500;">{{ pc }} {{ t('dashboard.approvalsNeeded') }}</div>
                }
                <div style="font-size:11px;color:var(--t3);">{{ t('dashboard.notStarted') }}</div>
              } @else {
                <div style="font-size:12px;color:var(--t3);">{{ t('dashboard.completed') }}</div>
              }
            </div>
            <div class="cell-actions">
              @if (g.status === 'active') {
                <button class="btn-sm btn-sm-o" (click)="goToGroup(g.id); $event.stopPropagation()">{{ t('dashboard.view') }}</button>
                @if (g.strategy === 'auction') {
                  <button class="btn-sm btn-sm-b" (click)="openAuction(); $event.stopPropagation()">{{ t('dashboard.auctionBtn') }}</button>
                }
              } @else if (g.status === 'inviting') {
                <button class="btn-sm btn-sm-a" (click)="openApprovals(g.id); $event.stopPropagation()">{{ t('dashboard.approve') }}</button>
              } @else {
                <button class="btn-sm btn-sm-o" (click)="goToGroup(g.id); $event.stopPropagation()">{{ t('dashboard.history') }}</button>
              }
            </div>
          </div>
        }
      </div>

      <!-- Mobile cards -->
      <div class="mobile-cards">
        @for (g of groups(); track g.id) {
          <div class="grp-card" [style.opacity]="g.status === 'completed' ? '0.65' : '1'"
               (click)="goToGroup(g.id)">
            <div class="gc-top">
              <div class="gc-ind" [style.background]="indicatorColor(g.status)"></div>
              <div class="gc-info">
                <div class="gc-name">{{ g.name }}</div>
                <div class="gc-meta">{{ cardMeta(g) }}</div>
              </div>
              <span class="badge badge-{{ strategyVariant(g.strategy) }}">
                {{ g.strategy | titlecase }}
              </span>
            </div>

            @if (g.status === 'active') {
              <div class="gc-amounts">
                <div>
                  <div class="ga-l">{{ t('home.pot') }}</div>
                  <div class="ga-v">{{ g.contribution_amount * g.member_count | indianCurrency }}</div>
                </div>
                <div>
                  <div class="ga-l">{{ t('dashboard.perMonth') }}</div>
                  <div class="ga-v">{{ g.contribution_amount | indianCurrency }}</div>
                </div>
                <div>
                  <div class="ga-l">{{ t('dashboard.members') }}</div>
                  <div class="ga-v">{{ g.member_count }}/{{ g.max_members }}</div>
                </div>
              </div>
            }

            <div class="prog-track" style="height:3px;">
              <div [class]="'prog-fill prog-fill-' + progressColor(g)"
                   [style.width.%]="cyclePct(g)"></div>
            </div>

            <div class="gc-bottom" style="margin-top:8px;">
              @if (g.status === 'active') {
                @let s = summaryFor(g.id);
                <div style="font-size:10px;color:var(--t3);">
                  @if (s) { {{ s.paidCount }}/{{ g.member_count }} {{ t('dashboard.paid') }}
                    @if (s.overdueCount > 0) { · <span style="color:var(--red);">{{ s.overdueCount }} {{ t('dashboard.overdueBadge') }}</span> }
                  } @else { {{ cyclePct(g) }}% complete }
                </div>
              } @else if (g.status === 'inviting') {
                @let pc = pendingCount(g.id);
                <div style="font-size:10px;font-weight:500;" [style.color]="pc > 0 ? 'var(--amber)' : 'var(--t3)'">
                  {{ pc > 0 ? pc + ' ' + t('dashboard.approvalsNeeded') : t('dashboard.acceptingMembers') }}
                </div>
              } @else {
                <div style="font-size:10px;color:var(--t3);">{{ t('dashboard.allReceived', { count: g.member_count }) }}</div>
              }
              <span class="gc-link">{{ g.status === 'inviting' ? t('dashboard.reviewArrow') : t('dashboard.viewArrow') }}</span>
            </div>
          </div>
        }
      </div>
    }

    <!-- ── Two-column: approvals + activity ────────────────────── -->
    <div class="two-col">

      <!-- Pending approvals card -->
      <div class="card">
        <div class="card-head">
          <div>
            <div class="card-title">{{ t('dashboard.pendingApprovals') }}</div>
            <div class="card-sub">{{ t('dashboard.membersWaiting') }}</div>
          </div>
          @if (enrichedPending().length > 0) {
            <span class="badge badge-r">{{ enrichedPending().length }} {{ t('dashboard.waiting') }}</span>
          }
        </div>

        @if (loading()) {
          <div style="padding:12px 16px;">
            <app-skeleton-loader type="row" [count]="2" />
          </div>
        } @else if (enrichedPending().length === 0) {
          <div class="card-empty">
            <app-empty-state [title]="t('dashboard.noPendingTitle')" [subtitle]="t('dashboard.noPendingSub')" />
          </div>
        } @else {
          @for (m of enrichedPending(); track m.id) {
            <div class="approval-row">
              <div [class]="'av av-md av-' + m.profile.avatar_color">
                {{ m.profile.initials }}
              </div>
              <div class="ap-info">
                <div class="ap-name">{{ m.profile.name }}</div>
                <div class="ap-meta">{{ approvalMeta(m) }}</div>
              </div>
              <div class="ap-btns">
                <button class="btn-approve" (click)="approve(m.id)">{{ t('dashboard.approve') }}</button>
                <button class="btn-reject"  (click)="reject(m.id)">{{ t('dashboard.reject') }}</button>
              </div>
            </div>
          }
        }
      </div>

      <!-- Recent activity card -->
      <div class="card">
        <div class="card-head">
          <div class="card-title">{{ t('dashboard.recentActivity') }}</div>
        </div>

        @if (loading()) {
          <div style="padding:12px 16px;">
            <app-skeleton-loader type="row" [count]="4" />
          </div>
        } @else {
          @for (item of recentActivity(); track item.id) {
            <div class="act-row">
              <div class="act-dot" [style.background]="dotColor(item.color)"></div>
              <div class="act-body">
                <div class="act-text">{{ item.text }}</div>
                <div class="act-time">{{ item.time_label }}</div>
              </div>
            </div>
          }
          @if (recentActivity().length === 0) {
            <div class="card-empty">
              <app-empty-state [title]="t('dashboard.noActivityTitle')" [subtitle]="t('dashboard.noActivitySub')" />
            </div>
          }
        }
      </div>

    </div>
    </ng-container>
  `,
})
export class DashboardPage {
  private store  = inject(ConsoleStore);
  private router = inject(Router);

  loading      = this.store.loading;
  groups       = this.store.groups;
  stats        = this.store.dashboardStats;
  activityLog  = this.store.activityLog;

  enrichedPending = computed(() => this.store.pendingApprovals() as EnrichedMember[]);
  recentActivity  = computed(() => this.store.activityLog().slice(0, 8));

  groupSubLabel = computed(() => {
    const gs = this.store.groups();
    const completed = gs.filter(g => g.status === 'completed').length;
    const active    = gs.filter(g => g.status === 'active').length;
    const inviting  = gs.filter(g => g.status === 'inviting').length;
    const parts: string[] = [];
    if (completed) parts.push(`${completed} completed`);
    if (inviting)  parts.push(`${inviting} inviting`);
    if (active)    parts.push(`${active} running`);
    return parts.join(' · ') || 'No groups yet';
  });

  potDueLabel = computed(() => {
    const active = this.store.groups().find(g => g.status === 'active');
    if (!active) return 'No active groups';
    const now = new Date();
    const due = new Date(now.getFullYear(), now.getMonth(), active.due_day);
    if (due < now) due.setMonth(due.getMonth() + 1);
    return `Due ${due.getDate()} ${MONTHS[due.getMonth()]} ${due.getFullYear()}`;
  });

  private dashboardLoaded = false;

  constructor() {
    effect(() => {
      if (this.store.groups().length > 0 && !this.dashboardLoaded) {
        this.dashboardLoaded = true;
        this.store.loadDashboardData();
      }
    });
  }

  // ── Helpers ────────────────────────────────────────────────────

  summaryFor(groupId: string) {
    return this.store.groupSummaries()[groupId];
  }

  pendingCount(groupId: string): number {
    return this.store.pendingApprovals().filter(m => m.group_id === groupId).length;
  }

  strategyVariant(s: string): string {
    return ({ auction: 'b', lottery: 'g', fixed: 'a', consensus: 'grey' } as Record<string, string>)[s] ?? 'grey';
  }

  indicatorColor(status: string): string {
    return ({ active: 'var(--green)', inviting: 'var(--amber)', completed: '#B4B2A9' } as Record<string, string>)[status] ?? 'var(--t3)';
  }

  progressColor(g: Group): 'g' | 'a' | 'grey' {
    if (g.status === 'completed') return 'grey';
    if (g.status === 'inviting')  return 'a';
    return 'g';
  }

  cyclePct(g: Group): number {
    if (g.status === 'completed') return 100;
    if (g.status === 'inviting')  return Math.round((g.member_count / g.max_members) * 100);
    return Math.round((g.current_cycle / g.total_cycles) * 100);
  }

  cycleLabel(g: Group): string {
    if (g.status === 'completed') return `${g.total_cycles}/${g.total_cycles}`;
    if (g.status === 'inviting')  return `${g.member_count}/${g.max_members}`;
    return `${g.current_cycle}/${g.total_cycles}`;
  }

  groupMeta(g: Group): string {
    const freq = g.frequency === 'monthly' ? '/mo' : g.frequency === 'weekly' ? '/wk' : '/fn';
    const amt  = new Intl.NumberFormat('en-IN').format(g.contribution_amount);
    const d    = new Date(g.start_date);
    const date = `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
    if (g.status === 'inviting') return `₹${amt}${freq} · ${g.member_count} approved · ${date}`;
    return `₹${amt}${freq} · ${g.member_count} members · ${date}`;
  }

  cardMeta(g: Group): string {
    const d = new Date(g.start_date);
    if (g.status === 'completed') return `Completed ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
    if (g.status === 'inviting') {
      const pc = this.pendingCount(g.id);
      const startFmt = `${d.getDate()} ${MONTHS[d.getMonth()]}`;
      return pc > 0 ? `Starts ${startFmt} · ${pc} pending approval` : `Starts ${startFmt}`;
    }
    return `Month ${g.current_cycle} of ${g.total_cycles} · Due ${this.potDueLabel().replace('Due ', '')}`;
  }

  groupName(groupId: string): string {
    return this.store.groups().find(g => g.id === groupId)?.name ?? '—';
  }

  approvalMeta(m: EnrichedMember): string {
    const parts = [this.groupName(m.group_id)];
    if (m.phone) parts.push(m.phone);
    const d = new Date(m.joined_at);
    parts.push(`${d.getDate()} ${MONTHS[d.getMonth()]}`);
    return parts.join(' · ');
  }

  dotColor(color: string): string {
    return ({ green: 'var(--green)', blue: 'var(--blue)', amber: 'var(--amber)', red: 'var(--red)' } as Record<string, string>)[color] ?? 'var(--t3)';
  }

  goToGroup(id: string) { this.router.navigate(['/console/groups', id]); }
  openAuction()         { this.router.navigate(['/console/auction']); }
  openApprovals(groupId?: string) {
    const id = groupId ?? this.store.pendingApprovals()[0]?.group_id;
    if (id) this.router.navigate(['/console/groups', id, 'members']);
  }

  approve(id: string) { this.store.approveMember(id); }
  reject(id: string)  { this.store.rejectMember(id, 'declined'); }
}
