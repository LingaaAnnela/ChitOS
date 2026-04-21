import { Injectable } from '@angular/core';
import { mockStore } from '@core/mock/seed.data';
import type { TrustLabel } from '@core/mock/seed.data';

export interface TrustScore {
  score: number;
  label: TrustLabel | 'New';
  color: 'success' | 'warning' | 'danger';
}

@Injectable({ providedIn: 'root' })
export class TrustScoreService {

  calculate(memberId: string, groupId: string): TrustScore {
    const contributions = mockStore.contributions()
      .filter(c => c.profile_id === memberId && c.group_id === groupId);

    const settled = contributions.filter(c => c.status !== 'pending');
    const onTimeRate = settled.length
      ? settled.filter(c => c.status === 'paid' || c.status === 'waived').length / settled.length
      : 0;

    const groupMembers = mockStore.groupMembers()
      .filter(gm => gm.group_id === groupId);
    const member = groupMembers.find(gm => gm.profile_id === memberId);

    const allBids = mockStore.auctionBids().filter(b => b.group_id === groupId);
    const memberBidCycles = new Set(
      allBids.filter(b => b.profile_id === memberId).map(b => b.cycle_id)
    );
    const totalAuctionCycles = new Set(allBids.map(b => b.cycle_id)).size;
    const auctionRate = totalAuctionCycles > 0
      ? memberBidCycles.size / totalAuctionCycles
      : 1;

    const tenureScore = member
      ? Math.min(1, msSince(member.joined_at) / (365 * 24 * 60 * 60 * 1000))
      : 0;

    if (settled.length === 0) {
      return { score: 0, label: 'New', color: 'warning' };
    }

    const score = Math.round(onTimeRate * 0.6 * 100 + auctionRate * 0.2 * 100 + tenureScore * 0.2 * 100);
    return { score, label: labelFor(score), color: colorFor(score) };
  }
}

function msSince(dateStr: string): number {
  return Date.now() - new Date(dateStr).getTime();
}

function labelFor(score: number): TrustLabel | 'New' {
  if (score >= 90) return 'Excellent';
  if (score >= 75) return 'Reliable';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  return 'Irregular';
}

function colorFor(score: number): 'success' | 'warning' | 'danger' {
  if (score >= 75) return 'success';
  if (score >= 40) return 'warning';
  return 'danger';
}
