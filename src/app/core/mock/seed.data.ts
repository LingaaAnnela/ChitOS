import { signal } from '@angular/core';

// ── Types ──────────────────────────────────────────────────────────────────

export type Strategy       = 'auction' | 'lottery' | 'fixed' | 'consensus';
export type GroupStatus    = 'active' | 'inviting' | 'completed';
export type ContribStatus  = 'paid' | 'overdue' | 'partial' | 'pending' | 'waived';
export type ApprovalStatus = 'approved' | 'pending' | 'rejected';
export type PayMethod      = 'upi' | 'bank' | 'cash';
export type NotifType      = 'join_request' | 'overdue' | 'auction_open' | 'contribution_paid' | 'payout' | 'announcement';
export type ActColor       = 'green' | 'blue' | 'amber' | 'red';
export type TrustLabel     = 'Excellent' | 'Reliable' | 'Good' | 'Fair' | 'Irregular';
export type AvatarColor    = 'g' | 'b' | 'a' | 'r';

export interface Tenant {
  id: string; name: string; plan: 'free' | 'pro';
  group_count: number; max_groups: number;
}

export interface Profile {
  id: string; name: string; initials: string;
  phone: string; email: string;
  trust_score: number; trust_label: TrustLabel; avatar_color: AvatarColor;
}

export interface Group {
  id: string; tenant_id: string; name: string;
  strategy: Strategy; status: GroupStatus;
  contribution_amount: number; frequency: 'monthly' | 'weekly' | 'fortnightly';
  total_cycles: number; current_cycle: number;
  member_count: number; max_members: number;
  start_date: string; due_day: number; created_at: string;
}

export interface GroupMember {
  id: string; group_id: string; profile_id: string;
  approval_status: ApprovalStatus; role: 'owner' | 'member';
  joined_at: string; request_source?: string; phone?: string;
}

export interface Cycle {
  id: string; group_id: string; cycle_number: number;
  month_label: string; status: 'completed' | 'active' | 'future';
  due_date: string; auction_open_date?: string; auction_close_date?: string;
  winner_profile_id?: string; payout_amount?: number;
}

export interface Contribution {
  id: string; cycle_id: string; group_id: string; profile_id: string;
  amount_due: number; amount_paid: number; status: ContribStatus;
  payment_method?: PayMethod; payment_date?: string;
  payment_ref?: string; penalty?: number; notes?: string;
}

export interface Payout {
  id: string; cycle_id: string; group_id: string;
  profile_id: string; amount: number; payment_date: string; strategy: Strategy;
}

export interface AuctionBid {
  id: string; cycle_id: string; group_id: string;
  profile_id: string; bid_amount: number;
  submitted_at: string; is_winner: boolean;
}

export interface Notification {
  id: string; user_id: string; type: NotifType;
  title: string; message: string; read: boolean;
  created_at: string; group_id?: string; group_name?: string;
}

export interface ActivityLog {
  id: string; tenant_id: string; text: string;
  time_label: string; color: ActColor; created_at: string;
}

export interface Announcement {
  id: string; group_id: string; author_id: string;
  text: string; reactions: number; created_at: string;
}

export interface EnrichedMember extends GroupMember {
  profile: Profile;
  contribution?: Contribution;
}

export interface EnrichedContribution extends Contribution {
  profile: Profile;
}

// ── Constants ──────────────────────────────────────────────────────────────

export const MOCK_TENANT_ID       = 't-ravis';
export const MOCK_CURRENT_USER_ID = 'u-ravi';
export const ACTIVE_CYCLE_ID      = 'c-fc-4';

// ── Tenant ─────────────────────────────────────────────────────────────────

export const MOCK_TENANT: Tenant = {
  id: MOCK_TENANT_ID, name: "Ravi's Circles", plan: 'free',
  group_count: 3, max_groups: 4,
};

// ── Profiles ───────────────────────────────────────────────────────────────

