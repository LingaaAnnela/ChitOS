import { Component, input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  styles: [`
    :host { display: block; }
    .es { display: flex; flex-direction: column; align-items: center;
          justify-content: center; padding: 40px 24px; text-align: center; gap: 8px; }
    .es-icon { width: 44px; height: 44px; background: var(--warm2); border-radius: 50%;
               display: flex; align-items: center; justify-content: center; margin-bottom: 4px; }
    .es-title { font-size: 14px; font-weight: 500; color: var(--t1); }
    .es-sub   { font-size: 12px; color: var(--t3); line-height: 1.5; max-width: 220px; }
    .es-btn   { margin-top: 8px; padding: 8px 20px; border-radius: 100px;
                background: var(--green); color: #fff; font-size: 13px;
                font-weight: 500; border: none; cursor: pointer; }
  `],
  template: `
    <div class="es">
      <div class="es-icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
             stroke="var(--t3)" stroke-width="1.5" stroke-linecap="round">
          <path d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0H4"/>
        </svg>
      </div>
      <div class="es-title">{{ title() }}</div>
      <div class="es-sub">{{ subtitle() }}</div>
      @if (actionLabel()) {
        <button class="es-btn" (click)="handleAction()">{{ actionLabel() }}</button>
      }
    </div>
  `,
})
export class EmptyStateComponent {
  title = input.required<string>();
  subtitle = input.required<string>();
  actionLabel = input<string>('');
  actionFn = input<() => void>();

  handleAction() {
    this.actionFn()?.();
  }
}
