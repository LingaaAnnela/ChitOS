import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MemberStore } from '../member.store';
import type { Notification } from '@core/mock/seed.data';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [],
  styles: [`
    :host { display: flex; flex-direction: column; gap: 10px; padding: 14px 14px 24px; }
    @media (min-width: 768px) {
      :host { max-width: 640px; margin: 0 auto; padding: 20px 20px 28px; width: 100%; }
    }

    .page-hdr { display: flex; align-items: center; justify-content: space-between; margin-bottom: 2px; }
    .page-title { font-family: var(--font-serif); font-size: 17px; font-weight: 300; color: var(--t1); }
    .mark-read { font-size: 11px; color: var(--blue); cursor: pointer; background: none;
                 border: none; font-family: var(--font-sans); padding: 0; }
    .mark-read:disabled { color: var(--t3); cursor: default; }

    .sec-lbl { font-size: 10px; color: var(--t3); font-weight: 500; letter-spacing: 0.5px;
               text-transform: uppercase; font-family: var(--font-mono); padding: 6px 0 2px; }

    .notif-row { display: flex; gap: 10px; padding: 11px 14px; border-bottom: 0.5px solid var(--b);
                 align-items: flex-start; cursor: pointer; transition: background 0.1s; }
    .notif-row:last-child { border-bottom: none; }
    .notif-row:active { opacity: 0.75; }
    .notif-row.is-unread { background: #FAFAF8; }

    .ni { width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center;
          justify-content: center; flex-shrink: 0; }
    .ni svg { width: 14px; height: 14px; fill: none; stroke-width: 1.5;
              stroke-linecap: round; stroke-linejoin: round; }
    .ni-g { background: var(--gbg); }   .ni-g svg { stroke: var(--green); }
    .ni-r { background: var(--rbg); }   .ni-r svg { stroke: var(--red); }
    .ni-b { background: var(--bbg); }   .ni-b svg { stroke: var(--blue); }
    .ni-a { background: var(--abg); }   .ni-a svg { stroke: var(--amber); }

    .notif-body { flex: 1; min-width: 0; }
    .notif-title { font-size: 12px; font-weight: 500; color: var(--t1); }
    .notif-msg { font-size: 11px; color: var(--t2); line-height: 1.4; margin-top: 2px;
                 display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
                 overflow: hidden; }
    .notif-time { font-size: 10px; color: var(--t3); margin-top: 3px; }

    .unread-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--blue);
                  flex-shrink: 0; margin-top: 5px; }

    .empty-state { text-align: center; padding: 40px 20px; display: flex; flex-direction: column;
                   align-items: center; gap: 10px; }
    .empty-icon { width: 44px; height: 44px; border-radius: 50%; background: var(--gbg);
                  border: 0.5px solid var(--gb); display: flex; align-items: center;
                  justify-content: center; }
    .empty-icon svg { width: 20px; height: 20px; stroke: var(--green); fill: none;
                      stroke-width: 1.5; stroke-linecap: round; }
    .empty-title { font-family: var(--font-serif); font-size: 16px; font-weight: 300; color: var(--t1); }
    .empty-sub { font-size: 12px; color: var(--t3); }
  `],
  template: `
    <div class="page-hdr">
      <div class="page-title">Notifications</div>
      <button class="mark-read" [disabled]="store.unreadCount() === 0"
              (click)="store.markAllRead()">Mark all read</button>
    </div>

    @if (store.notifications().length === 0) {
      <div class="empty-state">
        <div class="empty-icon">
          <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <div class="empty-title">You're all caught up</div>
        <div class="empty-sub">No notifications right now</div>
      </div>
    } @else {
      @if (todayNotifs().length > 0) {
        <div class="sec-lbl">Today</div>
        <div class="card">
          @for (n of todayNotifs(); track n.id) {
            <div [class]="'notif-row' + (n.read ? '' : ' is-unread')" (click)="navigate(n)">
              <div [class]="'ni ' + iconClass(n.type)">
                <svg viewBox="0 0 24 24" [innerHTML]="iconPath(n.type)"></svg>
              </div>
              <div class="notif-body">
                <div class="notif-title">{{ n.title }}</div>
                <div class="notif-msg">{{ n.message }}</div>
                <div class="notif-time">{{ relTime(n.created_at) }}{{ n.group_name ? ' · ' + n.group_name : '' }}</div>
              </div>
              @if (!n.read) { <div class="unread-dot"></div> }
            </div>
          }
        </div>
      }

      @if (earlierNotifs().length > 0) {
        <div class="sec-lbl">Earlier</div>
        <div class="card">
          @for (n of earlierNotifs(); track n.id) {
            <div [class]="'notif-row' + (n.read ? '' : ' is-unread')" (click)="navigate(n)">
              <div [class]="'ni ' + iconClass(n.type)">
                <svg viewBox="0 0 24 24" [innerHTML]="iconPath(n.type)"></svg>
              </div>
              <div class="notif-body">
                <div class="notif-title">{{ n.title }}</div>
                <div class="notif-msg">{{ n.message }}</div>
                <div class="notif-time">{{ relTime(n.created_at) }}{{ n.group_name ? ' · ' + n.group_name : '' }}</div>
              </div>
              @if (!n.read) { <div class="unread-dot"></div> }
            </div>
          }
        </div>
      }
    }
  `,
})
export class NotificationsPage {
  protected store = inject(MemberStore);
  private router  = inject(Router);

  private isToday(dateStr: string): boolean {
    const d = new Date(dateStr);
    const now = new Date();
    return d.getFullYear() === now.getFullYear() &&
           d.getMonth()    === now.getMonth()    &&
           d.getDate()     === now.getDate();
  }

  todayNotifs   = computed(() => this.store.notifications().filter(n =>  this.isToday(n.created_at)));
  earlierNotifs = computed(() => this.store.notifications().filter(n => !this.isToday(n.created_at)));

  navigate(n: Notification): void {
    if (n.group_id) this.router.navigate(['/app/groups', n.group_id]);
  }

  relTime(dateStr: string): string {
    const diffMs  = Date.now() - new Date(dateStr).getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 60)  return `${Math.max(1, diffMin)} min ago`;
    const diffHrs = Math.floor(diffMin / 60);
    if (diffHrs < 24)  return `${diffHrs} hr${diffHrs > 1 ? 's' : ''} ago`;
    const diffDays = Math.floor(diffHrs / 24);
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7)   return `${diffDays} days ago`;
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
  }

  iconClass(type: string): string {
    const map: Record<string, string> = {
      join_request:      'ni-a',
      overdue:           'ni-r',
      auction_open:      'ni-b',
      contribution_paid: 'ni-g',
      payout:            'ni-g',
      announcement:      'ni-a',
    };
    return map[type] ?? 'ni-a';
  }

  iconPath(type: string): string {
    const map: Record<string, string> = {
      join_request:
        `<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
         <circle cx="9" cy="7" r="4"/>
         <line x1="19" y1="8" x2="19" y2="14"/>
         <line x1="22" y1="11" x2="16" y2="11"/>`,
      overdue:
        `<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
         <line x1="12" y1="9" x2="12" y2="13"/>
         <line x1="12" y1="17" x2="12.01" y2="17"/>`,
      auction_open:
        `<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
         <polyline points="16 7 22 7 22 13"/>`,
      contribution_paid:
        `<polyline points="20 6 9 17 4 12"/>`,
      payout:
        `<circle cx="12" cy="8" r="6"/>
         <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>`,
      announcement:
        `<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>`,
    };
    return map[type] ?? `<circle cx="12" cy="12" r="4"/>`;
  }
}
