import { Injectable } from '@angular/core';
import type { Contribution, Payout } from '@core/mock/seed.data';

@Injectable({ providedIn: 'root' })
export class InterestService {

  calculatePremium(position: number, totalMembers: number, baseContribution: number): number {
    return Math.round(baseContribution * (1 + (totalMembers - position) * 0.05 / totalMembers));
  }

  calculateDiscount(position: number, totalMembers: number, baseContribution: number): number {
    return Math.round(baseContribution * (1 - (position - 1) * 0.05 / totalMembers));
  }

  calculateDividend(potValue: number, winningBid: number, memberCount: number): number {
    if (memberCount <= 1) return 0;
    return Math.round((potValue - winningBid) / (memberCount - 1));
  }

  calculateMemberNetPosition(contributions: Contribution[], payouts: Payout[]): number {
    const totalPaid = contributions.reduce((sum, c) => sum + c.amount_paid, 0);
    const totalReceived = payouts.reduce((sum, p) => sum + p.amount, 0);
    return totalReceived - totalPaid;
  }

  calculateAdjustedContribution(position: number, totalMembers: number, base: number): number {
    return this.calculatePremium(position, totalMembers, base);
  }
}
