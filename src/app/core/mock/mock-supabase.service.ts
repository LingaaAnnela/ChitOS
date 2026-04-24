import { Injectable } from '@angular/core';
import { ISupabaseService } from '@core/supabase/supabase.token';
import {
  MOCK_GROUPS, MOCK_CYCLES, MOCK_PAYOUTS,
  MOCK_NOTIFICATIONS, MOCK_ACTIVITY_LOG, MOCK_TENANT,
  MOCK_ANNOUNCEMENTS, MOCK_CURRENT_USER_ID, mockStore,
  enrichedMembers, enrichedContributions,
  type Contribution, type AuctionBid, type Invite,
} from './seed.data';


const delay = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

@Injectable({ providedIn: 'root' })
export class MockSupabaseService implements ISupabaseService {

  // ── Reads ────────────────────────────────────────────────────────────────

  async getGroups() {
    return MOCK_GROUPS;
  }

  async getGroup(id: string) {
    return MOCK_GROUPS.find(g => g.id === id) ?? null;
  }

  async getMembers(groupId: string) {
    return enrichedMembers(groupId);
  }

  async getContributions(cycleId: string) {
    return enrichedContributions(cycleId);
  }

  async getPayouts(groupId: string) {
    return MOCK_PAYOUTS.filter(p => p.group_id === groupId);
  }

  async getAuctionBids(cycleId: string) {
    return mockStore.auctionBids()
      .filter(b => b.cycle_id === cycleId)
      .sort((a, b) => a.bid_amount - b.bid_amount);
  }

  async getNotifications(userId: string) {
    return MOCK_NOTIFICATIONS.filter(n => n.user_id === userId);
  }

  async getActivityLog(tenantId: string) {
    return MOCK_ACTIVITY_LOG.filter(a => a.tenant_id === tenantId);
  }

  async getCycles(groupId: string) {
    return MOCK_CYCLES.filter(c => c.group_id === groupId);
  }

  async getAnnouncements(groupId: string) {
    return MOCK_ANNOUNCEMENTS.filter(a => a.group_id === groupId);
  }

  async getMyContributions(userId: string) {
    return mockStore.contributions().filter(c => c.profile_id === userId);
  }

  async getMyPayouts(userId: string) {
    return MOCK_PAYOUTS.filter(p => p.profile_id === userId);
  }

  async getTenant() {
    return MOCK_TENANT;
  }

  // ── Writes (400ms simulated latency) ────────────────────────────────────

  async markContributionPaid(id: string, data: Record<string, unknown>) {
    await delay(400);
    mockStore.contributions.update(list =>
      list.map(c => c.id === id
        ? { ...c, ...data, status: 'paid' } as Contribution
        : c
      )
    );
    return { id };
  }

  async approveMember(groupMemberId: string) {
    await delay(400);
    mockStore.groupMembers.update(list =>
      list.map(gm => gm.id === groupMemberId
        ? { ...gm, approval_status: 'approved' as const }
        : gm
      )
    );
    return { id: groupMemberId };
  }

  async rejectMember(groupMemberId: string, _reason: string) {
    await delay(400);
    mockStore.groupMembers.update(list =>
      list.map(gm => gm.id === groupMemberId
        ? { ...gm, approval_status: 'rejected' as const }
        : gm
      )
    );
    return { id: groupMemberId };
  }

  async createGroup(data: Record<string, unknown>) {
    await delay(400);
    return { id: `g-new-${Date.now()}`, ...data };
  }

  async updateGroup(id: string, data: Record<string, unknown>) {
    await delay(400);
    return { id, ...data };
  }

  async createAuctionBid(data: Record<string, unknown>) {
    await delay(400);
    const bid: AuctionBid = {
      id: `ab-${Date.now()}`,
      is_winner: false,
      submitted_at: new Date().toISOString(),
      cycle_id: data['cycle_id'] as string,
      group_id: data['group_id'] as string,
      profile_id: data['profile_id'] as string ?? MOCK_CURRENT_USER_ID,
      bid_amount: data['bid_amount'] as number ?? 0,
    };
    mockStore.auctionBids.update(list => [...list, bid]);
    return bid;
  }

  async updateAuctionBid(id: string, data: Record<string, unknown>) {
    await delay(400);
    mockStore.auctionBids.update(list =>
      list.map(b => b.id === id ? { ...b, ...data } as AuctionBid : b)
    );
    return { id };
  }

  async closeAuction(cycleId: string, winnerId: string) {
    await delay(400);
    mockStore.auctionBids.update(list =>
      list.map(b => b.cycle_id === cycleId
        ? { ...b, is_winner: b.profile_id === winnerId }
        : b
      )
    );
    return { cycleId, winnerId };
  }

  async recordPayout(data: Record<string, unknown>) {
    await delay(400);
    return { id: `py-${Date.now()}`, ...data };
  }

  async createAnnouncement(groupId: string, authorId: string, text: string) {
    await delay(300);
    MOCK_ANNOUNCEMENTS.unshift({
      id: `ann-${Date.now()}`, group_id: groupId, author_id: authorId,
      text, reactions: 0, created_at: new Date().toISOString(),
    });
  }

  async getConsensusVotes(cycleId: string) {
    return mockStore.consensusVotes().filter(v => v.cycle_id === cycleId);
  }

  async getInvites(groupId: string) {
    return mockStore.invites().filter(i => i.group_id === groupId);
  }

  async revokeInvite(inviteId: string) {
    await delay(300);
    mockStore.invites.update(list => list.filter(i => i.id !== inviteId));
    return { id: inviteId };
  }

  async regenerateInviteToken(groupId: string) {
    await delay(400);
    const newToken = `tok-${Math.random().toString(36).slice(2, 11)}`;
    mockStore.groups.update(list =>
      list.map(g => g.id === groupId ? { ...g, join_token: newToken } : g)
    );
    return { join_token: newToken };
  }
}
