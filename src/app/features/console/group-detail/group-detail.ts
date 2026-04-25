import { Component, computed, inject, signal } from '@angular/core';
import { TitleCasePipe, DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';
import { ConsoleStore } from '../console.store';
import { UIStore } from '@core/stores/ui.store';
import { PdfService } from '@core/services/pdf.service';
import { IndianCurrencyPipe, RelativeTimePipe } from '@shared/pipes';
import {
  SkeletonLoaderComponent, EmptyStateComponent,
  PaymentMethodModalComponent, TrustScorePillComponent,
  InterestCalculatorComponent, ProgressBarComponent,
} from '@shared/components';
import type { EnrichedMember, EnrichedContribution, Contribution, Cycle, Group } from '@core/mock/seed.data';
import type { PaymentData } from '@shared/components/payment-method-modal/payment-method-modal';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

@Component({
  selector: 'app-group-detail',
  standalone: true,
  imports: [
    TitleCasePipe, DecimalPipe, IndianCurrencyPipe, RelativeTimePipe, TranslocoDirective,
    SkeletonLoaderComponent, EmptyStateComponent,
    PaymentMethodModalComponent, TrustScorePillComponent,
    InterestCalculatorComponent, ProgressBarComponent,
  ],
  styles: [`
    :host { display: flex; flex-direction: column; padding: 20px; gap: 16px; }

    .grp-header { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 10px; }
    .grp-title { font-family: Newsreader, serif; font-size: 22px; font-weight: 300; color: var(--t1); margin: 0 0 6px; }
    .badges-row { display: flex; gap: 6px; align-items: center; flex-wrap: wrap; margin-bottom: 4px; }
    .grp-meta { font-size: 12px; color: var(--t2); margin: 4px 0 0; }
    .hdr-btns { display: flex; gap: 8px; align-items: flex-start; flex-shrink: 0; flex-wrap: wrap; }

    .stats2 { display: flex; gap: 8px; overflow-x: auto; scrollbar-width: none; }
    .stats2 .sc { flex: 1; min-width: 80px; }
    .sc-l { font-size: 10px; color: var(--t3); text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 4px; }
    .sc-v { font-family: Newsreader, serif; font-size: 20px; font-weight: 300; line-height: 1.1; }
    .sc-v.g { color: var(--green); } .sc-v.r { color: var(--red); } .sc-v.a { color: var(--amber); }
    .sc-s { font-size: 10px; color: var(--t3); margin-top: 2px; }

    .sec-hdr { display: flex; justify-content: space-between; align-items: center; }
    .sec-title { font-size: 13px; font-weight: 500; color: var(--t1); }
    .sec-link { font-size: 12px; color: var(--blue); cursor: pointer; }

    .timeline { display: flex; gap: 10px; overflow-x: auto; -webkit-overflow-scrolling: touch;
      scrollbar-width: none; padding: 16px; }
    .tl-item { display: flex; flex-direction: column; align-items: center; gap: 6px; min-width: 54px; }
    .tl-circle { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center;
      justify-content: center; font-size: 11px; font-weight: 500; flex-shrink: 0; text-align: center; }
    .tl-done   { background: var(--gbg); border: 1.5px solid var(--green); color: var(--green); }
    .tl-active { background: var(--bbg); border: 2px solid var(--blue); color: var(--blue); }
    .tl-future { background: var(--warm2); border: 1.5px dashed var(--b3); color: var(--t3); }
    .tl-label  { font-size: 9px; text-align: center; color: var(--t3); line-height: 1.3; }
    .tl-label.g { color: var(--green); font-weight: 500; }
    .tl-label.b { color: var(--blue); font-weight: 500; }

    .acc-header { display: flex; justify-content: space-between; align-items: center;
      padding: 12px 16px; cursor: pointer; border-bottom: 0.5px solid var(--b); }
    .acc-header:hover { background: var(--warm); }
    .chev { transition: transform 200ms; width: 16px; height: 16px; color: var(--t3); flex-shrink: 0; }
    .chev.open { transform: rotate(180deg); }
    .acc-body { display: none; } .acc-body.open { display: block; }

    .member-row { display: flex; gap: 12px; padding: 11px 16px; border-bottom: 0.5px solid var(--b);
      cursor: pointer; align-items: center; }
    .member-row:last-child { border-bottom: none; }
    .member-row:hover { background: var(--warm); }
    .mr-info { flex: 1; min-width: 0; }
    .mr-name { font-size: 13px; font-weight: 500; color: var(--t1); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .mr-meta { font-size: 11px; color: var(--t2); margin-top: 2px; }
    .mr-right { display: flex; gap: 8px; align-items: center; flex-shrink: 0; flex-wrap: wrap; justify-content: flex-end; }

    .act-row { display: flex; gap: 10px; padding: 10px 16px; border-bottom: 0.5px solid var(--b); align-items: flex-start; }
    .act-row:last-child { border-bottom: none; }
    .act-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; margin-top: 3px; background: var(--blue); }
    .act-body { flex: 1; min-width: 0; }
    .act-text { font-size: 12px; color: var(--t1); line-height: 1.4; }
    .act-meta { font-size: 10px; color: var(--t3); font-family: 'JetBrains Mono', monospace; margin-top: 2px; }

    .int-rows { display: flex; flex-direction: column; gap: 8px; padding: 12px 16px; }
    .int-row { display: flex; justify-content: space-between; align-items: center;
      background: var(--warm2); border-radius: var(--rs); padding: 10px; gap: 8px; }
    .int-label { font-size: 12px; font-weight: 500; color: var(--t1); }
    .int-pos { font-size: 11px; color: var(--t2); margin-top: 2px; }
    .int-amt { font-size: 16px; font-weight: 500; }
    .int-amt.r { color: var(--red); } .int-amt.g { color: var(--green); }

    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.45); display: flex;
      align-items: center; justify-content: center; z-index: 200; padding: 16px; }
    .modal-card { width: min(360px,94vw); background: var(--card); border-radius: var(--r);
      border: 0.5px solid var(--b); overflow: hidden; }
    .ann-input { width: 100%; box-sizing: border-box; padding: 12px 16px; border: none;
      border-top: 0.5px solid var(--b); resize: none; font-size: 13px; color: var(--t1);
      background: var(--warm); font-family: inherit; display: block; }
    .ann-input:focus { outline: none; background: #fff; }
    .modal-footer { display: flex; justify-content: flex-end; gap: 8px; padding: 12px 16px;
      border-top: 0.5px solid var(--b); }

    /* ── Completed view ────────────────────────────────────── */
    .comp-banner {
      background: var(--sfbg); border: 0.5px solid rgba(230,124,42,0.25);
      border-radius: var(--r); padding: 20px 24px;
      display: flex; align-items: center; gap: 16px;
    }
    .comp-icon {
      width: 44px; height: 44px; border-radius: 50%; background: #fff;
      border: 0.5px solid rgba(230,124,42,0.2); display: flex; align-items: center;
      justify-content: center; flex-shrink: 0;
    }
    .comp-title { font-family: Newsreader, serif; font-size: 18px; font-weight: 300; color: var(--saffron); }
    .comp-meta  { font-size: 12px; color: var(--t2); margin-top: 3px; }

    .payout-tbl {
      background: var(--card); border: 0.5px solid var(--b);
      border-radius: var(--r); overflow: hidden;
    }
    .pt-head {
      display: grid; grid-template-columns: 2fr 70px 110px 110px;
      padding: 9px 16px; border-bottom: 0.5px solid var(--b); background: var(--warm2);
    }
    .pt-hcell {
      font-size: 10px; color: var(--t3); font-weight: 500;
      text-transform: uppercase; letter-spacing: 0.4px; font-family: var(--font-mono);
    }
    .pt-row {
      display: grid; grid-template-columns: 2fr 70px 110px 110px;
      padding: 11px 16px; border-bottom: 0.5px solid var(--b); align-items: center;
    }
    .pt-row:last-child { border-bottom: none; }
    .pt-cell { font-size: 12px; color: var(--t1); }
    .pt-cycle { font-family: var(--font-mono); font-size: 11px; color: var(--t3); }

    @media (max-width: 768px) {
      .pt-head { grid-template-columns: 1fr 60px 90px; }
      .pt-row  { grid-template-columns: 1fr 60px 90px; }
      .pt-hcell:last-child { display: none; }
      .pt-row > *:last-child { display: none; }
      .comp-banner { padding: 14px 16px; gap: 12px; }
      .comp-title  { font-size: 16px; }
    }

    /* ── Inviting view ─────────────────────────────────────── */
    .check-item { display:flex; align-items:center; gap:10px; padding:10px; border-radius:var(--rs); }
    .check-item.ci-done { background:var(--gbg); border:0.5px solid var(--gborder); }
    .check-item.ci-warn { background:var(--abg); border:0.5px solid var(--aborder); }
    .check-item.ci-todo { background:var(--warm2); border:0.5px solid var(--b2); }
    .check-icon { width:20px; height:20px; border-radius:50%; display:flex; align-items:center;
      justify-content:center; flex-shrink:0; font-size:11px; font-weight:600; }
    .ci-icon-done { background:var(--green); }
    .ci-icon-warn { background:var(--amber); color:#fff; }
    .ci-icon-num  { background:var(--b2); color:var(--t3); font-size:10px; }
    .ci-title-done { font-size:13px; font-weight:500; color:#15803D; }
    .ci-title-warn { font-size:13px; font-weight:500; color:#92400E; }
    .ci-title-todo { font-size:13px; font-weight:500; color:var(--t2); }
    .ci-sub-done { font-size:11px; color:#16A34A; margin-top:2px; }
    .ci-sub-warn { font-size:11px; color:#B45309; margin-top:2px; }
    .ci-sub-todo { font-size:11px; color:var(--t3); margin-top:2px; }
    .ci-body { flex:1; min-width:0; }

    .slot-empty { width:32px; height:32px; border-radius:50%; border:1.5px dashed var(--b3);
      flex-shrink:0; background:var(--warm2); }
    .slot-empty-name { font-size:13px; color:var(--t3); font-style:italic; }

    .prog-label { font-size:12px; color:var(--t2); white-space:nowrap; }

    @media (max-width: 768px) {
      :host { padding: 14px; gap: 12px; }
      .grp-title { font-size: 18px; }
      .hdr-btns { width: 100%; }
      .stats-row { display: none !important; }
      .two-col { grid-template-columns: 1fr; }
    }
    @media (min-width: 769px) {
      .stats2 { display: none !important; }
    }
  `],
  template: `
    <ng-container *transloco="let t">
    @if (loading()) {
      <app-skeleton-loader type="card" [count]="3" />
    }

    @if (!group() && !loading()) {
      <app-empty-state [title]="t('groupDetail.notFound')" [subtitle]="t('groupDetail.notFoundSub')" />
    }

    @if (group(); as g) {

      <!-- Header -->
      <div class="grp-header">
        <div>
          <h1 class="grp-title">{{ g.name }}</h1>
          <div class="badges-row">
            <span class="badge badge-{{ strategyVariant(g.strategy) }}">{{ g.strategy | titlecase }}</span>
            @if (activeCycle()) {
              <span class="badge badge-live">M{{ activeCycle()!.cycle_number }} · Live</span>
            } @else {
              <span class="badge badge-{{ statusVariant(g.status) }}">{{ g.status | titlecase }}</span>
            }
          </div>
          <p class="grp-meta">{{ groupMeta(g) }}</p>
        </div>
        <div class="hdr-btns">
          @if (g.status === 'inviting') {
            <button class="btn-sm btn-sm-o" (click)="navigateToInvites()">{{ t('groupDetail.inviting.inviteMembers') }}</button>
            <button class="btn-sm btn-sm-g"
              [disabled]="!isFull()"
              [attr.title]="isFull() ? null : t('groupDetail.inviting.startGroupTooltip', { needed: seatsRemaining() })"
              [style.opacity]="isFull() ? '1' : '0.5'"
              [style.cursor]="isFull() ? 'pointer' : 'not-allowed'"
              (click)="startGroup()">{{ t('groupDetail.inviting.startGroup') }}</button>
          } @else if (g.status === 'completed') {
            <button class="btn-sm btn-sm-o" (click)="downloadPdf()">{{ t('groupDetail.completed.downloadPdf') }}</button>
            <button class="btn-sm btn-sm-o" (click)="archiveGroup()">{{ t('groupDetail.completed.archive') }}</button>
          } @else {
            <button class="btn-sm btn-sm-o" (click)="postingAnnouncement.set(true)">{{ t('groupDetail.postAnnouncement') }}</button>
            <button class="btn-sm btn-sm-g" (click)="openAuction()">{{ actionLabel(g.strategy) }}</button>
          }
        </div>
      </div>

      @if (g.status === 'inviting') {

        <!-- Inviting: Stats row — desktop -->
        <div class="stats-row">
          <div class="stat-card">
            <div class="sc-lbl">{{ t('groupDetail.inviting.membersApproved') }}</div>
            <div class="sc-val g">{{ approvedMembers().length }}</div>
            <div class="sc-sub">{{ t('groupDetail.inviting.ofMaxSeats', { max: g.max_members }) }}</div>
          </div>
          <div class="stat-card">
            <div class="sc-lbl">{{ t('groupDetail.inviting.pendingApproval') }}</div>
            <div class="sc-val a">{{ pendingMembers().length }}</div>
            <div class="sc-sub">{{ t('groupDetail.inviting.actionNeeded') }}</div>
          </div>
          <div class="stat-card">
            <div class="sc-lbl">{{ t('groupDetail.inviting.seatsRemaining') }}</div>
            <div class="sc-val">{{ seatsRemaining() }}</div>
            <div class="sc-sub">{{ t('groupDetail.inviting.afterApprovals') }}</div>
          </div>
          <div class="stat-card">
            <div class="sc-lbl">{{ t('groupDetail.inviting.daysToStart') }}</div>
            <div class="sc-val">{{ daysToStart() }}</div>
            <div class="sc-sub">{{ startDateLabel(g) }}</div>
          </div>
        </div>

        <!-- Inviting: Stats — mobile -->
        <div class="card stats2">
          <div class="sc" style="padding:12px 16px;">
            <div class="sc-l">{{ t('groupDetail.inviting.membersApproved') }}</div>
            <div class="sc-v g">{{ approvedMembers().length }}</div>
          </div>
          <div class="sc" style="padding:12px 0;">
            <div class="sc-l">{{ t('groupDetail.inviting.pendingApproval') }}</div>
            <div class="sc-v a">{{ pendingMembers().length }}</div>
          </div>
          <div class="sc" style="padding:12px 0;">
            <div class="sc-l">{{ t('groupDetail.inviting.seatsRemaining') }}</div>
            <div class="sc-v">{{ seatsRemaining() }}</div>
          </div>
          <div class="sc" style="padding:12px 16px;">
            <div class="sc-l">{{ t('groupDetail.inviting.daysToStart') }}</div>
            <div class="sc-v">{{ daysToStart() }}</div>
          </div>
        </div>

        <!-- Inviting: Progress bar -->
        <div style="display:flex; align-items:center; gap:10px;">
          <app-progress-bar [value]="memberPct()" color="a" style="flex:1;" />
          <span class="prog-label">{{ approvedMembers().length }}/{{ g.max_members }} {{ t('groupDetail.inviting.membersJoined') }}</span>
        </div>

        <!-- Inviting: Two-col layout -->
        <div class="two-col">

          <!-- Getting started checklist -->
          <div class="card">
            <div class="card-head">
              <div>
                <div class="card-title">{{ t('groupDetail.inviting.checklist') }}</div>
                <div class="card-sub">{{ t('groupDetail.inviting.checklistSub') }}</div>
              </div>
            </div>
            <div style="padding:14px; display:flex; flex-direction:column; gap:10px;">

              <!-- Step 1: Group created (always done) -->
              <div class="check-item ci-done">
                <div class="check-icon ci-icon-done">
                  <svg style="width:11px;height:11px;stroke:#fff;fill:none;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round;" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <div class="ci-body">
                  <div class="ci-title-done">{{ t('groupDetail.inviting.step1') }}</div>
                  <div class="ci-sub-done">{{ g.strategy | titlecase }} · ₹{{ g.contribution_amount | number:'1.0-0' }}/month</div>
                </div>
              </div>

              <!-- Step 2: Invites sent (done if any approved members beyond owner) -->
              @if (approvedMembers().length > 1) {
                <div class="check-item ci-done">
                  <div class="check-icon ci-icon-done">
                    <svg style="width:11px;height:11px;stroke:#fff;fill:none;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round;" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <div class="ci-body">
                    <div class="ci-title-done">{{ t('groupDetail.inviting.step2') }}</div>
                    <div class="ci-sub-done">{{ approvedMembers().length - 1 }} {{ t('groupDetail.inviting.step2Sub') }}{{ pendingMembers().length > 0 ? ' · ' + pendingMembers().length + ' ' + t('groupDetail.inviting.pending') : '' }}</div>
                  </div>
                </div>
              } @else {
                <div class="check-item ci-todo">
                  <div class="check-icon ci-icon-num">2</div>
                  <div class="ci-body">
                    <div class="ci-title-todo">{{ t('groupDetail.inviting.step2') }}</div>
                    <div class="ci-sub-todo">{{ t('groupDetail.inviting.step2NotDone') }}</div>
                  </div>
                </div>
              }

              <!-- Step 3: Approve pending members -->
              @if (pendingMembers().length > 0) {
                <div class="check-item ci-warn">
                  <div class="check-icon ci-icon-warn">!</div>
                  <div class="ci-body">
                    <div class="ci-title-warn">{{ t('groupDetail.inviting.step3') }}</div>
                    <div class="ci-sub-warn">{{ pendingMembers().length }} {{ t('groupDetail.inviting.step3Sub') }}</div>
                  </div>
                  <button class="btn-sm btn-sm-a" (click)="goToApprovals()">{{ t('groupDetail.inviting.review') }} →</button>
                </div>
              } @else {
                <div class="check-item ci-done">
                  <div class="check-icon ci-icon-done">
                    <svg style="width:11px;height:11px;stroke:#fff;fill:none;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round;" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <div class="ci-body">
                    <div class="ci-title-done">{{ t('groupDetail.inviting.step3Done') }}</div>
                  </div>
                </div>
              }

              <!-- Step 4: Lock members & start (todo until full) -->
              <div class="check-item ci-todo">
                <div class="check-icon ci-icon-num">4</div>
                <div class="ci-body">
                  <div class="ci-title-todo">{{ t('groupDetail.inviting.step4') }}</div>
                  <div class="ci-sub-todo">{{ isFull() ? t('groupDetail.inviting.step4Ready') : t('groupDetail.inviting.step4NotReady') }}</div>
                </div>
              </div>

            </div>
          </div>

          <!-- Invite management: member slots -->
          <div class="card">
            <div class="card-head">
              <span class="card-title">{{ t('groupDetail.inviting.memberSlots') }}</span>
              <button class="btn-sm btn-sm-o" (click)="navigateToInvites()">{{ t('groupDetail.inviting.copyLink') }}</button>
            </div>

            <!-- Approved members -->
            @for (m of approvedMembers(); track m.id) {
              <div class="member-row">
                <div class="av av-md av-{{ m.profile.avatar_color }}">{{ m.profile.initials }}</div>
                <div class="mr-info">
                  <div class="mr-name">{{ m.profile.name }}</div>
                  <div class="mr-meta">{{ t('groupDetail.inviting.acceptedDate', { date: formatJoinDate(m.joined_at) }) }}</div>
                </div>
                <div class="mr-right">
                  <span class="badge badge-g">{{ t('groupDetail.inviting.approvedBadge') }}</span>
                </div>
              </div>
            }

            <!-- Pending members -->
            @for (m of pendingMembers(); track m.id) {
              <div class="member-row">
                <div class="av av-md av-{{ m.profile.avatar_color }}">{{ m.profile.initials }}</div>
                <div class="mr-info">
                  <div class="mr-name">{{ m.profile.name }}</div>
                  <div class="mr-meta">{{ t('groupDetail.inviting.requestedDate', { date: formatJoinDate(m.joined_at) }) }}</div>
                </div>
                <div class="mr-right">
                  <span class="badge badge-a">{{ t('groupDetail.inviting.pendingBadge') }}</span>
                </div>
              </div>
            }

            <!-- Empty slots -->
            @for (slot of emptySlots(); track slot) {
              <div class="member-row" style="cursor:default;">
                <div class="slot-empty"></div>
                <div class="mr-info">
                  <div class="slot-empty-name">{{ t('groupDetail.inviting.emptySlot') }}</div>
                </div>
              </div>
            }
          </div>

        </div>

      } @else if (g.status === 'completed') {

        <!-- ── COMPLETED VIEW ─────────────────────────────────── -->

        <!-- Completion banner -->
        <div class="comp-banner">
          <div class="comp-icon">
            <svg style="width:20px;height:20px;stroke:var(--saffron);fill:none;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round;" viewBox="0 0 24 24">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <div>
            <div class="comp-title">{{ t('groupDetail.completed.allCyclesComplete') }}</div>
            <div class="comp-meta">{{ g.name }} · {{ t('groupDetail.completed.ended') }} {{ endDateLabel() }} · {{ g.total_cycles }} {{ t('groupDetail.completed.cycles') }}</div>
          </div>
        </div>

        <!-- Completed: Stats — desktop -->
        <div class="stats-row">
          <div class="stat-card">
            <div class="sc-lbl">{{ t('groupDetail.completed.totalCollected') }}</div>
            <div class="sc-val">{{ totalCollected() | indianCurrency }}</div>
            <div class="sc-sub">{{ g.member_count }} × ₹{{ g.contribution_amount | number:'1.0-0' }} × {{ g.total_cycles }} {{ t('groupDetail.completed.cyclesSub') }}</div>
          </div>
          <div class="stat-card">
            <div class="sc-lbl">{{ t('groupDetail.completed.totalDisbursed') }}</div>
            <div class="sc-val g">{{ totalDisbursed() | indianCurrency }}</div>
            <div class="sc-sub">{{ t('groupDetail.completed.paidToWinners') }}</div>
          </div>
          <div class="stat-card">
            <div class="sc-lbl">{{ t('groupDetail.completed.duration') }}</div>
            <div class="sc-val">{{ g.total_cycles }}</div>
            <div class="sc-sub">{{ t('groupDetail.completed.months') }}</div>
          </div>
          <div class="stat-card">
            <div class="sc-lbl">{{ t('groupDetail.completed.members') }}</div>
            <div class="sc-val">{{ g.member_count }}</div>
            <div class="sc-sub">{{ t('groupDetail.completed.allReceived') }}</div>
          </div>
        </div>

        <!-- Completed: Stats — mobile -->
        <div class="card stats2">
          <div class="sc" style="padding:12px 16px;">
            <div class="sc-l">{{ t('groupDetail.completed.totalCollected') }}</div>
            <div class="sc-v">{{ totalCollected() | indianCurrency }}</div>
          </div>
          <div class="sc" style="padding:12px 0;">
            <div class="sc-l">{{ t('groupDetail.completed.totalDisbursed') }}</div>
            <div class="sc-v g">{{ totalDisbursed() | indianCurrency }}</div>
          </div>
          <div class="sc" style="padding:12px 16px;">
            <div class="sc-l">{{ t('groupDetail.completed.duration') }}</div>
            <div class="sc-v">{{ g.total_cycles }}</div>
          </div>
        </div>

        <!-- Payout history timeline -->
        <div class="sec-hdr">
          <span class="sec-title">{{ t('groupDetail.completed.payoutHistory') }}</span>
        </div>
        <div class="card">
          <div class="timeline">
            @for (c of cycles(); track c.id) {
              <div class="tl-item">
                <div class="tl-circle tl-done">{{ completedCycleInitials(c) }}</div>
                <div class="tl-label g">{{ completedCycleLabel(c) }}</div>
              </div>
            }
          </div>
        </div>

        <!-- Member payouts table -->
        <div class="sec-hdr">
          <span class="sec-title">{{ t('groupDetail.completed.memberPayouts') }}</span>
        </div>
        <div class="payout-tbl">
          <div class="pt-head">
            <div class="pt-hcell">{{ t('groupDetail.completed.colMember') }}</div>
            <div class="pt-hcell">{{ t('groupDetail.completed.colCycle') }}</div>
            <div class="pt-hcell">{{ t('groupDetail.completed.colAmount') }}</div>
            <div class="pt-hcell">{{ t('groupDetail.completed.colDate') }}</div>
          </div>
          @for (row of completedPayoutRows(); track row.cycleNumber) {
            <div class="pt-row">
              <div style="display:flex;align-items:center;gap:10px;">
                <div class="av av-sm av-{{ row.avatarColor }}">{{ row.memberInitials }}</div>
                <span class="pt-cell">{{ row.memberName }}</span>
              </div>
              <div class="pt-cycle">{{ t('groupDetail.completed.cycleLabel', { n: row.cycleNumber }) }}</div>
              <div class="pt-cell" style="color:var(--green);font-weight:500;">{{ row.amount | indianCurrency }}</div>
              <div class="pt-cell" style="color:var(--t3);">{{ row.date }}</div>
            </div>
          }
        </div>

      } @else {

        <!-- Active: Stat cards — desktop -->
        <div class="stats-row">
          <div class="stat-card">
            <div class="sc-lbl">{{ t('groupDetail.potThisMonth') }}</div>
            <div class="sc-val">{{ potValue() | indianCurrency }}</div>
            <div class="sc-sub">{{ g.member_count }} × ₹{{ g.contribution_amount | number:'1.0-0' }}</div>
          </div>
          <div class="stat-card">
            <div class="sc-lbl">{{ t('groupDetail.collected') }}</div>
            <div class="sc-val g">{{ collectedAmount() | indianCurrency }}</div>
            <div class="sc-sub">{{ paidMembers().length }} {{ t('groupDetail.paidSub') }}</div>
          </div>
          <div class="stat-card">
            <div class="sc-lbl">{{ t('groupDetail.overdue') }}</div>
            <div class="sc-val r">{{ overdueAmount() | indianCurrency }}</div>
            <div class="sc-sub">{{ overdueMembers().length }} {{ t('groupDetail.membersSub') }}</div>
          </div>
          <div class="stat-card">
            <div class="sc-lbl">{{ g.strategy === 'auction' ? t('groupDetail.auctionBids') : t('groupDetail.payouts') }}</div>
            <div class="sc-val">{{ g.strategy === 'auction' ? auctionBids().length : store.payouts().length }}</div>
            <div class="sc-sub">{{ g.strategy === 'auction' ? t('groupDetail.thisCycle') : t('groupDetail.recorded') }}</div>
          </div>
        </div>

        <!-- Active / completed: Stat cards — mobile -->
        <div class="card stats2">
          <div class="sc" style="padding:12px 16px;">
            <div class="sc-l">{{ t('groupDetail.potThisMonth') }}</div>
            <div class="sc-v">{{ potValue() | indianCurrency }}</div>
          </div>
          <div class="sc" style="padding:12px 0;">
            <div class="sc-l">{{ t('groupDetail.collected') }}</div>
            <div class="sc-v g">{{ collectedAmount() | indianCurrency }}</div>
          </div>
          <div class="sc" style="padding:12px 0;">
            <div class="sc-l">{{ t('groupDetail.overdue') }}</div>
            <div class="sc-v r">{{ overdueAmount() | indianCurrency }}</div>
          </div>
          <div class="sc" style="padding:12px 16px;">
            <div class="sc-l">{{ t('groupDetail.auctionBids') }}</div>
            <div class="sc-v">{{ auctionBids().length }}</div>
          </div>
        </div>

        <!-- Cycle timeline -->
        <div class="sec-hdr">
          <span class="sec-title">{{ t('groupDetail.cycleTimeline') }}</span>
          <span class="sec-link">{{ t('groupDetail.allCycles') }}</span>
        </div>
        <div class="card">
          <div class="timeline">
            @for (c of cycles(); track c.id) {
              <div class="tl-item">
                <div class="tl-circle {{ cycleCircleClass(c) }}">{{ cycleContent(c) }}</div>
                <div class="tl-label {{ cycleLabelClass(c) }}">{{ cycleSubLabel(c) }}</div>
              </div>
            }
          </div>
        </div>

        <!-- Members accordion -->
        <div class="sec-hdr">
          <span class="sec-title">{{ t('groupDetail.membersThisMonth') }}</span>
        </div>
        <div class="card">
          <!-- Paid section -->
          <div class="acc-header" (click)="paidOpen.update(v => !v)">
            <div>
              <div class="card-title" style="color:var(--green)">{{ t('groupDetail.paidThisMonth') }}</div>
              <div class="card-sub">{{ paidMembers().length }} {{ t('groupDetail.membersSub') }}</div>
            </div>
            <svg class="chev" [class.open]="paidOpen()" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M4 6l4 4 4-4" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="acc-body" [class.open]="paidOpen()">
            @if (paidMembers().length === 0) {
              <div style="padding:16px;font-size:13px;color:var(--t3);">{{ t('groupDetail.noPaidYet') }}</div>
            }
            @for (m of paidMembers(); track m.id) {
              <div class="member-row">
                <div class="av av-md av-{{ m.profile.avatar_color }}">{{ m.profile.initials }}</div>
                <div class="mr-info">
                  <div class="mr-name">{{ m.profile.name }}</div>
                  <div class="mr-meta">{{ memberMeta(m) }}</div>
                </div>
                <div class="mr-right">
                  <app-trust-score-pill [memberId]="m.profile_id" [groupId]="g.id" />
                  @if (m.contribution) {
                    <span class="cs cs-paid">{{ t('groupDetail.paidBadge') }}</span>
                  } @else {
                    <span class="cs cs-partial">{{ t('groupDetail.partial') }}</span>
                  }
                </div>
              </div>
            }
          </div>

          <!-- Overdue section -->
          <div class="acc-header" (click)="overdueOpen.update(v => !v)">
            <div>
              <div class="card-title" style="color:var(--red)">{{ t('groupDetail.overdueAndPending') }}</div>
              <div class="card-sub">{{ overdueMembers().length }} {{ t('groupDetail.membersSub') }}</div>
            </div>
            <svg class="chev" [class.open]="overdueOpen()" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M4 6l4 4 4-4" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="acc-body" [class.open]="overdueOpen()">
            @if (overdueMembers().length === 0) {
              <div style="padding:16px;font-size:13px;color:var(--t3);">{{ t('groupDetail.allPaidUp') }}</div>
            }
            @for (m of overdueMembers(); track m.id) {
              <div class="member-row">
                <div class="av av-md av-{{ m.profile.avatar_color }}">{{ m.profile.initials }}</div>
                <div class="mr-info">
                  <div class="mr-name">{{ m.profile.name }}</div>
                  <div class="mr-meta">{{ memberMeta(m) }}</div>
                </div>
                <div class="mr-right">
                  <app-trust-score-pill [memberId]="m.profile_id" [groupId]="g.id" />
                  @if (m.contribution?.status === 'overdue') {
                    <span class="cs cs-over">{{ t('groupDetail.overdueBadge') }}</span>
                  } @else {
                    <span class="cs cs-pending">{{ t('groupDetail.pendingBadge') }}</span>
                  }
                  @if (m.contribution) {
                    <button class="btn-sm btn-sm-g" (click)="markPaid(m.contribution)">{{ t('groupDetail.markPaid') }}</button>
                  }
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Two-col: Announcements + Interest calc -->
        <div class="two-col">

          <!-- Announcements -->
          <div class="card">
            <div class="card-head">
              <span class="card-title">{{ t('groupDetail.announcements') }}</span>
              <button class="btn-sm btn-sm-o" (click)="postingAnnouncement.set(true)">{{ t('groupDetail.postShort') }}</button>
            </div>
            @if (recentAnnouncements().length === 0) {
              <div style="padding:16px;font-size:13px;color:var(--t3);">{{ t('groupDetail.noAnnouncements') }}</div>
            }
            @for (a of recentAnnouncements(); track a.id) {
              <div class="act-row">
                <div class="act-dot"></div>
                <div class="act-body">
                  <div class="act-text">{{ a.text }}</div>
                  <div class="act-meta">{{ a.created_at | relativeTime }} · {{ a.reactions }} {{ t('groupDetail.reactions') }}</div>
                </div>
              </div>
            }
          </div>

          <!-- Interest calculator -->
          <div class="card">
            <div class="card-head">
              <span class="card-title">{{ t('groupDetail.interestCalc') }}</span>
            </div>
            <app-interest-calculator
              [principal]="g.contribution_amount"
              [annualRate]="12"
              [durationMonths]="g.member_count" />
          </div>

        </div>

      }
    }

    <!-- Payment modal -->
    @if (markingContrib()) {
      <app-payment-method-modal
        [contribution]="markingContrib()!"
        [visible]="true"
        (confirmed)="onPaymentConfirmed($event)"
        (cancelled)="cancelPayment()" />
    }

    <!-- Post announcement modal -->
    @if (postingAnnouncement()) {
      <div class="modal-overlay" (click)="postingAnnouncement.set(false)">
        <div class="modal-card" (click)="$event.stopPropagation()">
          <div class="card-head"><span class="card-title">{{ t('groupDetail.postAnnouncement') }}</span></div>
          <textarea class="ann-input" rows="4" [value]="announcementText()"
            (input)="announcementText.set($any($event.target).value)"
            [placeholder]="t('groupDetail.writeAnnouncement')"></textarea>
          <div class="modal-footer">
            <button class="btn-sm btn-sm-o" (click)="postingAnnouncement.set(false)">{{ t('groupDetail.cancel') }}</button>
            <button class="btn-sm btn-sm-g" (click)="submitAnnouncement()">{{ t('groupDetail.post') }}</button>
          </div>
        </div>
      </div>
    }
    </ng-container>
  `,
})
export class GroupDetailPage {
  store          = inject(ConsoleStore);
  private router = inject(Router);
  private route  = inject(ActivatedRoute);
  private ui     = inject(UIStore);
  private pdf    = inject(PdfService);

  // Store signals
  group         = this.store.selectedGroup;
  cycles        = this.store.cycles;
  auctionBids   = this.store.auctionBids;
  loading       = this.store.loading;

  // Local signals
  paidOpen            = signal(true);
  overdueOpen         = signal(true);
  markingContrib      = signal<EnrichedContribution | null>(null);
  postingAnnouncement = signal(false);
  announcementText    = signal('');

  // Computed
  enrichedMembers = computed(() => this.store.members() as EnrichedMember[]);
  paidMembers     = computed(() => this.enrichedMembers().filter(
    m => m.contribution?.status === 'paid' || m.contribution?.status === 'partial'
  ));
  overdueMembers  = computed(() => this.enrichedMembers().filter(
    m => !m.contribution || m.contribution.status === 'overdue' || m.contribution.status === 'pending'
  ));
  approvedMembers = computed(() => this.enrichedMembers().filter(m => m.approval_status === 'approved'));
  pendingMembers  = computed(() => this.enrichedMembers().filter(m => m.approval_status === 'pending'));
  seatsRemaining  = computed(() => {
    const g = this.group();
    return g ? Math.max(0, g.max_members - this.approvedMembers().length - this.pendingMembers().length) : 0;
  });
  isFull          = computed(() => {
    const g = this.group();
    return g ? this.approvedMembers().length >= g.max_members : false;
  });
  memberPct       = computed(() => {
    const g = this.group();
    return g ? Math.round((this.approvedMembers().length / g.max_members) * 100) : 0;
  });
  daysToStart     = computed(() => {
    const g = this.group();
    if (!g) return 0;
    const now   = new Date();
    const start = new Date(g.start_date);
    return Math.max(0, Math.ceil((start.getTime() - now.getTime()) / 86_400_000));
  });
  emptySlots      = computed(() => {
    const g = this.group();
    if (!g) return [];
    const taken = this.approvedMembers().length + this.pendingMembers().length;
    return Array.from({ length: Math.max(0, g.max_members - taken) }, (_, i) => i);
  });

  potValue        = computed(() => {
    const g = this.group(); return g ? g.contribution_amount * g.member_count : 0;
  });
  collectedAmount = computed(() =>
    this.store.contributions().reduce((sum, c) => sum + (c.amount_paid ?? 0), 0)
  );
  overdueAmount   = computed(() =>
    this.store.contributions().filter(c => c.status === 'overdue')
      .reduce((sum, c) => sum + c.amount_due, 0)
  );
  activeCycle     = computed(() => this.store.cycles().find(c => c.status === 'active') ?? null);
  recentAnnouncements = computed(() => this.store.announcements().slice(0, 3));

  // ── Completed-state computeds ─────────────────────────────────────────────
  totalCollected = computed(() => {
    const g = this.group();
    return g ? g.contribution_amount * g.member_count * g.total_cycles : 0;
  });

  totalDisbursed = computed(() =>
    this.store.cycles()
      .filter(c => c.status === 'completed')
      .reduce((sum, c) => sum + (c.payout_amount ?? 0), 0)
  );

  endDateLabel = computed(() => {
    const completed = this.store.cycles()
      .filter(c => c.status === 'completed')
      .sort((a, b) => a.cycle_number - b.cycle_number);
    const last = completed[completed.length - 1];
    if (!last) return '';
    const payouts = this.store.payouts();
    const payout  = payouts.find(p => p.cycle_id === last.id);
    return this.formatFullDate(payout?.payment_date ?? last.due_date);
  });

  completedPayoutRows = computed(() => {
    const payouts = this.store.payouts();
    return this.store.cycles()
      .filter(c => c.status === 'completed' && c.winner_profile_id)
      .sort((a, b) => a.cycle_number - b.cycle_number)
      .map(c => {
        const member = this.enrichedMembers().find(m => m.profile_id === c.winner_profile_id);
        const payout = payouts.find(p => p.cycle_id === c.id);
        return {
          memberName:     member?.profile.name     ?? '—',
          memberInitials: member?.profile.initials ?? '?',
          avatarColor:    member?.profile.avatar_color ?? 'g',
          cycleNumber:    c.cycle_number,
          amount:         c.payout_amount ?? payout?.amount ?? 0,
          date:           this.formatFullDate(payout?.payment_date ?? c.due_date),
        };
      });
  });

  constructor() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.store.loadGroup(id);
    this.store.loadMembers(id);
  }

  strategyVariant(s: string): string {
    return ({ auction: 'b', lottery: 'g', fixed: 'a', consensus: 'grey' } as Record<string, string>)[s] ?? 'grey';
  }

  statusVariant(s: string): string {
    return ({ active: 'g', inviting: 'a', completed: 'grey', paused: 'grey' } as Record<string, string>)[s] ?? 'grey';
  }

  actionLabel(strategy: string): string {
    return ({ auction: 'Open auction room', lottery: 'Run lottery', fixed: 'Payout manager', consensus: 'Start vote' } as Record<string, string>)[strategy] ?? 'Manage';
  }

  groupMeta(g: Group): string {
    const [yr, mo] = g.start_date.split('-');
    const freq = ({ monthly: 'month', weekly: 'week', fortnightly: 'fortnight' } as Record<string, string>)[g.frequency] ?? g.frequency;
    const started = `${MONTHS[+mo - 1]} ${yr}`;
    if (g.status === 'inviting') {
      return `₹${new Intl.NumberFormat('en-IN').format(g.contribution_amount)}/${freq} · ${g.strategy} · Starts ${started}`;
    }
    const ac = this.activeCycle();
    const dueStr = ac
      ? `${+ac.due_date.split('-')[2]} ${MONTHS[+ac.due_date.split('-')[1] - 1]}`
      : `${g.due_day}`;
    return `₹${new Intl.NumberFormat('en-IN').format(g.contribution_amount)}/${freq} · ${g.member_count} members · Started ${started} · Due ${dueStr}`;
  }

  startDateLabel(g: Group): string {
    const [yr, mo, dy] = g.start_date.split('-');
    return `${+dy} ${MONTHS[+mo - 1]} ${yr}`;
  }

  memberMeta(m: EnrichedMember): string {
    const p = m.profile.phone;
    return p.length === 10 ? `+91 ${p.slice(0,5)} ${p.slice(5)}` : p;
  }

  formatJoinDate(dateStr: string): string {
    const [, mo, dy] = dateStr.split('-');
    return `${+dy} ${MONTHS[+mo - 1]}`;
  }

  cycleCircleClass(c: Cycle): string {
    return ({ completed: 'tl-done', active: 'tl-active', future: 'tl-future' } as Record<string, string>)[c.status] ?? 'tl-future';
  }

  cycleLabelClass(c: Cycle): string {
    return ({ completed: 'g', active: 'b', future: '' } as Record<string, string>)[c.status] ?? '';
  }

  cycleContent(c: Cycle): string {
    if (c.status === 'active') return 'Now';
    if (c.status === 'future') {
      const parts = c.month_label.split(' · ');
      return parts[1] ?? c.month_label;
    }
    return `M${c.cycle_number}`;
  }

  cycleSubLabel(c: Cycle): string {
    if (c.status === 'completed' && c.payout_amount) {
      return `₹${Math.round(c.payout_amount / 1000)}K`;
    }
    return c.month_label.split(' · ')[0] ?? '';
  }

  markPaid(contrib: Contribution | undefined): void {
    if (!contrib) return;
    this.markingContrib.set(contrib as unknown as EnrichedContribution);
  }

  async onPaymentConfirmed(data: PaymentData): Promise<void> {
    const contrib = this.markingContrib();
    if (!contrib) return;
    await this.store.markContributionPaid(contrib.id, data as unknown as Record<string, unknown>);
    this.markingContrib.set(null);
  }

  cancelPayment(): void {
    this.markingContrib.set(null);
  }

  async submitAnnouncement(): Promise<void> {
    const text = this.announcementText().trim();
    const g = this.group();
    if (!text || !g) return;
    await this.store.postAnnouncement(g.id, text);
    this.announcementText.set('');
    this.postingAnnouncement.set(false);
  }

  openAuction(): void {
    const g = this.group();
    if (!g) return;
    const dest: Record<string, string[]> = {
      auction:   ['/console/auction'],
      lottery:   ['/console/groups', g.id, 'lottery'],
      fixed:     ['/console/groups', g.id, 'fixed'],
      consensus: ['/console/groups', g.id, 'consensus'],
    };
    this.router.navigate(dest[g.strategy] ?? ['/console/auction']);
  }

  navigateToInvites(): void {
    const g = this.group();
    if (!g) return;
    this.router.navigate(['/console/groups', g.id, 'invites']);
  }

  goToApprovals(): void {
    const g = this.group();
    if (!g) return;
    this.router.navigate(['/console/groups', g.id, 'members']);
  }

  startGroup(): void {
    const g = this.group();
    if (!g || !this.isFull()) return;
    this.store.startGroup(g.id);
  }

  // ── Completed-state helpers ───────────────────────────────────────────────

  formatFullDate(dateStr: string): string {
    const [yr, mo, dy] = dateStr.split('-');
    return `${+dy} ${MONTHS[+mo - 1]} ${yr}`;
  }

  completedCycleInitials(c: Cycle): string {
    const member = this.enrichedMembers().find(m => m.profile_id === c.winner_profile_id);
    return member?.profile.initials ?? `M${c.cycle_number}`;
  }

  completedCycleLabel(c: Cycle): string {
    const parts = c.month_label.split(' · ');
    const month = parts[0] ?? c.month_label;
    const amt   = c.payout_amount ? ` · ₹${Math.round(c.payout_amount / 1000)}K` : '';
    return `${month}${amt}`;
  }

  downloadPdf(): void {
    const g = this.group();
    if (!g) return;
    this.pdf.downloadGroupReport({
      groupName:       g.name,
      strategy:        g.strategy,
      endDate:         this.endDateLabel(),
      totalCollected:  this.totalCollected(),
      totalDisbursed:  this.totalDisbursed(),
      durationMonths:  g.total_cycles,
      memberCount:     g.member_count,
      payouts:         this.completedPayoutRows(),
    });
    this.ui.addToast('PDF report downloaded', 'success');
  }

  archiveGroup(): void {
    const g = this.group();
    if (!g) return;
    this.store.archiveGroup(g.id);
    this.router.navigate(['/console/dashboard']);
  }
}