export const MOCK_PROFILES: Profile[] = [
  { id: 'u-ravi',    name: 'Ravi Kumar',      initials: 'RK', phone: '+91 99999 00001', email: 'ravi@gmail.com',     trust_score: 82, trust_label: 'Reliable',  avatar_color: 'g' },
  { id: 'u-suresh',  name: 'Suresh Babu',     initials: 'SB', phone: '+91 99999 00002', email: 'suresh@gmail.com',   trust_score: 94, trust_label: 'Excellent', avatar_color: 'b' },
  { id: 'u-priya',   name: 'Priya Reddy',     initials: 'PR', phone: '+91 99999 00003', email: 'priya@gmail.com',    trust_score: 91, trust_label: 'Excellent', avatar_color: 'g' },
  { id: 'u-anita',   name: 'Anita Sharma',    initials: 'AN', phone: '+91 99999 00004', email: 'anita@gmail.com',    trust_score: 88, trust_label: 'Reliable',  avatar_color: 'g' },
  { id: 'u-venkat',  name: 'Venkat Rao',      initials: 'VR', phone: '+91 99999 00005', email: 'venkat@gmail.com',   trust_score: 79, trust_label: 'Reliable',  avatar_color: 'b' },
  { id: 'u-deepika', name: 'Deepika Nair',    initials: 'DN', phone: '+91 99999 00006', email: 'deepika@gmail.com',  trust_score: 71, trust_label: 'Good',      avatar_color: 'g' },
  { id: 'u-kiran',   name: 'Kiran Kumar',     initials: 'KK', phone: '+91 99999 00007', email: 'kiran@gmail.com',    trust_score: 85, trust_label: 'Reliable',  avatar_color: 'b' },
  { id: 'u-sravani', name: 'Sravani Patel',   initials: 'SP', phone: '+91 99999 00008', email: 'sravani@gmail.com',  trust_score: 74, trust_label: 'Good',      avatar_color: 'g' },
  { id: 'u-mahesh',  name: 'Mahesh Iyer',     initials: 'MI', phone: '+91 99999 00009', email: 'mahesh@gmail.com',   trust_score: 52, trust_label: 'Fair',      avatar_color: 'r' },
  { id: 'u-lakshmi', name: 'Lakshmi Devi',    initials: 'LD', phone: '+91 99999 00010', email: 'lakshmi@gmail.com',  trust_score: 68, trust_label: 'Good',      avatar_color: 'a' },
  { id: 'u-swathi',  name: 'Swathi Reddy',    initials: 'SW', phone: '+91 85432 10987', email: 'swathi@gmail.com',   trust_score: 0,  trust_label: 'Good',      avatar_color: 'a' },
  { id: 'u-rohit',   name: 'Rohit Gupta',     initials: 'RG', phone: '+91 84321 09876', email: 'rohit@gmail.com',    trust_score: 0,  trust_label: 'Good',      avatar_color: 'b' },
  { id: 'u-naveen',  name: 'Naveen Prasad',   initials: 'NP', phone: '+91 99999 00011', email: 'naveen@gmail.com',   trust_score: 76, trust_label: 'Good',      avatar_color: 'g' },
  { id: 'u-teja',    name: 'Teja Varma',      initials: 'TK', phone: '+91 99999 00012', email: 'teja@gmail.com',     trust_score: 80, trust_label: 'Reliable',  avatar_color: 'b' },
  { id: 'u-sindhu',  name: 'Sindhu Krishnan', initials: 'SK', phone: '+91 99999 00013', email: 'sindhu@gmail.com',   trust_score: 83, trust_label: 'Reliable',  avatar_color: 'g' },
  { id: 'u-arjun',   name: 'Arjun Mehta',     initials: 'AM', phone: '+91 99999 00014', email: 'arjun@gmail.com',    trust_score: 77, trust_label: 'Good',      avatar_color: 'b' },
  { id: 'u-radha',   name: 'Radha Krishnan',  initials: 'RD', phone: '+91 99999 00015', email: 'radha@gmail.com',    trust_score: 90, trust_label: 'Excellent', avatar_color: 'g' },
  { id: 'u-gopal',   name: 'Gopal Raju',      initials: 'GR', phone: '+91 99999 00016', email: 'gopal@gmail.com',    trust_score: 87, trust_label: 'Reliable',  avatar_color: 'b' },
  { id: 'u-meena',   name: 'Meena Devi',      initials: 'MD', phone: '+91 99999 00017', email: 'meena@gmail.com',    trust_score: 85, trust_label: 'Reliable',  avatar_color: 'g' },
];

// ── Groups ─────────────────────────────────────────────────────────────────

