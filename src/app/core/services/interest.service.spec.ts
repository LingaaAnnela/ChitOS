import { describe, it, expect } from 'vitest';
import { InterestService } from './interest.service';
import type { Contribution, Payout } from '@core/mock/seed.data';

const svc = new InterestService();

// ── calculatePremium ────────────────────────────────────────────────────────

describe('calculatePremium', () => {
  it('position 1 pays the highest premium', () => {
    const p1   = svc.calculatePremium(1,  10, 1000);
    const mid  = svc.calculatePremium(5,  10, 1000);
    const last = svc.calculatePremium(10, 10, 1000);
    expect(p1).toBeGreaterThan(mid);
    expect(mid).toBeGreaterThan(last);
  });

  it('last position pays base contribution with no premium', () => {
    expect(svc.calculatePremium(10, 10, 1000)).toBe(1000);
  });

  it('position 1 of 10 with base ₹1000 gives correct premium', () => {
    // 1000 * (1 + (10-1)*0.05/10) = 1000 * 1.045 = 1045
    expect(svc.calculatePremium(1, 10, 1000)).toBe(1045);
  });

  it('scales proportionally with base contribution', () => {
    const x1 = svc.calculatePremium(1, 10, 1000);
    const x2 = svc.calculatePremium(1, 10, 2000);
    expect(x2).toBe(x1 * 2);
  });
});

// ── calculateDividend ───────────────────────────────────────────────────────

describe('calculateDividend', () => {
  it('splits surplus equally among remaining members', () => {
    // pot 10000, winning bid 8000, 10 members → (10000-8000)/9 ≈ 222
    expect(svc.calculateDividend(10000, 8000, 10)).toBe(222);
  });

  it('returns 0 when pot equals winning bid (no surplus)', () => {
    expect(svc.calculateDividend(10000, 10000, 10)).toBe(0);
  });

  it('returns 0 when memberCount is 1 (no other members)', () => {
    expect(svc.calculateDividend(10000, 5000, 1)).toBe(0);
  });

  it('correctly divides with Friends Circle example (₹9400 bid, 10 members, ₹10000 pot)', () => {
    // (10000 - 9400) / 9 = 600/9 ≈ 67
    expect(svc.calculateDividend(10000, 9400, 10)).toBe(67);
  });
});

// ── calculateMemberNetPosition ──────────────────────────────────────────────

describe('calculateMemberNetPosition', () => {
  const makeContrib = (paid: number): Contribution => ({
    id: 'c1', cycle_id: 'cy1', group_id: 'g1', profile_id: 'u1',
    amount_due: paid, amount_paid: paid, status: 'paid',
  });

  const makePayout = (amount: number): Payout => ({
    id: 'p1', cycle_id: 'cy1', group_id: 'g1', profile_id: 'u1',
    amount, payment_date: '2026-01-01', strategy: 'auction',
  });

  it('returns negative value for net payer (paid more than received)', () => {
    const contribs = [makeContrib(1000), makeContrib(1000), makeContrib(1000)];
    const payouts: Payout[] = [];
    expect(svc.calculateMemberNetPosition(contribs, payouts)).toBe(-3000);
  });

  it('returns positive value for net receiver (received more than paid)', () => {
    const contribs = [makeContrib(1000)];
    const payouts  = [makePayout(9000)];
    expect(svc.calculateMemberNetPosition(contribs, payouts)).toBe(8000);
  });

  it('returns 0 when total paid equals total received', () => {
    const contribs = [makeContrib(1000), makeContrib(1000)];
    const payouts  = [makePayout(2000)];
    expect(svc.calculateMemberNetPosition(contribs, payouts)).toBe(0);
  });

  it('handles empty arrays', () => {
    expect(svc.calculateMemberNetPosition([], [])).toBe(0);
  });

  it('sums partial payments correctly', () => {
    const partial: Contribution = {
      id: 'c2', cycle_id: 'cy2', group_id: 'g1', profile_id: 'u1',
      amount_due: 1000, amount_paid: 500, status: 'partial',
    };
    expect(svc.calculateMemberNetPosition([partial], [])).toBe(-500);
  });
});
