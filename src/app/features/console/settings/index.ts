import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoDirective, TranslocoService } from '@jsverse/transloco';
import { AuthStore } from '@core/stores/auth.store';
import { ToastService } from '@core/services/toast.service';
import { LanguageSwitcherComponent } from '@shared/components/language-switcher';
import { ConfirmDialog } from '@shared/components/confirm-dialog';
import { FREE_MAX_GROUPS, FREE_MAX_MEMBERS } from '@core/config/plan.config';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [TranslocoDirective, RouterLink, LanguageSwitcherComponent, ConfirmDialog],
  styles: [`
    :host {
      display: flex; flex-direction: column;
      padding: 20px 16px; gap: 16px;
      max-width: 600px; width: 100%;
    }

    /* ── Page header ─────────────────────────────────────── */
    .page-title {
      font-family: var(--font-serif); font-weight: 300;
      font-size: 22px; color: var(--t1); margin-bottom: 4px;
    }

    /* ── Cards ───────────────────────────────────────────── */
    .card {
      background: var(--card); border: 0.5px solid var(--b);
      border-radius: var(--r); overflow: hidden;
    }
    .card-danger { border-color: var(--rb); }

    .card-hdr {
      display: flex; align-items: center; justify-content: space-between;
      padding: 14px 16px; border-bottom: 0.5px solid var(--b);
      background: var(--warm2);
    }
    .card-title {
      font-size: 11px; font-weight: 500; text-transform: uppercase;
      letter-spacing: 0.5px; color: var(--t3); font-family: var(--font-mono);
    }
    .card-title-danger { color: var(--red); }
    .card-body { padding: 16px; display: flex; flex-direction: column; gap: 12px; }

    /* ── Profile ─────────────────────────────────────────── */
    .avatar-row {
      display: flex; align-items: center; gap: 12px; margin-bottom: 4px;
    }
    .av-xl {
      width: 52px; height: 52px; border-radius: 50%; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      font-size: 16px; font-weight: 500;
    }
    .avatar-hint { font-size: 11px; color: var(--t3); cursor: pointer; }
    .avatar-hint:hover { color: var(--blue); }

    .field-row {
      display: flex; align-items: center; justify-content: space-between;
      min-height: 36px; gap: 8px;
    }
    .field-lbl { font-size: 12px; color: var(--t3); flex-shrink: 0; min-width: 80px; }
    .field-val { font-size: 13px; color: var(--t1); text-align: right; word-break: break-all; }
    .field-val.mono { font-family: var(--font-mono); }

    .field-group { display: flex; flex-direction: column; gap: 4px; }
    .field-label { font-size: 11px; color: var(--t3); font-weight: 500; }
    .field-input {
      padding: 8px 10px; border: 0.5px solid var(--b2);
      border-radius: var(--rs); font-size: 13px; color: var(--t1);
      font-family: var(--font-sans); background: var(--card);
      outline: none; width: 100%;
    }
    .field-input:focus { border-color: var(--green); }
    .field-input[readonly] {
      background: var(--warm2); color: var(--t3); cursor: not-allowed;
    }

    .edit-actions { display: flex; gap: 8px; padding-top: 4px; }
    .btn-primary {
      padding: 8px 18px; border: none; border-radius: var(--rs);
      background: var(--t1); color: #fff; font-size: 13px; font-weight: 500;
      font-family: var(--font-sans); cursor: pointer;
    }
    .btn-primary:hover { opacity: 0.88; }
    .btn-ghost {
      padding: 8px 14px; border: 0.5px solid var(--b2); border-radius: var(--rs);
      background: none; color: var(--t2); font-size: 13px;
      font-family: var(--font-sans); cursor: pointer;
    }
    .btn-ghost:hover { background: var(--warm); }
    .link-btn {
      font-size: 11px; color: var(--blue); background: none;
      border: none; cursor: pointer; font-family: var(--font-sans); padding: 0;
    }
    .link-btn:hover { text-decoration: underline; }

    /* ── Plan ────────────────────────────────────────────── */
    .badge-plan {
      font-size: 10px; font-weight: 500; font-family: var(--font-mono);
      padding: 2px 8px; border-radius: 100px;
    }
    .badge-free { background: var(--warm2); color: var(--t3); border: 0.5px solid var(--b2); }
    .badge-pro  { background: var(--abg);   color: var(--amber); border: 0.5px solid var(--ab); }

    .feature-list { list-style: none; display: flex; flex-direction: column; gap: 8px; }
    .feature-item {
      display: flex; align-items: center; gap: 8px;
      font-size: 13px; color: var(--t1);
    }
    .feat-check {
      width: 16px; height: 16px; flex-shrink: 0;
      stroke: var(--green); fill: none; stroke-width: 2;
      stroke-linecap: round; stroke-linejoin: round;
    }

    .upgrade-block {
      margin-top: 4px; padding: 12px 14px;
      background: var(--sfbg); border: 0.5px solid rgba(230,124,42,0.2);
      border-radius: var(--rs); display: flex; align-items: center;
      justify-content: space-between; gap: 12px; flex-wrap: wrap;
    }
    .upgrade-cta { font-size: 12px; color: var(--t2); line-height: 1.5; flex: 1; }
    .btn-upgrade {
      padding: 8px 16px; border-radius: var(--rs); border: none;
      background: var(--saffron); color: #fff; font-size: 13px; font-weight: 500;
      font-family: var(--font-sans); cursor: pointer; text-decoration: none;
      white-space: nowrap; display: inline-block;
    }
    .btn-upgrade:hover { opacity: 0.88; }

    /* ── Toggles ─────────────────────────────────────────── */
    .toggle-row {
      display: flex; align-items: center; justify-content: space-between;
      gap: 16px; min-height: 44px;
    }
    .toggle-info { display: flex; flex-direction: column; gap: 2px; }
    .toggle-lbl { font-size: 13px; color: var(--t1); font-weight: 400; }
    .toggle-desc { font-size: 11px; color: var(--t3); line-height: 1.4; }

    .toggle-btn {
      position: relative; width: 44px; height: 24px;
      border-radius: 12px; background: var(--b2);
      border: 0.5px solid var(--b2); cursor: pointer;
      transition: background 0.2s, border-color 0.2s;
      padding: 0; flex-shrink: 0;
    }
    .toggle-btn.on { background: var(--green); border-color: var(--gb); }
    .toggle-knob {
      position: absolute; top: 3px; left: 3px;
      width: 18px; height: 18px; border-radius: 50%;
      background: #fff; transition: transform 0.2s;
      pointer-events: none;
    }
    .toggle-btn.on .toggle-knob { transform: translateX(20px); }

    /* ── Language ─────────────────────────────────────────── */
    .lang-row {
      display: flex; align-items: center; justify-content: space-between;
      gap: 12px; min-height: 44px;
    }

    /* ── Danger Zone ─────────────────────────────────────── */
    .danger-row {
      display: flex; align-items: center; justify-content: space-between;
      gap: 12px; min-height: 44px; flex-wrap: wrap;
    }
    .danger-info { display: flex; flex-direction: column; gap: 2px; }
    .danger-lbl { font-size: 13px; color: var(--red); font-weight: 500; }
    .danger-desc { font-size: 11px; color: var(--t3); line-height: 1.4; }
    .btn-danger {
      padding: 8px 16px; border: 0.5px solid var(--rb);
      border-radius: var(--rs); background: none; cursor: pointer;
      font-size: 13px; color: var(--red); font-family: var(--font-sans);
      white-space: nowrap;
    }
    .btn-danger:hover { background: var(--rbg); }

    /* ── Responsive ──────────────────────────────────────── */
    @media (min-width: 768px) {
      :host { padding: 24px; }
      .page-title { font-size: 26px; }
    }
  `],
  template: `
    <ng-container *transloco="let t">
      <h1 class="page-title">{{ t('nav.settings') }}</h1>

      <!-- ── A. Profile ─────────────────────────────────── -->
      <div class="card">
        <div class="card-hdr">
          <span class="card-title">{{ t('profile') }}</span>
          @if (!editing()) {
            <button class="link-btn" type="button" (click)="startEdit()">{{ t('edit') }}</button>
          }
        </div>
        <div class="card-body">
          <div class="avatar-row">
            <div [class]="'av av-xl av-' + (authStore.profile()?.avatar_color ?? 'g')"
                 style="width:52px;height:52px;font-size:16px;">
              {{ authStore.profile()?.initials ?? '?' }}
            </div>
            <span class="avatar-hint">{{ t('settings.addPhoto') }}</span>
          </div>

          @if (editing()) {
            <div class="field-group">
              <label class="field-label">{{ t('fullName') }}</label>
              <input class="field-input" type="text"
                     [value]="editName()"
                     (input)="editName.set($any($event.target).value)">
            </div>
            <div class="field-group">
              <label class="field-label">{{ t('phone') }}</label>
              <input class="field-input" type="tel"
                     [value]="editPhone()"
                     (input)="editPhone.set($any($event.target).value)">
            </div>
            <div class="field-group">
              <label class="field-label">{{ t('email') }}</label>
              <input class="field-input" type="email" readonly
                     [value]="authStore.profile()?.email ?? ''">
            </div>
            <div class="edit-actions">
              <button class="btn-primary" type="button" (click)="saveProfile()">{{ t('save') }}</button>
              <button class="btn-ghost"   type="button" (click)="editing.set(false)">{{ t('cancel') }}</button>
            </div>
          } @else {
            <div class="field-row">
              <span class="field-lbl">{{ t('fullName') }}</span>
              <span class="field-val">{{ authStore.profile()?.name ?? '—' }}</span>
            </div>
            <div class="field-row">
              <span class="field-lbl">{{ t('phone') }}</span>
              <span class="field-val mono">{{ authStore.profile()?.phone ?? '—' }}</span>
            </div>
            <div class="field-row">
              <span class="field-lbl">{{ t('email') }}</span>
              <span class="field-val">{{ authStore.profile()?.email ?? '—' }}</span>
            </div>
          }
        </div>
      </div>

      <!-- ── B. Plan ─────────────────────────────────────── -->
      <div class="card">
        <div class="card-hdr">
          <span class="card-title">{{ t('plan') }}</span>
          @if (isPro()) {
            <span class="badge-plan badge-pro">Pro</span>
          } @else {
            <span class="badge-plan badge-free">{{ t('freePlan') }}</span>
          }
        </div>
        <div class="card-body">
          <ul class="feature-list">
            @for (key of planFeatureKeys(); track key) {
              <li class="feature-item">
                <svg class="feat-check" viewBox="0 0 24 24">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                {{ t(key) }}
              </li>
            }
          </ul>
          @if (!isPro()) {
            <div class="upgrade-block">
              <span class="upgrade-cta">{{ t('settings.upgradeCta') }}</span>
              <a class="btn-upgrade" routerLink="/landing" fragment="pricing">
                {{ t('settings.upgradeBtn') }}
              </a>
            </div>
          }
        </div>
      </div>

      <!-- ── C. Notifications ────────────────────────────── -->
      <div class="card">
        <div class="card-hdr">
          <span class="card-title">{{ t('notifications') }}</span>
        </div>
        <div class="card-body">
          <div class="toggle-row">
            <div class="toggle-info">
              <span class="toggle-lbl">{{ t('settings.whatsappAlerts') }}</span>
              <span class="toggle-desc">{{ t('settings.whatsappAlertsDesc') }}</span>
            </div>
            <button class="toggle-btn" [class.on]="whatsappAlerts()"
                    type="button" role="switch" [attr.aria-checked]="whatsappAlerts()"
                    (click)="toggleWhatsapp()">
              <div class="toggle-knob"></div>
            </button>
          </div>
          <div class="toggle-row" style="border-top: 0.5px solid var(--b); padding-top: 12px; margin-top: 0;">
            <div class="toggle-info">
              <span class="toggle-lbl">{{ t('settings.emailAlerts') }}</span>
              <span class="toggle-desc">{{ t('settings.emailAlertsDesc') }}</span>
            </div>
            <button class="toggle-btn" [class.on]="emailAlerts()"
                    type="button" role="switch" [attr.aria-checked]="emailAlerts()"
                    (click)="toggleEmail()">
              <div class="toggle-knob"></div>
            </button>
          </div>
        </div>
      </div>

      <!-- ── D. Language ─────────────────────────────────── -->
      <div class="card">
        <div class="card-hdr">
          <span class="card-title">{{ t('language') }}</span>
        </div>
        <div class="card-body">
          <div class="lang-row">
            <span class="toggle-lbl">{{ t('languageDesc') }}</span>
            <app-language-switcher />
          </div>
        </div>
      </div>

      <!-- ── E. Danger Zone ──────────────────────────────── -->
      <div class="card card-danger">
        <div class="card-hdr">
          <span class="card-title card-title-danger">{{ t('dangerZone') }}</span>
        </div>
        <div class="card-body">
          <div class="danger-row">
            <div class="danger-info">
              <span class="danger-lbl">{{ t('deleteAccount') }}</span>
              <span class="danger-desc">{{ t('deleteAccountDesc') }}</span>
            </div>
            <button class="btn-danger" type="button" (click)="showDeleteDialog.set(true)">
              {{ t('delete') }}
            </button>
          </div>
        </div>
      </div>

      @if (showDeleteDialog()) {
        <app-confirm-dialog
          [title]="t('confirmDeleteTitle')"
          [message]="t('confirmDeleteDesc')"
          [confirmLabel]="t('settings.deleteConfirmBtn')"
          [cancelLabel]="t('cancel')"
          [danger]="true"
          (confirmed)="onDeleteConfirmed()"
          (cancelled)="showDeleteDialog.set(false)"
        />
      }
    </ng-container>
  `,
})
export class SettingsPage {
  protected authStore = inject(AuthStore);
  private   toast     = inject(ToastService);
  private   transloco = inject(TranslocoService);