export const MOCK_GROUPS: Group[] = [
  {
    id: 'g-friends', tenant_id: MOCK_TENANT_ID,
    name: 'Friends Circle', strategy: 'auction', status: 'active',
    contribution_amount: 1000, frequency: 'monthly',
    total_cycles: 10, current_cycle: 4,
    member_count: 10, max_members: 15,
    start_date: '2026-01-01', due_day: 25, created_at: '2025-12-01',
  },
  {
    id: 'g-office', tenant_id: MOCK_TENANT_ID,
    name: 'Office Gang', strategy: 'lottery', status: 'inviting',
    contribution_amount: 2000, frequency: 'monthly',
    total_cycles: 8, current_cycle: 0,
    member_count: 7, max_members: 8,
    start_date: '2026-06-01', due_day: 1, created_at: '2026-03-01',
  },
  {
    id: 'g-family', tenant_id: MOCK_TENANT_ID,
    name: 'Family Savings', strategy: 'fixed', status: 'completed',
    contribution_amount: 5000, frequency: 'monthly',
    total_cycles: 4, current_cycle: 4,
    member_count: 4, max_members: 4,
    start_date: '2025-01-01', due_day: 1, created_at: '2024-12-01',
  },
  {
    id: 'g-neighbours', tenant_id: MOCK_TENANT_ID,
    name: 'Neighbours Club', strategy: 'lottery', status: 'active',
    contribution_amount: 3000, frequency: 'monthly',
    total_cycles: 6, current_cycle: 4,
    member_count: 6, max_members: 6,
    start_date: '2026-01-01', due_day: 15, created_at: '2025-12-15',
  },
];

// ── Group Members ──────────────────────────────────────────────────────────

const INITIAL_GROUP_MEMBERS: GroupMember[] = [
  // Friends Circle — 10 approved
  { id: 'gm-fc-1',  group_id: 'g-friends', profile_id: 'u-ravi',    approval_status: 'approved', role: 'owner',  joined_at: '2025-12-01' },
  { id: 'gm-fc-2',  group_id: 'g-friends', profile_id: 'u-suresh',  approval_status: 'approved', role: 'member', joined_at: '2025-12-05' },
  { id: 'gm-fc-3',  group_id: 'g-friends', profile_id: 'u-priya',   approval_status: 'approved', role: 'member', joined_at: '2025-12-05' },
  { id: 'gm-fc-4',  group_id: 'g-friends', profile_id: 'u-anita',   approval_status: 'approved', role: 'member', joined_at: '2025-12-06' },
  { id: 'gm-fc-5',  group_id: 'g-friends', profile_id: 'u-venkat',  approval_status: 'approved', role: 'member', joined_at: '2025-12-07' },
  { id: 'gm-fc-6',  group_id: 'g-friends', profile_id: 'u-deepika', approval_status: 'approved', role: 'member', joined_at: '2025-12-08' },
  { id: 'gm-fc-7',  group_id: 'g-friends', profile_id: 'u-kiran',   approval_status: 'approved', role: 'member', joined_at: '2025-12-09' },
  { id: 'gm-fc-8',  group_id: 'g-friends', profile_id: 'u-sravani', approval_status: 'approved', role: 'member', joined_at: '2025-12-10' },
  { id: 'gm-fc-9',  group_id: 'g-friends', profile_id: 'u-mahesh',  approval_status: 'approved', role: 'member', joined_at: '2025-12-11' },
  { id: 'gm-fc-10', group_id: 'g-friends', profile_id: 'u-lakshmi', approval_status: 'approved', role: 'member', joined_at: '2025-12-12' },
  // Office Gang — 5 approved + 2 pending
  { id: 'gm-og-1', group_id: 'g-office',  profile_id: 'u-ravi',   approval_status: 'approved', role: 'owner',  joined_at: '2026-03-01' },
  { id: 'gm-og-2', group_id: 'g-office',  profile_id: 'u-naveen', approval_status: 'approved', role: 'member', joined_at: '2026-03-05' },
  { id: 'gm-og-3', group_id: 'g-office',  profile_id: 'u-teja',   approval_status: 'approved', role: 'member', joined_at: '2026-03-06' },
  { id: 'gm-og-4', group_id: 'g-office',  profile_id: 'u-sindhu', approval_status: 'approved', role: 'member', joined_at: '2026-03-07' },
  { id: 'gm-og-5', group_id: 'g-office',  profile_id: 'u-arjun',  approval_status: 'approved', role: 'member', joined_at: '2026-03-08' },
  { id: 'gm-og-6', group_id: 'g-office',  profile_id: 'u-swathi', approval_status: 'pending',  role: 'member', joined_at: '2026-04-10', request_source: 'invite_link', phone: '+91 85432 10987' },
  { id: 'gm-og-7', group_id: 'g-office',  profile_id: 'u-rohit',  approval_status: 'pending',  role: 'member', joined_at: '2026-04-12', request_source: 'whatsapp',    phone: '+91 84321 09876' },
  // Family Savings — 4 approved
  { id: 'gm-fs-1', group_id: 'g-family',  profile_id: 'u-ravi',  approval_status: 'approved', role: 'owner',  joined_at: '2024-12-01' },
  { id: 'gm-fs-2', group_id: 'g-family',  profile_id: 'u-radha', approval_status: 'approved', role: 'member', joined_at: '2024-12-05' },
  { id: 'gm-fs-3', group_id: 'g-family',  profile_id: 'u-gopal', approval_status: 'approved', role: 'member', joined_at: '2024-12-05' },
  { id: 'gm-fs-4', group_id: 'g-family',  profile_id: 'u-meena', approval_status: 'approved', role: 'member', joined_at: '2024-12-05' },
  // Neighbours Club — 6 approved
  { id: 'gm-nb-1', group_id: 'g-neighbours', profile_id: 'u-ravi',   approval_status: 'approved', role: 'owner',  joined_at: '2025-12-15' },
  { id: 'gm-nb-2', group_id: 'g-neighbours', profile_id: 'u-naveen', approval_status: 'approved', role: 'member', joined_at: '2025-12-16' },
  { id: 'gm-nb-3', group_id: 'g-neighbours', profile_id: 'u-teja',   approval_status: 'approved', role: 'member', joined_at: '2025-12-17' },
  { id: 'gm-nb-4', group_id: 'g-neighbours', profile_id: 'u-sindhu', approval_status: 'approved', role: 'member', joined_at: '2025-12-18' },
  { id: 'gm-nb-5', group_id: 'g-neighbours', profile_id: 'u-arjun',  approval_status: 'approved', role: 'member', joined_at: '2025-12-19' },
  { id: 'gm-nb-6', group_id: 'g-neighbours', profile_id: 'u-radha',  approval_status: 'approved', role: 'member', joined_at: '2025-12-20' },
];

