import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthStore } from '@core/stores/auth.store';
import { MemberStore } from '../member.store';
import type { Group } from '@core/mock/seed.data';

@Component({
  selector: 'app-member-home',
  standalone: true,
  imports: [],
  styles: [`
    :host {
      display: flex; flex-direction: column; gap: 12px;
      padding: 14px 14px 24px;
    }
    @media (min-width: 768px) {
      :host { max-width: 640px; margin: 0 auto; padding: 20px 20px 28px; width: 100%; }
    }

    .greet-lbl { font-size: 11px; color: var(--t3); }
    .greet-name { font-family: var(--font-serif); font-size: 20px; font-weight: 300;
                  color: var(--t1); letter-spacing: -0.3px; }
    .greet-name em { font-style: italic; color: var(--green); }

    .pot-card { background: var(--saffron); border-radius: var(--rs); padding: 14px 16px;
                position: relative; overflow: hidden; }
    .pot-card::after { content: ''; position: absolute; top: -18px; right: -18px;
                       width: 80px; height: 80px; border-radius: 50%;
                       background: rgba(255,255,255,0.12); pointer-events: none; }
    .pot-lbl { font-size: 9px; color: rgba(255,255,255,0.7); font-weight: 500;
               text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;
               font-family: var(--font-mono); }
    .pot-val { font-family: var(--font-serif); font-size: 28px; font-weight: 300;
               color: #fff; letter-spacing: -0.5px; }
    .pot-sub { font-size: 10px; color: rgba(255,255,255,0.65); margin-top: 2px; }
    .pot-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-top: 10px; }
    .ps { background: rgba(255,255,255,0.15); border-radius: var(--rs); padding: 8px; text-align: center; }
    .ps-v { font-family: var(--font-serif); font-size: 20px; font-weight: 300; color: #fff; }
    .ps-l { font-size: 9px; color: rgba(255,255,255,0.65); margin-top: 1px; }

    .sec-hdr { display: flex; justify-content: space-between; align-items: center; }
    .sec-title { font-size: 13px; font-weight: 500; color: var(--t1); }

    .grp-card { background: var(--card); border: 0.5px solid var(--b); border-radius: var(--r);
                padding: 12px; cursor: pointer; transition: opacity 0.15s; }
    .grp-card:active { opacity: 0.75; }
    .grp-card.is-completed { opacity: 0.65; }
    .gc-top { display: flex; align-items: flex-start; gap: 8px; margin-bottom: 8px; }
    .gc-ind { width: 3px; height: 34px; border-radius: 2px; flex-shrink: 0; margin-top: 1px; }
    .gc-info { flex: 1; min-width: 0; }
    .gc-name { font-size: 13px; font-weight: 500; color: var(--t1); }
    .gc-meta { font-size: 11px; color: var(--t3); margin-top: 1px; }
    .gc-amounts { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr));
                  gap: 6px; margin: 8px 0; }
    .ga { background: var(--warm2); border-radius: var(--rs); padding: 7px 8px; }
    .ga-l { font-size: 9px; color: var(--t3); text-transform: uppercase; letter-spacing: 0.3px;
            font-family: var(--font-mono); }
    .ga-v { font-size: 12px; font-weight: 500; color: var(--t1); margin-top: 2px; }
    .prog { height: 3px; background: var(--b2); border-radius: 2px; overflow: hidden; margin: 8px 0 4px; }
    .pf { height: 100%; border-radius: 2px; }
    .pf-g { background: var(--green); }
    .pf-a { background: var(--amber); }
    .pf-grey { background: #B4B2A9; }
    .gc-bottom { display: flex; align-items: center; justify-content: space-between; margin-top: 4px; }
    .gc-link { font-size: 11px; color: var(--blue); }
    .gc-foot-lbl { font-size: 10px; }

    .event-row { display: flex; align-items: center; gap: 10px; padding: 10px 0;
                 border-bottom: 0.5px solid var(--b); }
    .event-row:last-child { border-bottom: none; }
    .event-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
    .event-dot-g { background: var(--green); }
    .event-dot-b { background: var(--blue); }
    .event-info { flex: 1; min-width: 0; }
    .event-lbl { font-size: 12px; font-weight: 500; color: var(--t1); }
    .event-grp { font-size: 10px; color: var(--t3); margin-top: 1px; }
    .event-date { font-size: 11px; color: var(--t2); font-family: var(--font-mono); flex-shrink: 0; }
    .empty-evt { padding: 16px; text-align: center; font-size: 12px; color: var(--t3); }
  `],
  template: `
    <div>
      <div class="greet-lbl">{{ greeting() }}</div>
      <div class="greet-name">{{ firstName() }} <em>{{ lastName() }}</em></div>
    </div>

    <div class="pot-card">
      <div class="pot-lbl">Total pot value</div>
      <div class="pot-val">{{ fmt(totalPotValue()) }}</div>
      <div class="pot-sub">Across {{ activeGroups().length }} active groups</div>
      <div class="pot-stats">
        <div class="ps">
          <div class="ps-v">{{ activeCount() }}</div>
          <div class="ps-l">Active</div>
        </div>
        <div class="ps">
          <div class="ps-v">{{ totalMembers() }}</div>
          <div class="ps-l">Members</div>
        </div>
      </div>
    </div>

    <div class="sec-hdr">
      <div class="sec-title">Your groups</div>
    </div>

    @for (g of groups(); track g.id) {
      <div [class]="'grp-card' + (g.status === 'completed' ? ' is-completed' : '')"
           (click)="navigateToGroup(g.id)">
        <div class="gc-top">
          <div class="gc-ind" [style.background]="indicatorColor(g.status)"></div>
          <div class="gc-info">
            <div class="gc-name">{{ g.name }}</div>
            <div class="gc-meta">{{ groupMeta(g) }}</div>
          </div>
          <span [class]="'badge ' + strategyBadgeClass(g)">{{ strategyLabel(g) }}</span>
        </div>

        @if (g.status === 'active') {
          <div class="gc-amounts">
            <div class="ga">
              <div class="ga-l">Pot</div>
              <div class="ga-v">{{ fmtShort(g.contribution_amount * g.member_count) }}</div>
            </div>
            <div class="ga">
              <div class="ga-l">/{{ g.frequency === 'monthly' ? 'month' : g.frequency }}</div>
              <div class="ga-v">{{ fmtShort(g.contribution_amount) }}</div>
            </div>
            <div class="ga">
              <div class="ga-l">Members</div>
              <div class="ga-v">{{ g.member_count }}/{{ g.max_members }}</div>
            </div>
          </div>
        }

        <div class="prog">
          <div [class]="'pf ' + progressClass(g.status)" [style.width.%]="progressPct(g)"></div>
        </div>
        <div style="display:flex;justify-content:space-between;">
          <div style="font-size:10px;color:var(--t3);">{{ progressPct(g) }}% complete</div>
          @if (g.status === 'active') {
            <div style="font-size:10px;color:var(--t3);">{{ g.total_cycles - g.current_cycle }} months left</div>
          }
        </div>

        <div class="gc-bottom">
          @if (g.status === 'inviting') {
            <div class="gc-foot-lbl" style="color:var(--amber);">
              Starting {{ fmtDate(g.start_date) }}
            </div>
          } @else if (g.status === 'completed') {
            <div class="gc-foot-lbl" style="color:var(--t3);">All cycles complete</div>
          } @else {
            <div class="gc-foot-lbl" style="color:var(--t3);">
              Cycle {{ g.current_cycle }} of {{ g.total_cycles }}
            </div>
          }
          <div class="gc-link">View →</div>
        </div>
      </div>
    }

    <div class="sec-hdr" style="margin-top:2px;">
      <div class="sec-title">Upcoming</div>
    </div>

    <div class="card card-p">
      @if (upcomingEvents().length === 0) {
        <div class="empty-evt">Nothing coming up — all clear!</div>
      } @else {
        @for (e of upcomingEvents(); track $index) {
          <div class="event-row">
            <div [class]="'event-dot ' + (e.type === 'auction' ? 'event-dot-b' : 'event-dot-g')"></div>
            <div class="event-info">
              <div class="event-lbl">{{ e.label }}</div>
              <div class="event-grp">{{ e.group }}</div>
            </div>
            <div class="event-date">{{ e.date }}</div>
          </div>
        }
      }
    </div>
  `,
})
export class MemberHomePage {
  private store  = inject(MemberStore);
  private auth   = inject(AuthStore);
  private router = inject(Router);

