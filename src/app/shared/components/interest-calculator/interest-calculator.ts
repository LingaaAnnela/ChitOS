import { Component, computed, inject, input } from '@angular/core';
import { IndianCurrencyPipe } from '@shared/pipes';
import { InterestService } from '@core/services/interest.service';

@Component({
  selector: 'app-interest-calculator',
  standalone: true,
  imports: [IndianCurrencyPipe],
  styles: [`
    .pos-rows { display: flex; flex-direction: column; gap: 8px; padding: 12px 16px; }
    .pos-row {
      display: flex; justify-content: space-between; align-items: center;
      background: var(--warm2); border-radius: var(--rs); padding: 10px; gap: 8px;
    }
    .pos-label { font-size: 12px; font-weight: 500; color: var(--t1); }
    .pos-sub   { font-size: 11px; color: var(--t2); margin-top: 2px; }
    .pos-amt   { font-family: 'JetBrains Mono', monospace; font-size: 16px; font-weight: 500; }
    .pos-amt.r { color: var(--red); }
    .pos-amt.g { color: var(--green); }

    .summary { display: flex; flex-direction: column; padding: 0 16px 4px;
      border-top: 0.5px solid var(--b); }
    .sum-row {
      display: flex; justify-content: space-between; align-items: center;
      padding: 9px 0; border-bottom: 0.5px solid var(--b);
    }
    .sum-row:last-child { border-bottom: none; }
    .sum-label { font-size: 11px; color: var(--t2); }
    .sum-val   { font-family: 'JetBrains Mono', monospace; font-size: 13px; font-weight: 500; color: var(--t1); }
    .sum-val.r { color: var(--red); }
    .sum-val.g { color: var(--green); }
  `],
  template: `
    <div class="pos-rows">
      @for (row of positionRows(); track row.label) {
        <div class="pos-row">
          <div>
            <div class="pos-label">{{ row.label }}</div>
            <div class="pos-sub">{{ row.subtitle }}</div>
          </div>
          <div class="pos-amt" [class.r]="row.color === 'r'" [class.g]="row.color === 'g'">
            {{ row.amount | indianCurrency }}
          </div>
        </div>
      }
    </div>
    <div class="summary">
      <div class="sum-row">
        <span class="sum-label">Monthly installment</span>
        <span class="sum-val">{{ principal() | indianCurrency }}</span>
      </div>
      <div class="sum-row">
        <span class="sum-label">Total interest paid (early taker)</span>
        <span class="sum-val r">{{ totalInterestPaid() | indianCurrency }}</span>
      </div>
      <div class="sum-row">
        <span class="sum-label">Effective annual yield</span>
        <span class="sum-val g">{{ effectiveYieldStr() }}</span>
      </div>
    </div>
  `,
})
export class InterestCalculatorComponent {
  principal      = input.required<number>();
  annualRate     = input.required<number>();
  durationMonths = input.required<number>();

  private svc = inject(InterestService);

  private earlyContrib = computed(() =>
    this.svc.calculateAdjustedContribution(1, this.durationMonths(), this.principal())
  );

  private midPos = computed(() => Math.ceil(this.durationMonths() / 2));

  private lateContrib = computed(() =>
    this.svc.calculateDiscount(this.durationMonths(), this.durationMonths(), this.principal())
  );

  positionRows = computed(() => [
    {
      label: 'Early taker',
      subtitle: `Position 1 · pays premium`,
      amount: this.earlyContrib(),
      color: 'r',
    },
    {
      label: 'Base contribution',
      subtitle: `Position ${this.midPos()} · no change`,
      amount: this.principal(),
      color: '',
    },
    {
      label: 'Patient waiter',
      subtitle: `Position ${this.durationMonths()} · earns discount`,
      amount: this.lateContrib(),
      color: 'g',
    },
  ]);

  totalInterestPaid = computed(() =>
    Math.max(0, (this.earlyContrib() - this.principal()) * this.durationMonths())
  );

  private effectiveYield = computed(() => {
    const savings  = (this.principal() - this.lateContrib()) * this.durationMonths();
    const totalPaid = this.lateContrib() * this.durationMonths();
    if (totalPaid === 0 || this.durationMonths() === 0) return this.annualRate();
    return (savings / totalPaid) * (12 / this.durationMonths()) * 100;
  });

  effectiveYieldStr = computed(() => `${this.effectiveYield().toFixed(2)}%`);
}
