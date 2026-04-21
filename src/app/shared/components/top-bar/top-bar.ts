import { Component, computed, inject, input, output } from '@angular/core';
import { AuthStore } from '@core/stores/auth.store';
import { MemberStore } from '@features/member-app/member.store';

@Component({
  selector: 'app-top-bar',
  standalone: true,
  styles: [`
    :host { display: block; }
    .top-bar { background: var(--card); border-bottom: 0.5px solid var(--b2);
               padding: 12px 14px; display: flex; align-items: center;
               justify-content: space-between; position: sticky; top: 0; z-index: 10; }
    .tb-logo { font-family: var(--font-serif); font-size: 17px; font-weight: 300; color: var(--t1); }
    .tb-logo em { font-style: normal; color: var(--green); }
    .tb-back { display: flex; align-items: center; gap: 6px; cursor: pointer; }
    .tb-title { font-size: 14px; font-weight: 500; color: var(--t1); }
    .tb-right { display: flex; align-items: center; gap: 8px; }
    .tb-notif { width: 30px; height: 30px; border-radius: var(--rs); border: 0.5px solid var(--b2);
                display: flex; align-items: center; justify-content: center;
                position: relative; background: var(--warm); cursor: pointer; }
    .tb-dot { position: absolute; top: 5px; right: 5px; width: 6px; height: 6px;
              border-radius: 50%; background: var(--red); border: 1.5px solid var(--card); }
  `],
  template: `
    <div class="top-bar">
      @if (showBack()) {
        <div class="tb-back" (click)="backClicked.emit()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
               stroke="var(--t1)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          <div class="tb-title">{{ title() }}</div>
        </div>
      } @else {
        <div class="tb-logo">Chit<em>OS</em></div>
      }
      <div class="tb-right">
        @if (showNotif()) {
          <div class="tb-notif" (click)="notifClicked.emit()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                 stroke="var(--t2)" stroke-width="1.5" stroke-linecap="round">
              <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
            </svg>
            @if (unreadCount() > 0) { <div class="tb-dot"></div> }
          </div>
        }
        @if (showAvatar()) {
          <div [class]="'av av-sm av-' + avatarColor()" style="cursor:pointer;"
               (click)="avatarClicked.emit()">{{ avatarInitials() }}</div>
        }
      </div>
    </div>
  `,
})
export class TopBarComponent {
  title = input<string>('');
  showBack = input<boolean>(false);
  showNotif = input<boolean>(false);
  showAvatar = input<boolean>(false);

  backClicked = output<void>();
  notifClicked = output<void>();
  avatarClicked = output<void>();

  private memberStore = inject(MemberStore);
  private authStore = inject(AuthStore);

  unreadCount = this.memberStore.unreadCount;
  avatarInitials = computed(() => this.authStore.profile()?.initials ?? '?');
  avatarColor = computed(() => this.authStore.profile()?.avatar_color ?? 'g');
}
