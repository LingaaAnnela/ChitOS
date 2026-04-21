import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';
import { AuthStore } from '@core/stores/auth.store';
import { UIStore } from '@core/stores/ui.store';
import { ConsoleStore } from './console.store';

@Component({
  selector: 'app-console-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, TranslocoDirective],
  styles: [`
    :host { display: flex; height: 100vh; overflow: hidden; background: var(--bg); }
    .layout { display: flex; width: 100%; height: 100%; overflow: hidden; }

    /* ── Sidebar ─────────────────────────────────────────── */
    .sidebar {
      width: 220px; min-width: 220px; height: 100%; background: var(--card);
      border-right: 0.5px solid var(--b); display: flex; flex-direction: column;
      overflow-y: auto; z-index: 200;
      transition: transform 0.25s ease;
    }
    .sb-logo { padding: 18px 16px; border-bottom: 0.5px solid var(--b);
               display: flex; align-items: center; gap: 9px; }
    .logo-mark { width: 28px; height: 28px; border-radius: 7px; background: var(--green);
                 display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .logo-dot { width: 10px; height: 10px; border-radius: 50%; background: #fff; }
    .logo-text { font-family: var(--font-serif); font-size: 17px; font-weight: 300; color: var(--t1); }
    .sb-org { padding: 12px 14px; border-bottom: 0.5px solid var(--b); }
    .sb-org-name { font-size: 13px; font-weight: 500; color: var(--t1); }
    .sb-org-plan { font-size: 10px; color: var(--t3); margin-top: 2px;
                   font-family: var(--font-mono); }
    .plan-bar { height: 3px; background: var(--b2); border-radius: 2px;
                margin-top: 6px; overflow: hidden; }
    .plan-fill { height: 100%; background: var(--green); border-radius: 2px; }
    .sb-nav { padding: 8px; flex: 1; }
    .sb-sec { font-size: 10px; color: var(--t3); font-weight: 500; letter-spacing: 0.6px;
              padding: 10px 8px 4px; text-transform: uppercase; font-family: var(--font-mono); }
    .sb-item {
      display: flex; align-items: center; gap: 9px; padding: 8px 10px;
      border-radius: var(--rs); cursor: pointer; text-decoration: none;
    }
    .sb-item:hover { background: var(--warm); }
    .sb-item.active { background: var(--gbg); }
    .sb-item.active .si-icon { stroke: var(--green); }
    .sb-item.active .si-lbl { color: var(--green); font-weight: 500; }
    .si-icon { width: 15px; height: 15px; stroke: var(--t3); fill: none;
               stroke-width: 1.5; stroke-linecap: round; stroke-linejoin: round; flex-shrink: 0; }
    .si-lbl { font-size: 13px; color: var(--t2);
              white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .si-badge { margin-left: auto; font-size: 10px; font-weight: 500;
                padding: 2px 7px; border-radius: 100px; flex-shrink: 0; }
    .si-badge-r { background: var(--rbg); color: var(--red); border: 0.5px solid var(--rborder); }
    .si-badge-b { background: var(--bbg); color: var(--blue); border: 0.5px solid var(--bborder); }
    .sb-bottom { padding: 12px 14px; border-top: 0.5px solid var(--b); }
    .sb-user { display: flex; align-items: center; gap: 9px; }
    .sb-av { width: 30px; height: 30px; border-radius: 50%; background: var(--gbg);
             display: flex; align-items: center; justify-content: center; font-size: 10px;
             font-weight: 500; color: var(--green); flex-shrink: 0;
             border: 0.5px solid var(--gborder); }
    .sb-uname { font-size: 12px; font-weight: 500; color: var(--t1); }
    .sb-uemail { font-size: 10px; color: var(--t3); }

    /* ── Main ────────────────────────────────────────────── */
    .main { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-width: 0; }
    .main-top { padding: 0 20px; height: 52px; min-height: 52px; background: var(--card);
                border-bottom: 0.5px solid var(--b2); display: flex; align-items: center;
                justify-content: space-between; gap: 12px; }
    .mt-left { display: flex; align-items: center; gap: 10px; }
    .hamburger { display: none; width: 32px; height: 32px; border: 0.5px solid var(--b2);
                 border-radius: var(--rs); align-items: center; justify-content: center;
                 cursor: pointer; background: none; flex-shrink: 0; }
    .mt-logo { font-family: var(--font-serif); font-size: 17px; font-weight: 300; color: var(--t1); }
    .mt-logo em { font-style: normal; color: var(--green); }
    .mt-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
    .notif-btn { position: relative; width: 32px; height: 32px; border: 0.5px solid var(--b2);
                 border-radius: var(--rs); display: flex; align-items: center;
                 justify-content: center; cursor: pointer; background: none; }
    .notif-dot { position: absolute; top: 5px; right: 5px; width: 7px; height: 7px;
                 border-radius: 50%; background: var(--red); border: 1.5px solid var(--card); }
    .main-content { flex: 1; overflow-y: auto; }

    /* ── Mobile overlay ──────────────────────────────────── */
    .sidebar-overlay { display: none; position: fixed; inset: 0;
                       background: rgba(0,0,0,0.35); z-index: 150; }

    @media (max-width: 768px) {
      .sidebar { position: fixed; left: 0; top: 0; height: 100%;
                 transform: translateX(-100%); }
      .sidebar.open { transform: translateX(0); }
      .sidebar-overlay.open { display: block; }
      .hamburger { display: flex; }
      .main-top { padding: 0 14px; height: 48px; min-height: 48px; }
    }
    @media (min-width: 769px) {
      .hamburger { display: none; }
    }
  `],
  template: `
    <ng-container *transloco="let t">
    <div class="sidebar-overlay" [class.open]="sidebarOpen()"
         (click)="uiStore.closeSidebar()"></div>

    <div class="layout">
      <aside class="sidebar" [class.open]="sidebarOpen()">
        <div class="sb-logo">
          <div class="logo-mark"><div class="logo-dot"></div></div>
          <div class="logo-text">Chit·OS</div>
        </div>

        <div class="sb-org">
          <div class="sb-org-name">{{ orgName() }}</div>
          <div class="sb-org-plan">{{ t('nav.orgPlan', { used: usedGrps(), max: maxGrps() }) }}</div>
          <div class="plan-bar">
            <div class="plan-fill" [style.width.%]="planPct()"></div>
          </div>
        </div>

        <nav class="sb-nav">
          <div class="sb-sec">{{ t('nav.overview') }}</div>

          <a class="sb-item" routerLink="/console/dashboard" routerLinkActive="active"
             (click)="uiStore.closeSidebar()">
            <svg class="si-icon" viewBox="0 0 24 24">
              <rect x="3" y="3" width="7" height="7"/>
              <rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/>
            </svg>
            <span class="si-lbl">{{ t('nav.dashboard') }}</span>
          </a>

          <a class="sb-item" [routerLink]="approvalsLink()" routerLinkActive="active"
             (click)="uiStore.closeSidebar()">
            <svg class="si-icon" viewBox="0 0 24 24">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            <span class="si-lbl">{{ t('nav.approvals') }}</span>
            @if (pendingCount() > 0) {
              <span class="si-badge si-badge-r">{{ pendingCount() }}</span>
            }
          </a>

          <div class="sb-sec">{{ t('nav.groups') }}</div>

          @for (group of groups(); track group.id) {
            <a class="sb-item" [routerLink]="['/console/groups', group.id]"
               routerLinkActive="active" (click)="uiStore.closeSidebar()">
              <svg class="si-icon" viewBox="0 0 24 24">
                @if (group.status === 'completed') {
                  <polyline points="20 6 9 17 4 12"/>
                } @else {
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/>
                }
              </svg>
              <span class="si-lbl">{{ group.name }}</span>
            </a>
          }

          <div class="sb-sec">{{ t('nav.tools') }}</div>

          <a class="sb-item" routerLink="/console/auction" routerLinkActive="active"
             (click)="uiStore.closeSidebar()">
            <svg class="si-icon" viewBox="0 0 24 24">
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
              <polyline points="16 7 22 7 22 13"/>
            </svg>
            <span class="si-lbl">{{ t('nav.auctionRoom') }}</span>
            <span class="si-badge si-badge-b">{{ t('nav.live') }}</span>
          </a>

          <a class="sb-item" routerLink="/console/import" routerLinkActive="active"
             (click)="uiStore.closeSidebar()">
            <svg class="si-icon" viewBox="0 0 24 24">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            <span class="si-lbl">{{ t('nav.importChit') }}</span>
          </a>

          <a class="sb-item" routerLink="/console/settings" routerLinkActive="active"
             (click)="uiStore.closeSidebar()">
            <svg class="si-icon" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"/>
            </svg>
            <span class="si-lbl">{{ t('nav.settings') }}</span>
          </a>
        </nav>

        <div class="sb-bottom">
          <div class="sb-user">
            <div class="sb-av">{{ profile()?.initials ?? '?' }}</div>
            <div>
              <div class="sb-uname">{{ profile()?.name ?? '—' }}</div>
              <div class="sb-uemail">{{ profile()?.email ?? '' }}</div>
            </div>
          </div>
        </div>
      </aside>

      <div class="main">
        <div class="main-top">
          <div class="mt-left">
            <button class="hamburger" type="button" (click)="uiStore.toggleSidebar()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                   stroke="var(--t2)" stroke-width="1.5" stroke-linecap="round">
                <line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
            <div class="mt-logo">Chit<em>OS</em></div>
          </div>
          <div class="mt-right">
            <button class="notif-btn" type="button">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                   stroke="var(--t2)" stroke-width="1.5" stroke-linecap="round">
                <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
              </svg>
              <div class="notif-dot"></div>
            </button>
            <div [class]="'av av-sm av-' + (profile()?.avatar_color ?? 'g')"
                 style="cursor:pointer;">{{ profile()?.initials ?? '?' }}</div>
          </div>
        </div>
        <div class="main-content">
          <router-outlet />
        </div>
      </div>
    </div>
    </ng-container>
  `,
})
export class ConsoleShell {
  protected uiStore    = inject(UIStore);
  private consoleStore = inject(ConsoleStore);
  private authStore    = inject(AuthStore);

  sidebarOpen  = this.uiStore.sidebarOpen;
  groups       = this.consoleStore.groups;
  pendingCount = computed(() => this.consoleStore.pendingApprovals().length);
  profile      = this.authStore.profile;
  tenant       = this.authStore.tenant;

  approvalsLink = computed(() => {
    const gm = this.consoleStore.pendingApprovals()[0];
    return gm?.group_id
      ? ['/console/groups', gm.group_id, 'members']
      : ['/console/dashboard'];
  });

  orgName  = computed(() => this.tenant()?.name ?? '—');
  usedGrps = computed(() => this.groups().length);
  maxGrps  = computed(() => this.tenant()?.max_groups ?? 3);
  planPct  = computed(() => Math.round((this.usedGrps() / this.maxGrps()) * 100));
}