// ── Cycles ─────────────────────────────────────────────────────────────────

export const MOCK_CYCLES: Cycle[] = [
  // Friends Circle
  { id: 'c-fc-1',  group_id: 'g-friends', cycle_number: 1,  month_label: 'M1 · Jan', status: 'completed', due_date: '2026-01-25', winner_profile_id: 'u-suresh', payout_amount: 8500  },
  { id: 'c-fc-2',  group_id: 'g-friends', cycle_number: 2,  month_label: 'M2 · Feb', status: 'completed', due_date: '2026-02-25', winner_profile_id: 'u-priya',  payout_amount: 9000  },
  { id: 'c-fc-3',  group_id: 'g-friends', cycle_number: 3,  month_label: 'M3 · Mar', status: 'completed', due_date: '2026-03-25', winner_profile_id: 'u-anita',  payout_amount: 9200  },
  { id: 'c-fc-4',  group_id: 'g-friends', cycle_number: 4,  month_label: 'M4 · Apr', status: 'active',    due_date: '2026-04-25', auction_open_date: '2026-04-20', auction_close_date: '2026-04-22T08:00:00' },
  { id: 'c-fc-5',  group_id: 'g-friends', cycle_number: 5,  month_label: 'M5 · May', status: 'future',    due_date: '2026-05-25' },
  { id: 'c-fc-6',  group_id: 'g-friends', cycle_number: 6,  month_label: 'M6 · Jun', status: 'future',    due_date: '2026-06-25' },
  { id: 'c-fc-7',  group_id: 'g-friends', cycle_number: 7,  month_label: 'M7 · Jul', status: 'future',    due_date: '2026-07-25' },
  { id: 'c-fc-8',  group_id: 'g-friends', cycle_number: 8,  month_label: 'M8 · Aug', status: 'future',    due_date: '2026-08-25' },
  { id: 'c-fc-9',  group_id: 'g-friends', cycle_number: 9,  month_label: 'M9 · Sep', status: 'future',    due_date: '2026-09-25' },
  { id: 'c-fc-10', group_id: 'g-friends', cycle_number: 10, month_label: 'M10 · Oct', status: 'future',   due_date: '2026-10-25' },
  // Family Savings — all completed
  { id: 'c-fs-1', group_id: 'g-family', cycle_number: 1, month_label: 'Jan 2025', status: 'completed', due_date: '2025-01-25', winner_profile_id: 'u-ravi',  payout_amount: 20000 },
  { id: 'c-fs-2', group_id: 'g-family', cycle_number: 2, month_label: 'Feb 2025', status: 'completed', due_date: '2025-02-25', winner_profile_id: 'u-radha', payout_amount: 20000 },
  { id: 'c-fs-3', group_id: 'g-family', cycle_number: 3, month_label: 'Mar 2025', status: 'completed', due_date: '2025-03-25', winner_profile_id: 'u-gopal', payout_amount: 20000 },
  { id: 'c-fs-4', group_id: 'g-family', cycle_number: 4, month_label: 'Apr 2025', status: 'completed', due_date: '2025-04-25', winner_profile_id: 'u-meena', payout_amount: 20000 },
  // Neighbours Club — 3 completed, 1 active, 2 future
  { id: 'c-nb-1', group_id: 'g-neighbours', cycle_number: 1, month_label: 'M1 · Jan', status: 'completed', due_date: '2026-01-15', winner_profile_id: 'u-naveen', payout_amount: 18000 },
  { id: 'c-nb-2', group_id: 'g-neighbours', cycle_number: 2, month_label: 'M2 · Feb', status: 'completed', due_date: '2026-02-15', winner_profile_id: 'u-teja',   payout_amount: 18000 },
  { id: 'c-nb-3', group_id: 'g-neighbours', cycle_number: 3, month_label: 'M3 · Mar', status: 'completed', due_date: '2026-03-15', winner_profile_id: 'u-arjun',  payout_amount: 18000 },
  { id: 'c-nb-4', group_id: 'g-neighbours', cycle_number: 4, month_label: 'M4 · Apr', status: 'active',    due_date: '2026-04-15' },
  { id: 'c-nb-5', group_id: 'g-neighbours', cycle_number: 5, month_label: 'M5 · May', status: 'future',    due_date: '2026-05-15' },
  { id: 'c-nb-6', group_id: 'g-neighbours', cycle_number: 6, month_label: 'M6 · Jun', status: 'future',    due_date: '2026-06-15' },
];

