import { Component, inject } from '@angular/core';
import { UIStore } from '@core/stores/ui.store';

@Component({
  selector: 'app-toast',
  standalone: true,
  styles: [`
    .toast-stack {
      position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
      display: flex; flex-direction: column; gap: 8px;
      z-index: 9999; pointer-events: none; align-items: center;
    }
    .toast {
      display: flex; align-items: center; gap: 8px;
      padding: 10px 18px; border-radius: 100px;
      font-size: 13px; font-weight: 500;
      pointer-events: all; white-space: nowrap;
      max-width: min(400px, 90vw); font-family: var(--font-sans);
      animation: toast-in 0.18s ease;
    }
    @keyframes toast-in {
      from { opacity: 0; transform: translateY(6px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .t-s { background: var(--green); color: #fff; }
    .t-e { background: var(--red);   color: #fff; }
    .t-w { background: var(--amber); color: #fff; }
    .t-i { background: var(--blue);  color: #fff; }
    .t-x {
      background: none; border: none;
      color: rgba(255,255,255,0.7); cursor: pointer;
      padding: 0; font-size: 16px; line-height: 1; margin-left: 4px;
    }
  `],
  template: `
    <div class="toast-stack">
      @for (t of toasts(); track t.id) {
        <div [class]="'toast t-' + t.type[0]">
          {{ t.message }}
          <button class="t-x" (click)="ui.dismissToast(t.id)">×</button>
        </div>
      }
    </div>
  `,
})
export class ToastComponent {
  protected ui = inject(UIStore);
  toasts = this.ui.toasts;
}
