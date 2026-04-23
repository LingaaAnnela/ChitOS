import { Component, input, output } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [TranslocoDirective],
  host: { '(document:keydown.escape)': 'cancelled.emit()' },
  styles: [`
    .overlay {
      position: fixed; inset: 0;
      background: rgba(0, 0, 0, 0.35);
      display: flex; align-items: center; justify-content: center;
      z-index: 1000; padding: 16px;
    }
    .dialog {
      background: var(--card); border: 0.5px solid var(--b2);
      border-radius: var(--r); padding: 24px;
      width: 100%; max-width: 420px;
    }
    .dlg-title {
      font-size: 15px; font-weight: 500; color: var(--t1); margin-bottom: 8px;
    }
    .dlg-msg {
      font-size: 13px; color: var(--t2); line-height: 1.6; margin-bottom: 24px;
    }
    .dlg-actions {
      display: flex; gap: 8px; justify-content: flex-end; flex-wrap: wrap;
    }
    .btn-cancel {
      padding: 8px 16px; border: 0.5px solid var(--b2);
      border-radius: var(--rs); background: none; cursor: pointer;
      font-size: 13px; color: var(--t2); font-family: var(--font-sans);
    }
    .btn-cancel:hover { background: var(--warm); }
    .btn-confirm {
      padding: 8px 16px; border: none; border-radius: var(--rs);
      cursor: pointer; font-size: 13px; font-weight: 500;
      font-family: var(--font-sans); color: #fff;
    }
    .btn-confirm.is-danger { background: var(--red); }
    .btn-confirm.is-safe   { background: var(--t1); }
    .btn-confirm:hover { opacity: 0.88; }
  `],
  template: `
    <ng-container *transloco="let t">
      <div class="overlay" (click)="onBackdrop($event)" role="presentation">
        <div class="dialog" role="alertdialog"
             [attr.aria-labelledby]="'cdlg-title'"
             [attr.aria-describedby]="'cdlg-msg'"
             [attr.aria-modal]="true">
          <div class="dlg-title" id="cdlg-title">{{ title() }}</div>
          <div class="dlg-msg" id="cdlg-msg">{{ message() }}</div>
          <div class="dlg-actions">
            <button class="btn-cancel" type="button" (click)="cancelled.emit()">
              {{ cancelLabel() || t('cancel') }}
            </button>
            <button class="btn-confirm"
                    [class.is-danger]="danger()"
                    [class.is-safe]="!danger()"
                    type="button" (click)="confirmed.emit()">
              {{ confirmLabel() || t('confirm') }}
            </button>
          </div>
        </div>
      </div>
    </ng-container>
  `,
})
export class ConfirmDialog {
  title        = input.required<string>();
  message      = input.required<string>();
  confirmLabel = input<string>('');
  cancelLabel  = input<string>('');
  danger       = input<boolean>(false);

  confirmed = output<void>();
  cancelled = output<void>();

  onBackdrop(e: MouseEvent) {
    if (e.target === e.currentTarget) this.cancelled.emit();
  }
}