// ── Contributions ──────────────────────────────────────────────────────────

const INITIAL_CONTRIBUTIONS: Contribution[] = [
  // Friends Circle M4 (active) — 8 paid, 1 overdue, 1 partial
  { id: 'ct-fc4-rk', cycle_id: 'c-fc-4', group_id: 'g-friends', profile_id: 'u-ravi',    amount_due: 1000, amount_paid: 1000, status: 'paid',    payment_method: 'upi',  payment_date: '2026-04-15', payment_ref: 'UPI123456789' },
  { id: 'ct-fc4-sb', cycle_id: 'c-fc-4', group_id: 'g-friends', profile_id: 'u-suresh',  amount_due: 1000, amount_paid: 1000, status: 'paid',    payment_method: 'upi',  payment_date: '2026-04-14' },
  { id: 'ct-fc4-pr', cycle_id: 'c-fc-4', group_id: 'g-friends', profile_id: 'u-priya',   amount_due: 1000, amount_paid: 1000, status: 'paid',    payment_method: 'bank', payment_date: '2026-04-16' },
  { id: 'ct-fc4-an', cycle_id: 'c-fc-4', group_id: 'g-friends', profile_id: 'u-anita',   amount_due: 1000, amount_paid: 1000, status: 'paid',    payment_method: 'cash', payment_date: '2026-04-17' },
  { id: 'ct-fc4-vr', cycle_id: 'c-fc-4', group_id: 'g-friends', profile_id: 'u-venkat',  amount_due: 1000, amount_paid: 1000, status: 'paid',    payment_method: 'upi',  payment_date: '2026-04-18' },
  { id: 'ct-fc4-dn', cycle_id: 'c-fc-4', group_id: 'g-friends', profile_id: 'u-deepika', amount_due: 1000, amount_paid: 1000, status: 'paid',    payment_method: 'upi',  payment_date: '2026-04-19' },
  { id: 'ct-fc4-kk', cycle_id: 'c-fc-4', group_id: 'g-friends', profile_id: 'u-kiran',   amount_due: 1000, amount_paid: 1000, status: 'paid',    payment_method: 'upi',  payment_date: '2026-04-13' },
  { id: 'ct-fc4-sp', cycle_id: 'c-fc-4', group_id: 'g-friends', profile_id: 'u-sravani', amount_due: 1000, amount_paid: 1000, status: 'paid',    payment_method: 'upi',  payment_date: '2026-04-20' },
  { id: 'ct-fc4-mi', cycle_id: 'c-fc-4', group_id: 'g-friends', profile_id: 'u-mahesh',  amount_due: 1000, amount_paid: 0,    status: 'overdue', penalty: 50 },
  { id: 'ct-fc4-ld', cycle_id: 'c-fc-4', group_id: 'g-friends', profile_id: 'u-lakshmi', amount_due: 1000, amount_paid: 500,  status: 'partial', payment_method: 'upi',  payment_date: '2026-04-26', notes: "pays rest by 30th" },
  // Friends Circle M1-M3 (completed, abbreviated)
  { id: 'ct-fc1-rk', cycle_id: 'c-fc-1', group_id: 'g-friends', profile_id: 'u-ravi',   amount_due: 1000, amount_paid: 1000, status: 'paid', payment_method: 'upi', payment_date: '2026-01-15' },
  { id: 'ct-fc1-sb', cycle_id: 'c-fc-1', group_id: 'g-friends', profile_id: 'u-suresh', amount_due: 1000, amount_paid: 1000, status: 'paid', payment_method: 'upi', payment_date: '2026-01-10' },
  { id: 'ct-fc2-rk', cycle_id: 'c-fc-2', group_id: 'g-friends', profile_id: 'u-ravi',   amount_due: 1000, amount_paid: 1000, status: 'paid', payment_method: 'upi', payment_date: '2026-02-14' },
  { id: 'ct-fc3-rk', cycle_id: 'c-fc-3', group_id: 'g-friends', profile_id: 'u-ravi',   amount_due: 1000, amount_paid: 1000, status: 'paid', payment_method: 'upi', payment_date: '2026-03-15' },
  // Family Savings — all completed
  { id: 'ct-fs1-rk', cycle_id: 'c-fs-1', group_id: 'g-family', profile_id: 'u-ravi',  amount_due: 5000, amount_paid: 5000, status: 'paid', payment_method: 'upi', payment_date: '2025-01-15' },
  { id: 'ct-fs1-rd', cycle_id: 'c-fs-1', group_id: 'g-family', profile_id: 'u-radha', amount_due: 5000, amount_paid: 5000, status: 'paid', payment_method: 'upi', payment_date: '2025-01-16' },
  { id: 'ct-fs1-gr', cycle_id: 'c-fs-1', group_id: 'g-family', profile_id: 'u-gopal', amount_due: 5000, amount_paid: 5000, status: 'paid', payment_method: 'upi', payment_date: '2025-01-17' },
  { id: 'ct-fs1-md', cycle_id: 'c-fs-1', group_id: 'g-family', profile_id: 'u-meena', amount_due: 5000, amount_paid: 5000, status: 'paid', payment_method: 'upi', payment_date: '2025-01-18' },
  { id: 'ct-fs2-rk', cycle_id: 'c-fs-2', group_id: 'g-family', profile_id: 'u-ravi',  amount_due: 5000, amount_paid: 5000, status: 'paid', payment_method: 'upi', payment_date: '2025-02-15' },
  { id: 'ct-fs2-rd', cycle_id: 'c-fs-2', group_id: 'g-family', profile_id: 'u-radha', amount_due: 5000, amount_paid: 5000, status: 'paid', payment_method: 'upi', payment_date: '2025-02-16' },
  { id: 'ct-fs2-gr', cycle_id: 'c-fs-2', group_id: 'g-family', profile_id: 'u-gopal', amount_due: 5000, amount_paid: 5000, status: 'paid', payment_method: 'upi', payment_date: '2025-02-17' },
  { id: 'ct-fs2-md', cycle_id: 'c-fs-2', group_id: 'g-family', profile_id: 'u-meena', amount_due: 5000, amount_paid: 5000, status: 'paid', payment_method: 'upi', payment_date: '2025-02-18' },
  { id: 'ct-fs3-rk', cycle_id: 'c-fs-3', group_id: 'g-family', profile_id: 'u-ravi',  amount_due: 5000, amount_paid: 5000, status: 'paid', payment_method: 'upi', payment_date: '2025-03-15' },
  { id: 'ct-fs3-rd', cycle_id: 'c-fs-3', group_id: 'g-family', profile_id: 'u-radha', amount_due: 5000, amount_paid: 5000, status: 'paid', payment_method: 'upi', payment_date: '2025-03-16' },
  { id: 'ct-fs3-gr', cycle_id: 'c-fs-3', group_id: 'g-family', profile_id: 'u-gopal', amount_due: 5000, amount_paid: 5000, status: 'paid', payment_method: 'upi', payment_date: '2025-03-17' },
  { id: 'ct-fs3-md', cycle_id: 'c-fs-3', group_id: 'g-family', profile_id: 'u-meena', amount_due: 5000, amount_paid: 5000, status: 'paid', payment_method: 'upi', payment_date: '2025-03-18' },
  { id: 'ct-fs4-rk', cycle_id: 'c-fs-4', group_id: 'g-family', profile_id: 'u-ravi',  amount_due: 5000, amount_paid: 5000, status: 'paid', payment_method: 'upi', payment_date: '2025-04-15' },
  { id: 'ct-fs4-rd', cycle_id: 'c-fs-4', group_id: 'g-family', profile_id: 'u-radha', amount_due: 5000, amount_paid: 5000, status: 'paid', payment_method: 'upi', payment_date: '2025-04-16' },
  { id: 'ct-fs4-gr', cycle_id: 'c-fs-4', group_id: 'g-family', profile_id: 'u-gopal', amount_due: 5000, amount_paid: 5000, status: 'paid', payment_method: 'upi', payment_date: '2025-04-17' },
  { id: 'ct-fs4-md', cycle_id: 'c-fs-4', group_id: 'g-family', profile_id: 'u-meena', amount_due: 5000, amount_paid: 5000, status: 'paid', payment_method: 'upi', payment_date: '2025-04-18' },
];

