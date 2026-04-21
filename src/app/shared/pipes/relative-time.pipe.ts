import { Pipe, PipeTransform } from '@angular/core';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

@Pipe({ name: 'relativeTime', standalone: true })
export class RelativeTimePipe implements PipeTransform {
  transform(value: string | Date | null | undefined): string {
    if (!value) return '';
    const date = new Date(value);
    const diff = Date.now() - date.getTime();
    const mins  = Math.floor(diff / 60_000);
    const hours = Math.floor(diff / 3_600_000);
    const days  = Math.floor(diff / 86_400_000);

    if (mins  < 1)  return 'just now';
    if (mins  < 60) return `${mins} min ago`;
    if (hours < 24) return `${hours} hrs ago`;
    if (days  === 1) return 'Yesterday';
    return `${date.getDate()} ${MONTHS[date.getMonth()]}`;
  }
}
