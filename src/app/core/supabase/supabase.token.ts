import { InjectionToken } from '@angular/core';

export interface ISupabaseService {
  getGroups(): Promise<any[]>;
  getGroup(id: string): Promise<any>;
  getMembers(groupId: string): Promise<any[]>;
  getContributions(cycleId: string): Promise<any[]>;
  getPayouts(groupId: string): Promise<any[]>;
  getAuctionBids(cycleId: string): Promise<any[]>;
  getCycles(groupId: string): Promise<any[]>;
  getAnnouncements(groupId: string): Promise<any[]>;
  getMyContributions(userId: string): Promise<any[]>;
  getMyPayouts(userId: string): Promise<any[]>;
  getNotifications(userId: string): Promise<any[]>;
  getActivityLog(tenantId: string): Promise<any[]>;
  getTenant(): Promise<any>;
  markContributionPaid(id: string, data: Record<string, unknown>): Promise<any>;
  approveMember(groupMemberId: string): Promise<any>;
  rejectMember(groupMemberId: string, reason: string): Promise<any>;
  createGroup(data: Record<string, unknown>): Promise<any>;
  updateGroup(id: string, data: Record<string, unknown>): Promise<any>;
  createAuctionBid(data: Record<string, unknown>): Promise<any>;
  updateAuctionBid(id: string, data: Record<string, unknown>): Promise<any>;
  closeAuction(cycleId: string, winnerId: string): Promise<any>;
  recordPayout(data: Record<string, unknown>): Promise<any>;
  createAnnouncement(groupId: string, authorId: string, text: string): Promise<void>;
  getConsensusVotes(cycleId: string): Promise<any[]>;
  getInvites(groupId: string): Promise<any[]>;
  revokeInvite(inviteId: string): Promise<any>;
  regenerateInviteToken(groupId: string): Promise<{ join_token: string }>;
}

export const SUPABASE_SERVICE = new InjectionToken<ISupabaseService>('ISupabaseService');