// ── Auction Bids ───────────────────────────────────────────────────────────

const INITIAL_AUCTION_BIDS: AuctionBid[] = [
  { id: 'ab-fc4-vr', cycle_id: 'c-fc-4', group_id: 'g-friends', profile_id: 'u-venkat',  bid_amount: 9100, submitted_at: '2026-04-20T10:15:00', is_winner: false },
  { id: 'ab-fc4-dn', cycle_id: 'c-fc-4', group_id: 'g-friends', profile_id: 'u-deepika', bid_amount: 9300, submitted_at: '2026-04-20T11:30:00', is_winner: false },
  { id: 'ab-fc4-rk', cycle_id: 'c-fc-4', group_id: 'g-friends', profile_id: 'u-ravi',    bid_amount: 9400, submitted_at: '2026-04-20T14:00:00', is_winner: false },
];

// ── Payouts ────────────────────────────────────────────────────────────────

export const MOCK_PAYOUTS: Payout[] = [
  { id: 'py-fc-1', cycle_id: 'c-fc-1', group_id: 'g-friends', profile_id: 'u-suresh', amount: 8500,  payment_date: '2026-01-26', strategy: 'auction' },
  { id: 'py-fc-2', cycle_id: 'c-fc-2', group_id: 'g-friends', profile_id: 'u-priya',  amount: 9000,  payment_date: '2026-02-26', strategy: 'auction' },
  { id: 'py-fc-3', cycle_id: 'c-fc-3', group_id: 'g-friends', profile_id: 'u-anita',  amount: 9200,  payment_date: '2026-03-27', strategy: 'auction' },
  { id: 'py-fs-1', cycle_id: 'c-fs-1', group_id: 'g-family',  profile_id: 'u-ravi',   amount: 20000, payment_date: '2025-01-26', strategy: 'fixed' },
  { id: 'py-fs-2', cycle_id: 'c-fs-2', group_id: 'g-family',  profile_id: 'u-radha',  amount: 20000, payment_date: '2025-02-26', strategy: 'fixed' },
  { id: 'py-fs-3', cycle_id: 'c-fs-3', group_id: 'g-family',  profile_id: 'u-gopal',  amount: 20000, payment_date: '2025-03-26', strategy: 'fixed' },
  { id: 'py-fs-4', cycle_id: 'c-fs-4', group_id: 'g-family',  profile_id: 'u-meena',  amount: 20000, payment_date: '2025-04-26', strategy: 'fixed' },
];

