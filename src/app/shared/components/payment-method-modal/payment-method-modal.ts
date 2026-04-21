import { Component, effect, input, output, signal } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import type { EnrichedContribution } from '@core/mock/seed.data';

export interface PaymentData {
  amount: number;
  method: 'cash' | 'upi' | 'bank' | 'other';
  reference: string;
  date: string;
  notes: string;
}

type PayMethod = PaymentData['method'];

const METHODS: { id: PayMethod; key: string }[] = [
  { id: 'cash',  key: 'shared.cashMethod' },
  { id: 'upi',   key: 'shared.upiMethod' },
  { id: 'bank',  key: 'shared.bankMethod' },
  { id: 'other', key: 'shared.otherMethod' },
];

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

@Component({
  selector: 'app-payment-method-modal',
  standalone: true,
  imports: [TranslocoDirective],
  styles: [`
    :host { display: block; }
    .overlay { min-height: 500px; background: rgba(0,0,0,0.45);
               display: flex; align-items: center; justify-content: center;
               padding: 16px; }
    .modal-card { width: min(340px, 94vw); background: var(--card);
                  border-radius: var(--r); border: 0.5px solid var(--b2);
                  overflow: hidden; }
    .mc-header { padding: 16px; border-bottom: 0.5px solid var(--b2);
                 display: flex; align-items: center; gap: 10px; }
    .mc-name { font-size: 14px; font-weight: 500; color: var(--t1); }
    .mc-due { margin-left: auto; font-size: 11px; font-weight: 500;
              color: var(--green); background: var(--gbg);
              border: 0.5px solid var(--gborder); border-radius: 100px;
              padding: 3px 9px; white-space: nowrap; }
    .mc-body { padding: 16px; display: flex; flex-direction: column; gap: 12px; }
    .field-label { font-size: 11px; color: var(--t3); margin-bottom: 4px; }
    .field-input { width: 100%; padding: 9px 12px; border-radius: var(--rs);
                   border: 0.5px solid var(--b2); background: var(--warm);
                   font-size: 14px; color: var(--t1); font-family: 'DM Sans', sans-serif;
                   box-sizing: border-box; outline: none; }
    .field-input:focus { border-color: var(--green); }
    .pills { display: flex; flex-wrap: wrap; gap: 6px; }
    .pill { padding: 6px 14px; border-radius: 100px; font-size: 12px;
            font-weight: 500; cursor: pointer; border: 0.5px solid var(--b2);
            background: var(--warm); color: var(--t2); }
    .pill.active { background: var(--gbg); color: var(--green); border-color: var(--gborder); }
    .error-msg { font-size: 11px; color: var(--red); }
    textarea.field-input { resize: none; }
    .mc-footer { padding: 12px 16px; border-top: 0.5px solid var(--b2);
                 display: flex; gap: 8px; }
    .btn-cancel { flex: 1; padding: 10px; border-radius: var(--rs);
                  border: 0.5px solid var(--b2); background: var(--warm);
                  color: var(--t2); font-size: 13px; font-weight: 500;
                  cursor: pointer; font-family: 'DM Sans', sans-serif; }
    .btn-confirm { flex: 2; padding: 10px; border-radius: var(--rs);
                   border: none; background: var(--green); color: #fff;
                   font-size: 13px; font-weight: 500;
                   cursor: pointer; font-family: 'DM Sans', sans-serif; }
  `],
  template: `
    <ng-container *transloco="let t">
    @if (visible()) {
      <div class="overlay">
        <div class="modal-card">
          <div class="mc-header">
            <div [class]="'av av-md av-' + contribution().profile.avatar_color">
              {{ contribution().profile.initials }}
            </div>
            <div class="mc-name">{{ contribution().profile.name }}</div>
            <div class="mc-due">{{ t('shared.due', { amount: fmt(contribution().amount_due) }) }}</div>
          </div>

          <div class="mc-body">
            <div>
              <div class="field-label">{{ t('shared.amount') }}</div>
              <input class="field-input" type="number" min="1"
                     [value]="amount()"
                     (input)="amount.set(+$any($event.target).value)" />
            </div>

            <div>
              <div class="field-label">{{ t('shared.paymentMethod') }}</div>
              <div class="pills">
                @for (m of methods; track m.id) {
                  <div class="pill" [class.active]="method() === m.id"
                       (click)="method.set(m.id)">{{ t(m.key) }}</div>
                }
              </div>
            </div>

            <div>
              <div class="field-label">{{ t('shared.upiRef') }}</div>
              <input class="field-input" type="text" [placeholder]="t('shared.upiRefPlaceholder')"
                     [value]="reference()"
                     (input)="reference.set($any($event.target).value)" />
            </div>

            <div>
              <div class="field-label">{{ t('shared.date') }}</div>
              <input class="field-input" type="date"
                     [value]="date()"
                     (input)="date.set($any($event.target).value)" />
            </div>

            <div>
              <div class="field-label">{{ t('shared.notes') }}</div>
              <textarea class="field-input" rows="3"
                        [value]="notes()"
                        (input)="notes.set($any($event.target).value)"></textarea>
            </div>

            @if (errorMax()) {
              <div class="error-msg">{{ t('shared.amountError', { max: errorMax() }) }}</div>
            }
          </div>

          <div class="mc-footer">
            <button class="btn-cancel" type="button" (click)="cancel()">{{ t('shared.cancel') }}</button>
            <button class="btn-confirm" type="button" (click)="confirm()">{{ t('shared.markPaid') }}</button>
          </div>
        </div>
      </div>
    }
    </ng-container>
  `,
})
export class PaymentMethodModalComponent {
  contribution = input.required<EnrichedContribution>();
  visible      = input<boolean>(false);
  confirmed    = output<PaymentData>();
  cancelled    = output<void>();

  amount    = signal(0);
  method    = signal<PayMethod>('cash');
  reference = signal('');
  date      = signal(todayISO());
  notes     = signal('');
  error     = signal('');
  errorMax  = signal('');

  methods = METHODS;

  constructor() {
    effect(() => {
      const due = this.contribution().amount_due;
      if (this.visible()) this.amount.set(due);
    });
  }

  fmt(n: number): string {
    return new Intl.NumberFormat('en-IN').format(n);
  }

  confirm(): void {
    const a = this.amount();
    if (a <= 0 || a > this.contribution().amount_due) {
      this.errorMax.set(this.fmt(this.contribution().amount_due));
      return;
    }
    this.errorMax.set('');
    this.confirmed.emit({
      amount: a,
      method: this.method(),
      reference: this.reference(),
      date: this.date(),
      notes: this.notes(),
    });
    this.reset();
  }

  cancel(): void {
    this.cancelled.emit();
    this.reset();
  }

  private reset(): void {
    this.amount.set(0);
    this.method.set('cash');
    this.reference.set('');
    this.date.set(todayISO());
    this.notes.set('');
    this.error.set('');
    this.errorMax.set('');
  }
}
