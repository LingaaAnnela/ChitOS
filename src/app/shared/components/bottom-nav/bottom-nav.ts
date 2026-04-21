import { Component, input, output } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';

type TabId = 'home' | 'groups' | 'auction' | 'approvals' | 'profile';

interface NavTab {
  id: TabId;
  key: string;
  hasBadge: boolean;
}

const TABS: NavTab[] = [
  { id: 'home',      key: 'bottomNav.home',      hasBadge: false },
  { id: 'groups',    key: 'bottomNav.groups',    hasBadge: false },
  { id: 'auction',   key: 'bottomNav.auction',   hasBadge: true  },
  { id: 'approvals', key: 'bottomNav.approvals', hasBadge: true  },
  { id: 'profile',   key: 'bottomNav.profile',   hasBadge: false },
];

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [TranslocoDirective],
  styles: [`
    :host { display: contents; }
    .bn-tab { display: flex; flex-direction: column; align-items: center;
              gap: 2px; cursor: pointer; position: relative; padding: 4px 0; }
    .bn-icon { width: 20px; height: 20px; display: flex; align-items: center;
               justify-content: center; position: relative; }
    .bn-icon svg { width: 19px; height: 19px; stroke: var(--t3); fill: none;
                   stroke-width: 1.5; stroke-linecap: round; stroke-linejoin: round; }
    .bn-lbl { font-size: 9px; color: var(--t3); }
    .bn-tab.active .bn-lbl { color: var(--green); font-weight: 500; }
    .bn-tab.active .bn-icon svg { stroke: var(--green); }
    .bn-badge { position: absolute; top: -1px; right: -4px; width: 7px; height: 7px;
                border-radius: 50%; background: var(--red); border: 1.5px solid var(--card); }
  `],
  template: `
    <ng-container *transloco="let t">
    <nav class="bottom-nav">
      @for (tab of tabs; track tab.id) {
        <div class="bn-tab" [class.active]="activeTab() === tab.id"
             (click)="tabChanged.emit(tab.id)">
          <div class="bn-icon">
            @switch (tab.id) {
              @case ('home') {
                <svg viewBox="0 0 24 24">
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
              }
              @case ('groups') {
                <svg viewBox="0 0 24 24">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
                </svg>
              }
              @case ('auction') {
                <svg viewBox="0 0 24 24">
                  <line x1="12" y1="20" x2="12" y2="10"/>
                  <line x1="18" y1="20" x2="18" y2="4"/>
                  <line x1="6"  y1="20" x2="6"  y2="16"/>
                </svg>
              }
              @case ('approvals') {
                <svg viewBox="0 0 24 24">
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              }
              @case ('profile') {
                <svg viewBox="0 0 24 24">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              }
            }
            @if (tab.hasBadge) { <div class="bn-badge"></div> }
          </div>
          <div class="bn-lbl">{{ t(tab.key) }}</div>
        </div>
      }
    </nav>
    </ng-container>
  `,
})
export class BottomNavComponent {
  activeTab = input.required<TabId>();
  tabChanged = output<string>();
  tabs = TABS;
}
