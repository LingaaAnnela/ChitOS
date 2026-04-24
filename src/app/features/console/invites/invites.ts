import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';
import { ConsoleStore } from '../console.store';
import { WhatsAppShareBtnComponent } from '@shared/components/whatsapp-share-btn';
import { EmptyStateComponent } from '@shared/components';
import { MOCK_PROFILES } from '@core/mock/seed.data';
import type { InviteStatus } from '@core/mock/seed.data';

const BASE_URL = 'https://chitos.app/join/';

@Component({
  selector: 'app-invites-page',
  standalone: true,
  imports: [TranslocoDirective, WhatsAppShareBtnComponent, EmptyStateComponent],
  styles: [`
    :host { display: flex; flex-direction: column; padding: 20px; gap: 20px; }

    .page-title { font-family: var(--font-serif); font-size: 22px; font-weight: 300;
                  color: var(--t1); margin: 0; }
    .page-sub   { font-size: 12px; color: var(--t3); margin-top: 2px; }

    /* ── Invite link card ──────────────────────────────── */
    .link-card {
      background: var(--card); border: 0.5px solid var(--b);
      border-radius: var(--r); padding: 16px;
      display: flex; flex-direction: column; gap: 12px;
    }
    .link-card-title { font-size: 13px; font-weight: 500; color: var(--t2); }

    .link-box {
      display: flex; align-items: center; gap: 8px;
      background: var(--warm2); border: 0.5px solid var(--b2);
      border-radius: var(--rs); padding: 10px 12px;
    }
    .link-url {
      flex: 1; font-family: var(--font-mono); font-size: 12px;
      color: var(--blue); overflow: hidden; text-overflow: ellipsis;
      white-space: nowrap;
    }
    .copy-btn {
      font-size: 11px; padding: 5px 12px; border-radius: 6px;
      border: 0.5px solid var(--b2); background: var(--card);
      color: var(--t2); cursor: pointer; white-space: nowrap;
      font-family: var(--font-sans);
    }
    .copy-btn:active { opacity: 0.7; }
    .copy-btn.copied { color: var(--green); border-color: var(--gborder); }

    .link-actions { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }

    .btn-regen {
      padding: 9px 18px; border-radius: 100px;
      border: 0.5px solid var(--b2); background: var(--card);
      color: var(--t2); font-size: 13px; font-weight: 500;
      font-family: var(--font-sans); cursor: pointer;
    }
    .btn-regen:active { opacity: 0.8; }

    .link-hint { font-size: 11px; color: var(--t3); }

    /* ── Inline confirm ────────────────────────────────── */
    .confirm-bar {
      display: flex; align-items: center; gap: 10px;
      padding: 12px; background: var(--rbg); border: 0.5px solid var(--rborder);
      border-radius: var(--rs); flex-wrap: wrap;
    }
    .confirm-text { font-size: 13px; color: var(--red); flex: 1; }
    .btn-confirm-yes {
      padding: 7px 16px; border-radius: 100px; border: none;
      background: var(--red); color: #fff;
      font-size: 13px; font-weight: 500; font-family: var(--font-sans); cursor: pointer;
    }
    .btn-confirm-yes:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn-confirm-no {
      padding: 7px 16px; border-radius: 100px;
      border: 0.5px solid var(--b2); background: transparent;
      color: var(--t2); font-size: 13px; font-family: var(--font-sans); cursor: pointer;
    }

    /* ── Pending invites table ─────────────────────────── */
    .section-label {
      font-size: 11px; font-weight: 500; color: var(--t3);
      text-transform: uppercase; letter-spacing: 0.05em;
      font-family: var(--font-mono);
    }

    .invites-card {
      background: var(--card); border: 0.5px solid var(--b);
      border-radius: var(--r); overflow: hidden;
    }

    /* Desktop table */
    .inv-table { width: 100%; border-collapse: collapse; }
    .inv-table th {
      font-size: 11px; font-weight: 500; color: var(--t3);
      text-transform: uppercase; letter-spacing: 0.03em;
      font-family: var(--font-mono); padding: 10px 16px;
      text-align: left; border-bottom: 0.5px solid var(--b);
    }
    .inv-table td { padding: 12px 16px; border-bottom: 0.5px solid var(--b); vertical-align: middle; }
    .inv-table tr:last-child td { border-bottom: none; }

    .inv-name { font-size: 13px; font-weight: 500; color: var(--t1); }
    .inv-phone { font-size: 11px; color: var(--t3); font-family: var(--font-mono); margin-top: 1px; }

    /* Mobile card list — hidden on desktop */
    .inv-list { display: none; }
    .inv-row {
      display: flex; align-items: center; gap: 12px;
      padding: 12px 14px; border-bottom: 0.5px solid var(--b);
    }
    .inv-row:last-child { border-bottom: none; }
    .inv-info { flex: 1; min-width: 0; }
    .inv-meta { font-size: 11px; color: var(--t3); margin-top: 2px; }

    /* Badges */
    .badge { display: inline-flex; align-items: center;
             padding: 3px 10px; border-radius: 100px; font-size: 11px; font-weight: 500; }
    .badge-pending  { background: var(--abg);   color: var(--amber); border: 0.5px solid var(--aborder); }
    .badge-accepted { background: var(--gbg);   color: var(--green); border: 0.5px solid var(--gborder); }
    .badge-expired  { background: var(--warm2); color: var(--t3);    border: 0.5px solid var(--b2); }

    /* Revoke button */
    .btn-revoke {
      font-size: 12px; padding: 5px 12px; border-radius: 100px;
      border: 0.5px solid var(--rborder); background: transparent;
      color: var(--red); cursor: pointer; font-family: var(--font-sans);
      white-space: nowrap;
    }
    .btn-revoke:active { opacity: 0.7; }

    /* Responsive */
    @media (max-width: 767px) {
      :host { padding: 14px; gap: 16px; }
      .page-title { font-size: 18px; }
      .inv-table { display: none; }
      .inv-list { display: block; }
    }
  `],
  template: `
    <ng-container *transloco="let t">

      <!-- Header -->
      <div>
        <h1 class="page-title">{{ t('invites.heading') }}</h1>
        @if (group()) {
          <p class="page-sub">{{ group()!.name }}</p>
        }
      </div>

      <!-- Invite link card -->
      <div class="link-card">
        <span class="link-card-title">{{ t('invites.linkTitle') }}</span>

        <div class="link-box">
          <span class="link-url">{{ inviteUrl() }}</span>
          <button class="copy-btn" [class.copied]="copied()" type="button" (click)="copyLink()">
            {{ copied() ? t('invites.copied') : t('invites.copy') }}
          </button>
        </div>

        <div class="link-actions">
          <app-whatsapp-share-btn
            [groupName]="group()?.name ?? ''"
            [organizerName]="organizerName()"
            [contributionAmount]="group()?.contribution_amount ?? 0"
            [frequency]="group()?.frequency ?? 'monthly'"
            [startDate]="group()?.start_date ?? ''"
            [inviteUrl]="inviteUrl()"
            [memberCount]="group()?.max_members ?? 0"
          />

          @if (!confirmRegen()) {
            <button class="btn-regen" type="button" (click)="confirmRegen.set(true)">
              {{ t('invites.regenerate') }}
            </button>
          }
        </div>

        @if (confirmRegen()) {
          <div class="confirm-bar">
            <span class="confirm-text">{{ t('invites.regenConfirm') }}</span>
            <button class="btn-confirm-no" type="button" (click)="confirmRegen.set(false)">
              {{ t('invites.cancel') }}
            </button>
            <button class="btn-confirm-yes" type="button"
              [disabled]="regenerating()" (click)="doRegenerate()">
              {{ regenerating() ? t('invites.regenerating') : t('invites.regenYes') }}
            </button>
          </div>
        }

        <span class="link-hint">{{ t('invites.linkHint') }}</span>
      </div>

      <!-- Pending invites section -->
      <span class="section-label">{{ t('invites.tableLabel', { count: invites().length }) }}</span>

      @if (invites().length === 0) {
        <app-empty-state
          [title]="t('invites.emptyTitle')"
          [subtitle]="t('invites.emptySub')"
        />
      } @else {
        <div class="invites-card">

          <!-- Desktop table -->
          <table class="inv-table">
            <thead>
              <tr>
                <th>{{ t('invites.colName') }}</th>
                <th>{{ t('invites.colDate') }}</th>
                <th>{{ t('invites.colStatus') }}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              @for (inv of invites(); track inv.id) {
                <tr>
                  <td>
                    <div class="inv-name">{{ inv.invitee_name }}</div>
                    <div class="inv-phone">{{ inv.phone }}</div>
                  </td>
                  <td>{{ formatDate(inv.invited_at) }}</td>
                  <td><span [class]="badgeClass(inv.status)">{{ t('invites.status_' + inv.status) }}</span></td>
                  <td>
                    @if (inv.status === 'pending') {
                      <button class="btn-revoke" type="button" (click)="revoke(inv.id)">
                        {{ t('invites.revoke') }}
                      </button>
                    }
                  </td>
                </tr>
              }
            </tbody>
          </table>

          <!-- Mobile card list -->
          <div class="inv-list">
            @for (inv of invites(); track inv.id) {
              <div class="inv-row">
                <div class="inv-info">
                  <div class="inv-name">{{ inv.invitee_name }}</div>
                  <div class="inv-meta">{{ inv.phone }} · {{ formatDate(inv.invited_at) }}</div>
                </div>
                <span [class]="badgeClass(inv.status)">{{ t('invites.status_' + inv.status) }}</span>
                @if (inv.status === 'pending') {
                  <button class="btn-revoke" type="button" (click)="revoke(inv.id)">
                    {{ t('invites.revoke') }}
                  </button>
                }
              </div>
            }
          </div>

        </div>
      }

    </ng-container>
  `,
})
export class InvitesPage implements OnInit {
  private route = inject(ActivatedRoute);
  private store = inject(ConsoleStore);