// ── Notifications ──────────────────────────────────────────────────────────

export const MOCK_NOTIFICATIONS: Notification[] = [
  { id: 'n-1', user_id: 'u-ravi', type: 'join_request',      title: 'New join request',     message: 'Swathi Reddy wants to join Office Gang',                             read: false, created_at: '2026-04-21T09:00:00', group_id: 'g-office',  group_name: 'Office Gang'    },
  { id: 'n-2', user_id: 'u-ravi', type: 'join_request',      title: 'New join request',     message: 'Rohit Gupta wants to join Office Gang',                              read: false, created_at: '2026-04-21T07:00:00', group_id: 'g-office',  group_name: 'Office Gang'    },
  { id: 'n-3', user_id: 'u-ravi', type: 'overdue',           title: 'Overdue contribution', message: 'Mahesh Iyer has not paid ₹1,000 for April',                          read: false, created_at: '2026-04-21T05:00:00', group_id: 'g-friends', group_name: 'Friends Circle' },
  { id: 'n-4', user_id: 'u-ravi', type: 'auction_open',      title: 'Auction opened',       message: 'Friends Circle April auction is live. Closes 22 Apr 8am.',           read: true,  created_at: '2026-04-20T08:00:00', group_id: 'g-friends', group_name: 'Friends Circle' },
  { id: 'n-5', user_id: 'u-ravi', type: 'contribution_paid', title: 'Contribution paid',    message: 'Your ₹1,000 for April has been recorded',                            read: true,  created_at: '2026-04-15T10:00:00', group_id: 'g-friends', group_name: 'Friends Circle' },
  { id: 'n-6', user_id: 'u-ravi', type: 'payout',            title: 'Payout recorded',      message: 'Anita Sharma received ₹9,200 — March winner',                        read: true,  created_at: '2026-03-27T12:00:00', group_id: 'g-friends', group_name: 'Friends Circle' },
  { id: 'n-7', user_id: 'u-ravi', type: 'announcement',      title: 'Announcement posted',  message: "Congratulations to Anita for winning March's ₹9,200!",               read: true,  created_at: '2026-03-28T09:00:00', group_id: 'g-friends', group_name: 'Friends Circle' },
];

