import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';
import { ConsoleStore } from '../console.store';
import { UIStore } from '@core/stores/ui.store';
import { FREE_MAX_MEMBERS } from '@core/config/plan.config';
import { RelativeTimePipe } from '@shared/pipes';
import {
  SkeletonLoaderComponent, EmptyStateComponent, WhatsAppShareBtnComponent,
} from '@shared/components';
import type { EnrichedMember } from '@core/mock/seed.data';

@Component({
  selector: 'app-member-approvals',
  standalone: true,
  imports: [DatePipe, TitleCasePipe, TranslocoDirective,
    SkeletonLoaderComponent, EmptyStateComponent, WhatsAppShareBtnComponent],
  styles: [`
    :host { display: flex; flex-direction: column; padding: 20px; gap: 16px; }

    .page-header { display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 10px; }
    .page-title { font-family: Newsreader, serif; font-size: 22px; font-weight: 300; color: var(--t1); margin-bottom: 3px; }
    .page-sub { font-size: 12px; color: var(--t3); }

    .approvals-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      grid-template-areas: "pending approved" "pending invite";
      gap: 14px;
      align-items: start;
    }
    .grid-pending  { grid-area: pending; }
    .grid-approved { grid-area: approved; }
    .grid-invite   { grid-area: invite; }

    .ap-row { display: flex; gap: 12px; align-items: flex-start;
      padding: 14px 16px; border-bottom: 0.5px solid var(--b); }
    .ap-row:last-of-type { border-bottom: none; }
    .ap-info { flex: 1; min-width: 0; }
    .ap-name { font-size: 14px; font-weight: 500; color: var(--t1); }
    .ap-meta { font-size: 12px; color: var(--t3); margin-top: 2px; }
    .ap-btns { display: flex; flex-direction: column; gap: 5px; align-items: flex-end; flex-shrink: 0; }
    .btn-approve { font-size: 12px; font-weight: 500; color: var(--green); background: var(--gbg);
      border: 0.5px solid rgba(22,163,74,0.25); border-radius: 100px; padding: 5px 14px; cursor: pointer; }
    .btn-reject  { font-size: 12px; font-weight: 500; color: var(--red); background: var(--rbg);
      border: 0.5px solid rgba(220,38,38,0.2); border-radius: 100px; padding: 5px 14px; cursor: pointer; }

    .member-row { display: flex; gap: 10px; align-items: center;
      padding: 10px 16px; border-bottom: 0.5px solid var(--b); }
    .member-row:last-of-type { border-bottom: none; }
    .mr-info { flex: 1; min-width: 0; }
    .mr-name { font-size: 13px; color: var(--t1); font-weight: 500; }
    .mr-meta { font-size: 11px; color: var(--t3); }

    .invite-body { padding: 14px; display: flex; flex-direction: column; gap: 10px; }
    .invite-box { display: flex; align-items: center; gap: 8px; padding: 10px 12px;
      background: var(--warm2); border: 0.5px solid var(--b2); border-radius: var(--rs); }
    .invite-url { flex: 1; font-family: 'JetBrains Mono', monospace; font-size: 11px;
      color: var(--t2); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .invite-note { font-size: 11px; color: var(--t3); text-align: center; }

    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.45);
      display: flex; align-items: center; justify-content: center; z-index: 200; }
    .modal-card { width: min(380px,94vw); background: var(--card); border-radius: var(--r);
      border: 0.5px solid var(--b); overflow: hidden; }
    .confirm-msg { font-size: 13px; color: var(--t2); padding: 12px 16px; margin: 0; line-height: 1.5; }
    .modal-footer { display: flex; justify-content: flex-end; gap: 8px; padding: 12px 16px;
      border-top: 0.5px solid var(--b); }

    .plan-error { padding: 10px 14px; background: var(--rbg); border: 0.5px solid var(--rborder);
      border-radius: var(--rs); font-size: 12px; color: var(--red); font-weight: 500; }

    @media (max-width: 768px) {
      :host { padding: 14px; gap: 12px; }
      .page-title { font-size: 18px; }
      .approvals-grid { grid-template-columns: 1fr;
        grid-template-areas: "pending" "approved" "invite"; }
      .ap-name { font-size: 13px; }
    }
  `],
  template: `
    <ng-container *transloco="let t">
    @if (loading() && !group()) {
      <app-skeleton-loader type="card" [count]="3" />
    } @else if (!group()) {
      <app-empty-state title="Group not found" subtitle="Go back and select a group first." />
    } @else {
      @let g = group()!;

      <!-- Header -->
      <div class="page-header">
        <div>
          <div class="page-title">{{ t('approvals.title') }}</div>
          <div class="page-sub">
            {{ g.name }}
            @if (pendingMembers().length > 0) {
              · {{ t('approvals.requestsWaiting', { count: pendingMembers().length }) }}
            }
          </div>
        </div>
      </div>

      <!-- Main grid -->
      <div class="approvals-grid">

        <!-- LEFT: Pending requests -->
        <div class="card grid-pending">
          <div class="card-head">
            <div>
              <div class="card-title">{{ t('approvals.pendingRequests') }}</div>
              <div class="card-sub">{{ t('approvals.reviewApprove') }}</div>
            </div>
            @if (pendingMembers().length > 0) {
              <span class="badge badge-r">{{ pendingMembers().length }} {{ t('approvals.waitingBadge') }}</span>
            }
          </div>
          @if (loading()) {
            <div style="padding:12px 16px;">
              <app-skeleton-loader type="row" [count]="2" />
            </div>
          } @else if (pendingMembers().length === 0) {
            <div style="padding:8px;">
              <app-empty-state [title]="t('approvals.allCaughtUp')" [subtitle]="t('approvals.noPending')" />
            </div>
          } @else {
            @for (m of pendingMembers(); track m.id) {
              <div class="ap-row">
                <div class="av av-lg" [class]="'av-' + m.profile.avatar_color">{{ m.profile.initials }}</div>
                <div class="ap-info">
                  <div class="ap-name">{{ m.profile.name }}</div>
                  <div class="ap-meta">{{ m.profile.phone }} · {{ m.profile.email }}</div>
                  <div class="ap-meta">Requested {{ m.joined_at | date:'d MMM' }} · via {{ m.request_source | titlecase }}</div>
                </div>
                <div class="ap-btns">
                  <button class="btn-approve" (click)="approve(m)">{{ t('approvals.approve') }}</button>
                  <button class="btn-reject"  (click)="openReject(m)">{{ t('approvals.reject') }}</button>
                </div>
              </div>
            }
          }
        </div>

        <!-- RIGHT TOP: Approved members -->
        <div class="card grid-approved">
          <div class="card-head">
            <div class="card-title">{{ t('approvals.approvedMembers') }}</div>
            <span class="badge badge-g">{{ approvedMembers().length }} of {{ g.member_count }}</span>
          </div>
          @if (loading()) {
            <div style="padding:12px 16px;">
              <app-skeleton-loader type="row" [count]="4" />
            </div>
          } @else if (approvedMembers().length === 0) {
            <div style="padding:8px;">
              <app-empty-state [title]="t('approvals.noApprovedTitle')" [subtitle]="t('approvals.noApprovedSub')" />
            </div>
          } @else {
            @for (m of approvedMembers(); track m.id) {
              <div class="member-row">
                <div class="av av-sm" [class]="'av-' + m.profile.avatar_color">{{ m.profile.initials }}</div>
                <div class="mr-info">
                  <div class="mr-name">{{ m.profile.name }}</div>
                  <div class="mr-meta">{{ m.profile.phone }}</div>
                </div>
                @if (m.role === 'owner') {
                  <span class="badge badge-o">{{ t('approvals.organiser') }}</span>
                } @else {
                  <span class="badge badge-g">{{ t('approvals.approvedBadge') }}</span>
                }
              </div>
            }
          }
        </div>

        <!-- RIGHT BOTTOM: Invite link -->
        <div class="card grid-invite">
          <div class="card-head"><div class="card-title">{{ t('approvals.inviteLink') }}</div></div>
          <div class="invite-body">
            <div class="invite-box">
              <span class="invite-url">{{ inviteUrl }}</span>
              <button class="btn-sm btn-sm-o" (click)="copyLink()">{{ t('approvals.copy') }}</button>
            </div>
            <app-whatsapp-share-btn
              [groupName]="g.name"
              [organizerName]="ownerMember()?.profile?.name ?? 'Organiser'"
              [contributionAmount]="g.contribution_amount"
              [frequency]="g.frequency"
              [startDate]="g.start_date"
              [inviteUrl]="inviteUrl"
              [memberCount]="g.member_count" />
            <div class="invite-note">{{ t('approvals.linkExpiry') }}</div>
          </div>
        </div>

      </div>

      <!-- Reject confirm overlay -->
      @if (rejectTarget(); as m) {
        <div class="modal-overlay" (click)="rejectTarget.set(null)">
          <div class="modal-card" (click)="$event.stopPropagation()">
            <div class="card-head"><div class="card-title">{{ t('approvals.rejectModalTitle') }}</div></div>
            <p class="confirm-msg">Rejecting <strong>{{ m.profile.name }}</strong>'s request to join.</p>
            <div style="padding:0 16px 12px;">
              <textarea class="form-input" rows="3" [placeholder]="t('approvals.rejectReason')"
                [value]="rejectReason()"
                (input)="rejectReason.set($any($event.target).value)"></textarea>
            </div>
            <div class="modal-footer">
              <button class="btn-sm btn-sm-o" (click)="rejectTarget.set(null)">{{ t('approvals.cancel') }}</button>
              <button class="btn-sm btn-sm-r" (click)="confirmReject()">{{ t('approvals.confirmReject') }}</button>
            </div>
          </div>
        </div>
      }

      @if (planError()) {
        <div class="plan-error">{{ planError() }}</div>
      }
    }
    </ng-container>
  `,
})
export class MemberApprovalsPage {
  private store  = inject(ConsoleStore);
  private route  = inject(ActivatedRoute);
  private ui     = inject(UIStore);

