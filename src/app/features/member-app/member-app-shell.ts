import { Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { TopBarComponent, BottomNavComponent } from '@shared/components';
import { filter } from 'rxjs/operators';

type TabId = 'home' | 'groups' | 'auction' | 'approvals' | 'profile';

const TAB_ROUTES: Record<TabId, string> = {
  home:      '/app/home',
  groups:    '/app/home',
  auction:   '/app/auction',
  approvals: '/app/notifications',
  profile:   '/app/profile',
};

function urlToTab(url: string): TabId {
  if (url.includes('/auction'))       return 'auction';
  if (url.includes('/notifications')) return 'approvals';
  if (url.includes('/profile'))       return 'profile';
  if (url.includes('/groups'))        return 'groups';
  return 'home';
}

@Component({
  selector: 'app-member-shell',
  standalone: true,
  imports: [RouterOutlet, TopBarComponent, BottomNavComponent],
  styles: [`
    :host { display: flex; flex-direction: column; height: 100vh; background: var(--bg); }
    .member-content { flex: 1; overflow-y: auto; padding-bottom: 72px; }
  `],
  template: `
    <app-top-bar [showNotif]="true" [showAvatar]="true" />
    <div class="member-content">
      <router-outlet />
    </div>
    <app-bottom-nav [activeTab]="activeTab()" (tabChanged)="onTabChange($event)" />
  `,
})
export class MemberAppShell {
  private router = inject(Router);

  activeTab = signal<TabId>('home');

  constructor() {
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(e => {
        this.activeTab.set(urlToTab((e as NavigationEnd).urlAfterRedirects));
      });
  }

  onTabChange(tab: string): void {
    const id = tab as TabId;
    this.activeTab.set(id);
    this.router.navigateByUrl(TAB_ROUTES[id]);
  }
}
