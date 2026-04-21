import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-avatar',
  standalone: true,
  template: `<div [class]="'av av-' + size() + ' av-' + color()">{{ initials() }}</div>`,
})
export class AvatarComponent {
  initials = input.required<string>();
  size = input<'sm' | 'md' | 'lg'>('md');
  color = input<'g' | 'b' | 'a' | 'r'>('g');
}