  groups  = this.store.myGroups;
  profile = this.auth.profile;

  greeting = computed(() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning,';
    if (h < 17) return 'Good afternoon,';
    return 'Good evening,';
  });

  firstName = computed(() => {
    const parts = (this.profile()?.name ?? '').split(' ');
    return parts.length > 1 ? parts.slice(0, -1).join(' ') : parts[0] ?? '';
  });

  lastName = computed(() => {
    const parts = (this.profile()?.name ?? '').split(' ');
    return parts.length > 1 ? parts[parts.length - 1] : '';
  });

  activeGroups = computed(() => this.groups().filter(g => g.status !== 'completed'));
  activeCount  = computed(() => this.groups().filter(g => g.status === 'active').length);
  totalMembers = computed(() =>
    this.activeGroups().reduce((sum, g) => sum + g.member_count, 0)
  );
  totalPotValue = computed(() =>
    this.activeGroups().reduce((sum, g) => sum + g.contribution_amount * g.member_count, 0)
  );

  upcomingEvents = computed(() => {
    const events: Array<{ type: string; label: string; group: string; date: string }> = [];
    const now = new Date();
    for (const g of this.groups()) {
      if (g.status !== 'active') continue;
      const dueDate = new Date(now.getFullYear(), now.getMonth(), g.due_day);
      if (dueDate <= now) dueDate.setMonth(dueDate.getMonth() + 1);
      events.push({
        type: 'contribution',
        label: `${this.fmt(g.contribution_amount)} contribution due`,
        group: g.name,
        date: dueDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
      });
      if (g.strategy === 'auction') {
        events.push({ type: 'auction', label: 'Auction open', group: g.name, date: 'Now' });
      }
    }
    return events;
  });

  navigateToGroup(id: string): void { this.router.navigate(['/app/groups', id]); }

  groupMeta(g: Group): string {
    if (g.status === 'active')
      return `Month ${g.current_cycle} of ${g.total_cycles} · Due ${g.due_day} ${this.currentMonthLabel()}`;
    if (g.status === 'inviting')
      return `Starts ${this.fmtDate(g.start_date)} · ${g.member_count}/${g.max_members} members`;
    return `Completed · ${g.total_cycles} cycles`;
  }

  strategyLabel(g: Group): string {
    if (g.status === 'completed') return 'Done';
    const map: Record<string, string> = { auction: 'Auction', lottery: 'Lottery', fixed: 'Fixed', consensus: 'Consensus' };
    return map[g.strategy] ?? g.strategy;
  }

  strategyBadgeClass(g: Group): string {
    if (g.status === 'completed') return 'badge-grey';
    const map: Record<string, string> = { auction: 'badge-b', lottery: 'badge-g', fixed: 'badge-grey', consensus: 'badge-a' };
    return map[g.strategy] ?? 'badge-grey';
  }

  indicatorColor(status: string): string {
    if (status === 'active')   return 'var(--green)';
    if (status === 'inviting') return 'var(--amber)';
    return '#B4B2A9';
  }

  progressPct(g: Group): number {
    if (!g.total_cycles) return 0;
    return Math.round((g.current_cycle / g.total_cycles) * 100);
  }

  progressClass(status: string): string {
    if (status === 'active')   return 'pf-g';
    if (status === 'inviting') return 'pf-a';
    return 'pf-grey';
  }

  fmt(n: number): string { return '₹' + n.toLocaleString('en-IN'); }

  fmtShort(n: number): string {
    if (n >= 100000) return '₹' + (n / 100000).toFixed(n % 100000 === 0 ? 0 : 1) + 'L';
    if (n >= 1000)   return '₹' + (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1) + 'K';
    return '₹' + n;
  }

  fmtDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  private currentMonthLabel(): string {
    return new Date().toLocaleDateString('en-IN', { month: 'short' });
  }
}