  group   = this.store.selectedGroup;
  loading = this.store.loading;

  allMembers      = computed(() => this.store.members() as EnrichedMember[]);
  pendingMembers  = computed(() => this.allMembers().filter(m => m.approval_status === 'pending'));
  approvedMembers = computed(() => this.allMembers().filter(m => m.approval_status === 'approved'));
  ownerMember     = computed(() => this.allMembers().find(m => m.role === 'owner') ?? null);

  rejectTarget = signal<EnrichedMember | null>(null);
  rejectReason = signal('');
  planError    = signal('');

  readonly inviteUrl = 'https://chitos.app/join/tok-ghi789jkl';

  constructor() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.store.loadGroup(id);
    this.store.loadMembers(id);
  }

  async approve(m: EnrichedMember) {
    if (this.approvedMembers().length >= FREE_MAX_MEMBERS) {
      this.planError.set(`Free plan allows up to ${FREE_MAX_MEMBERS} members per group. Upgrade to add more.`);
      return;
    }
    this.planError.set('');
    await this.store.approveMember(m.id);
  }

  openReject(m: EnrichedMember) {
    this.rejectTarget.set(m);
    this.rejectReason.set('');
  }

  async confirmReject() {
    const m = this.rejectTarget();
    if (!m) return;
    await this.store.rejectMember(m.id, this.rejectReason());
    this.rejectTarget.set(null);
  }

  async copyLink() {
    await navigator.clipboard.writeText(this.inviteUrl);
    this.ui.addToast('Invite link copied', 'info');
  }
}