// ── Activity Log ───────────────────────────────────────────────────────────

export const MOCK_ACTIVITY_LOG: ActivityLog[] = [
  { id: 'al-1', tenant_id: MOCK_TENANT_ID, text: 'Auction opened · Friends Circle April',          time_label: 'Today 8:00am · 3 bids in',  color: 'blue',  created_at: '2026-04-21T08:00:00' },
  { id: 'al-2', tenant_id: MOCK_TENANT_ID, text: "Sravani Patel's ₹1,000 marked paid · UPI",       time_label: 'Today 9:30am',               color: 'green', created_at: '2026-04-21T09:30:00' },
  { id: 'al-3', tenant_id: MOCK_TENANT_ID, text: 'Rohit Gupta requested to join Office Gang',       time_label: '12 Apr · Pending approval',  color: 'amber', created_at: '2026-04-12T10:00:00' },
  { id: 'al-4', tenant_id: MOCK_TENANT_ID, text: 'Anita Sharma received ₹9,200 — March pot',       time_label: '27 Mar · Auction winner',    color: 'green', created_at: '2026-03-27T12:00:00' },
];

// ── Announcements ──────────────────────────────────────────────────────────

export const MOCK_ANNOUNCEMENTS: Announcement[] = [
  { id: 'ann-1', group_id: 'g-friends', author_id: 'u-ravi', text: 'Auction is open! Bids close 22 Apr at 8am. Submit from the auction room.',  reactions: 4, created_at: '2026-04-21T08:05:00' },
  { id: 'ann-2', group_id: 'g-friends', author_id: 'u-ravi', text: 'Reminder: Contributions due by 25th. Pay to UPI 98491 23456.',               reactions: 3, created_at: '2026-04-18T10:00:00' },
  { id: 'ann-3', group_id: 'g-friends', author_id: 'u-ravi', text: "Congratulations to Anita for winning last month's ₹9,200 pot!",              reactions: 8, created_at: '2026-03-28T09:00:00' },
];

// ── Mutable signal store ───────────────────────────────────────────────────

export const mockStore = {
  contributions: signal<Contribution[]>([...INITIAL_CONTRIBUTIONS]),
  groupMembers:  signal<GroupMember[]>([...INITIAL_GROUP_MEMBERS]),
  auctionBids:   signal<AuctionBid[]>([...INITIAL_AUCTION_BIDS]),
};

// ── Helper functions ───────────────────────────────────────────────────────

function profileById(id: string): Profile {
  return MOCK_PROFILES.find(p => p.id === id) ?? MOCK_PROFILES[0];
}

export function enrichedMembers(groupId: string): EnrichedMember[] {
  const contribs = mockStore.contributions();
  return mockStore.groupMembers()
    .filter(gm => gm.group_id === groupId)
    .map(gm => ({
      ...gm,
      profile:      profileById(gm.profile_id),
      contribution: contribs.find(c => c.profile_id === gm.profile_id && c.group_id === groupId),
    }));
}

export function enrichedContributions(cycleId: string): EnrichedContribution[] {
  return mockStore.contributions()
    .filter(c => c.cycle_id === cycleId)
    .map(c => ({ ...c, profile: profileById(c.profile_id) }));
}
