import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-progress-bar',
  standalone: true,
  template: `
    <div class="prog-track">
      <div [class]="'prog-fill prog-fill-' + color()" [style.width.%]="clamped()"></div>
    </div>
    @if (showLabel() && label()) {
      <div style="font-size:9px; color:var(--t3); margin-top:3px;">{{ label() }}</div>
    }
  `,
})
export class ProgressBarComponent {
  value = input<number>(0);
  color = input<'g' | 'a' | 'b' | 'grey'>('g');
  showLabel = input<boolean>(false);
  label = input<string>('');
  clamped = computed(() => Math.min(100, Math.max(0, this.value())));
}
