import { Component, DestroyRef, OnInit, inject, input, output, signal } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';

function pad(n: number): string { return String(n).padStart(2, '0'); }

@Component({
  selector: 'app-countdown-timer',
  standalone: true,
  imports: [TranslocoDirective],
  styles: [`
    :host { display: block; }
    .timer-val { font-family: var(--font-serif); font-size: 30px; font-weight: 300;
                 color: var(--t1); letter-spacing: -0.5px; }
    .timer-val.urgent { color: var(--red); }
    .timer-lbl { font-family: var(--font-mono); font-size: 10px; color: var(--t3); margin-top: 3px; }
  `],
  template: `
    <ng-container *transloco="let t">
      <div class="timer-val" [class.urgent]="urgent()">{{ display() }}</div>
      <div class="timer-lbl">{{ t('shared.timerLabel') }}</div>
    </ng-container>
  `,
})
export class CountdownTimerComponent implements OnInit {
  closeAt = input.required<string>();
  onExpired = output<void>();

  display = signal('--:--:--');
  urgent = signal(false);

  private destroyRef = inject(DestroyRef);

  ngOnInit() {
    const tick = () => {
      const diff = Math.max(0, new Date(this.closeAt()).getTime() - Date.now());
      const s = Math.floor(diff / 1000);
      this.urgent.set(s < 3600);
      const h = Math.floor(s / 3600);
      const m = Math.floor((s % 3600) / 60);
      const sec = s % 60;
      this.display.set(`${pad(h)}:${pad(m)}:${pad(sec)}`);
      if (s === 0) this.onExpired.emit();
    };
    tick();
    const id = setInterval(tick, 1000);
    this.destroyRef.onDestroy(() => clearInterval(id));
  }
}
