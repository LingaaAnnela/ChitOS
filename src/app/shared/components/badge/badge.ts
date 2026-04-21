import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-badge',
  standalone: true,
  template: `<span [class]="'badge badge-' + variant()">{{ text() }}</span>`,
})
export class BadgeComponent {
  variant = input.required<'g' | 'a' | 'r' | 'b' | 'grey' | 'live'>();
  text = input.required<string>();
}