  readonly freeMax = FREE_MAX_GROUPS;
  readonly memMax  = FREE_MAX_MEMBERS;

  editing   = signal(false);
  editName  = signal('');
  editPhone = signal('');

  whatsappAlerts = computed(() => this.authStore.notifWhatsapp());
  emailAlerts    = computed(() => this.authStore.notifEmail());

  showDeleteDialog = signal(false);

  isPro = computed(() => this.authStore.tenant()?.plan === 'pro');

  private readonly freePlanKeys = [
    'settings.freeFeature1',
    'settings.freeFeature2',
    'settings.freeFeature3',
    'settings.freeFeature4',
  ];
  private readonly proPlanKeys = [
    'settings.proFeature1',
    'settings.proFeature2',
    'settings.proFeature3',
    'settings.proFeature4',
    'settings.proFeature5',
    'settings.proFeature6',
  ];

  planFeatureKeys = computed(() =>
    this.isPro() ? this.proPlanKeys : this.freePlanKeys,
  );

  startEdit() {
    const p = this.authStore.profile();
    this.editName.set(p?.name ?? '');
    this.editPhone.set(p?.phone ?? '');
    this.editing.set(true);
  }

  saveProfile() {
    this.authStore.updateProfile({ name: this.editName(), phone: this.editPhone() });
    this.editing.set(false);
    this.toast.show(this.transloco.translate('settings.profileSaved'), 'success');
  }

  toggleWhatsapp() {
    this.authStore.updateNotifications({ whatsapp: !this.authStore.notifWhatsapp() });
    this.toast.show(this.transloco.translate('settings.notifSaved'), 'success');
  }

  toggleEmail() {
    this.authStore.updateNotifications({ email: !this.authStore.notifEmail() });
    this.toast.show(this.transloco.translate('settings.notifSaved'), 'success');
  }

  onDeleteConfirmed() {
    this.showDeleteDialog.set(false);
    this.authStore.signOut();
  }
}
