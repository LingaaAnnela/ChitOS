import { Pipe, PipeTransform } from '@angular/core';

const formatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

@Pipe({ name: 'indianCurrency', standalone: true })
export class IndianCurrencyPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    if (value == null) return '₹0';
    return formatter.format(value);
  }
}