  group   = this.store.selectedGroup;
  invites = this.store.invites;

  copied      = signal(false);
  confirmRegen = signal(false);
  regenerating = signal(false);

  private groupId = '';

  inviteUrl = computed(() => {
    const token = this.group()?.join_token;
    return token ? `${BASE_URL}${token}` : '';
  });

  organizerName = computed(() => {
    const g = this.group();
    if (!g) return '';
    const profile = MOCK_PROFILES.find(p => p.id === g.tenant_id) ?? MOCK_PROFILES[0];
    return profile.name;
  });

  ngOnInit() {
    this.groupId = this.route.snapshot.paramMap.get('id') ?? '';
    this.store.loadGroup(this.groupId);
    this.store.loadInvites(this.groupId);
  }

  copyLink(): void {
    const url = this.inviteUrl();
    if (!url) return;
    navigator.clipboard.writeText(url).then(() => {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    });
  }

  async doRegenerate(): Promise<void> {
    if (this.regenerating()) return;
    this.regenerating.set(true);
    try {
      await this.store.regenerateInviteToken(this.groupId);
      this.confirmRegen.set(false);
    } finally {
      this.regenerating.set(false);
    }
  }

  revoke(inviteId: string): void {
    this.store.revokeInvite(inviteId);
  }

  badgeClass(status: InviteStatus): string {
    return `badge badge-${status}`;
  }

  formatDate(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }
}
