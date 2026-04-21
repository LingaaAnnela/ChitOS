import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class IndianCurrencyService {
  format(amount: number): string {
    return '₹' + amount.toLocaleString('en-IN');
  }
}
