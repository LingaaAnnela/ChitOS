import { Component, computed, inject, input } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { TrustScoreService } from '@core/services/trust-score.service';

@Component({
  selector: 'app-trust-score-pill',
  standalone: true,
  imports: [TranslocoDirective],
  template: `
    <ng-container *transloco="let t">
      @if (isNew()) {
        <span class="badge badge-grey">{{ t('shared.newTrust') }}</span>
      } @else {
        <span [class]="'badge ' + badgeClass()">{{ scoreText() }}</span>
      }
    </ng-container>
  `,
})
export class TrustScorePillComponent {
  memberId = input.required<string>();
  groupId = input.required<string>();

  private ts = inject(TrustScoreService);
  private result = computed(() => this.ts.calculate(this.memberId(), this.groupId()));

  isNew      = computed(() => this.result().label === 'New');
  scoreText  = computed(() => { const r = this.result(); return `${r.label} ${r.score}`; });

  badgeClass = computed(() => {
    const r = this.result();
    return r.color === 'success' ? 'badge-g' : r.color === 'warning' ? 'badge-a' : 'badge-r';
  });
}
