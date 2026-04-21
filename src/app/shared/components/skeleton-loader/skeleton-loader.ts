import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-skeleton-loader',
  standalone: true,
  template: `
    @for (i of items(); track i) {
      <div [class]="'skel skel-' + type()" style="margin-bottom:8px;"></div>
    }
  `,
})
export class SkeletonLoaderComponent {
  type = input<'card' | 'row' | 'stat' | 'avatar' | 'text'>('row');
  count = input<number>(1);
  items = computed(() => Array.from({ length: this.count() }, (_, i) => i));
}
