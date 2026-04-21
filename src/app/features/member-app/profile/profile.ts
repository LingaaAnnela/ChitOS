import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';
import { AuthStore } from '@core/stores/auth.store';
import { UIStore } from '@core/stores/ui.store';
import { LanguageSwitcherComponent } from '@shared/components';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [TranslocoDirective, LanguageSwitcherComponent],
  styles: [`
    :host { display: flex; flex-direction: column; gap: 10px; padding: 14px 14px 24px; }
    @media (min-width: 768px) {
      :host { max-width: 640px; margin: 0 auto; padding: 20px 20px 28px; width: 100%; }
    }

    /* page header */
    .page-hdr { display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px; }
    .page-title { font-family: var(--font-serif); font-size: 17px; font-weight: 300; color: var(--t1); }
    .sign-out { font-size: 11px; color: var(--blue); background: none; border: none;
                font-family: var(--font-sans); cursor: pointer; padding: 0; }

    /* avatar section */
    .avatar-section { display: flex; flex-direction: column; align-items: center;
                      padding: 8px 0 16px; gap: 10px; }
    .av-circle { width: 60px; height: 60px; border-radius: 50%; background: var(--gbg);
                 border: 1px solid var(--gb); display: flex; align-items: center;
                 justify-content: center; font-size: 18px; font-weight: 500; color: var(--green); }
    .av-name { font-family: var(--font-serif); font-size: 18px; font-weight: 300; color: var(--t1);
               text-align: center; }
    .av-contact { font-size: 12px; color: var(--t3); text-align: center; line-height: 1.6; }

    /* section header */
    .sec-hdr { display: flex; align-items: center; justify-content: space-between; }
    .sec-title { font-size: 13px; font-weight: 500; color: var(--t1); }
    .sec-title-danger { font-size: 13px; font-weight: 500; color: var(--red); }
    .sec-link { font-size: 11px; color: var(--blue); background: none; border: none;
                font-family: var(--font-sans); cursor: pointer; padding: 0; }

    /* detail rows */
    .detail-row { display: flex; align-items: center; padding: 12px 14px;
                  border-bottom: 0.5px solid var(--b); }
    .detail-row:last-child { border-bottom: none; }
    .detail-lbl { font-size: 12px; color: var(--t2); flex: 1; }
    .detail-val { font-size: 12px; font-weight: 500; color: var(--t1); }
    .detail-input { font-size: 12px; font-weight: 500; color: var(--t1); width: 160px;
                    border: 0.5px solid var(--b2); border-radius: var(--rs); padding: 5px 8px;
                    font-family: var(--font-sans); background: var(--card); outline: none; }
    .detail-input:focus { border-color: var(--green); }
    .edit-actions { display: flex; gap: 8px; padding: 10px 14px; border-top: 0.5px solid var(--b); }
    .btn-save { flex: 1; background: var(--t1); color: #fff; border: none; border-radius: var(--rs);
                padding: 9px; font-size: 12px; font-family: var(--font-sans); font-weight: 500;
                cursor: pointer; }
    .btn-cancel { flex: 1; background: none; color: var(--t2); border: 0.5px solid var(--b2);
                  border-radius: var(--rs); padding: 9px; font-size: 12px;
                  font-family: var(--font-sans); cursor: pointer; }

    /* pref rows */
    .pref-row { display: flex; align-items: center; padding: 12px 14px;
                border-bottom: 0.5px solid var(--b); }
    .pref-row:last-child { border-bottom: none; }
    .pref-info { flex: 1; }
    .pref-title { font-size: 12px; font-weight: 500; color: var(--t1); }
    .pref-desc  { font-size: 10px; color: var(--t3); margin-top: 1px; }

    /* CSS toggle */
    .toggle { width: 40px; height: 22px; border-radius: 100px; background: var(--b2);
              display: flex; align-items: center; padding: 2px; cursor: pointer;
              transition: background 0.2s; flex-shrink: 0; }
    .toggle.on { background: var(--green); }
    .toggle-knob { width: 18px; height: 18px; border-radius: 50%; background: #fff;
                   transition: transform 0.2s; }
    .toggle.on .toggle-knob { transform: translateX(18px); }

    /* org rows */
    .org-row { display: flex; align-items: center; padding: 12px 14px;
               border-bottom: 0.5px solid var(--b); }
    .org-row:last-child { border-bottom: none; }
    .org-info { flex: 1; }
    .org-name { font-size: 12px; font-weight: 500; color: var(--t1); }
    .org-sub  { font-size: 10px; color: var(--t3); margin-top: 1px; }
    .org-lbl  { font-size: 12px; color: var(--t2); flex: 1; }
    .org-val  { font-size: 12px; font-weight: 500; color: var(--t1); }
    .plan-bar-wrap { padding: 8px 14px 12px; }
    .plan-bar { height: 4px; background: var(--b2); border-radius: 2px; overflow: hidden; }
    .plan-bar-fill { height: 100%; background: var(--green); border-radius: 2px; }
    .plan-bar-labels { display: flex; justify-content: space-between; margin-top: 4px; }
    .plan-bar-lbl { font-size: 9px; color: var(--t3); }

    /* danger zone */
    .danger-row { display: flex; align-items: center; padding: 12px 14px; gap: 10px; }
    .danger-info { flex: 1; }
    .danger-title { font-size: 12px; font-weight: 500; color: var(--red); }
    .danger-desc  { font-size: 10px; color: var(--t3); margin-top: 1px; }
    .btn-delete { font-size: 10px; padding: 5px 12px; border-radius: var(--rs); font-weight: 500;
                  background: var(--rbg); color: var(--red); border: 0.5px solid var(--rb);
                  cursor: pointer; font-family: var(--font-sans); flex-shrink: 0; }

    /* delete dialog overlay */
    .dialog-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 500;
                      display: flex; align-items: center; justify-content: center; padding: 20px; }
    .dialog-box { background: var(--card); border-radius: var(--r); padding: 20px;
                  width: 100%; max-width: 340px; }
    .dialog-title { font-family: var(--font-serif); font-size: 17px; font-weight: 300;
                    color: var(--t1); margin-bottom: 8px; }
    .dialog-desc { font-size: 12px; color: var(--t2); line-height: 1.5; margin-bottom: 14px; }
    .dialog-input { width: 100%; padding: 9px 11px; border: 0.5px solid var(--b2);
                    border-radius: var(--rs); font-size: 13px; font-family: var(--font-sans);
                    color: var(--t1); background: var(--card); outline: none; margin-bottom: 12px; }
    .dialog-input:focus { border-color: var(--red); }
    .dialog-actions { display: flex; gap: 8px; }
    .btn-dialog-cancel { flex: 1; background: none; border: 0.5px solid var(--b2);
                         border-radius: var(--rs); padding: 9px; font-size: 13px;
                         font-family: var(--font-sans); cursor: pointer; color: var(--t2); }
    .btn-dialog-delete { flex: 1; background: var(--red); color: #fff; border: none;
                         border-radius: var(--rs); padding: 9px; font-size: 13px; font-weight: 500;
                         font-family: var(--font-sans); cursor: pointer; }
    .btn-dialog-delete:disabled { opacity: 0.4; cursor: default; }
  `],
  template: `
    <ng-container *transloco="let t">

      <div class="page-hdr">
        <div class="page-title">{{ t('profile') }}</div>
        <button class="sign-out" (click)="signOut()">{{ t('signOut') }}</button>
      </div>

      <!-- Avatar -->
      <div class="avatar-section">
        <div class="av-circle">{{ auth.profile()?.initials ?? '?' }}</div>
        <div>
          <div class="av-name">{{ auth.profile()?.name ?? '—' }}</div>
          <div class="av-contact">
            {{ auth.profile()?.email ?? '' }}<br>
            {{ auth.profile()?.phone ?? '' }}
          </div>
        </div>
        <span class="badge badge-grey">{{ t('freePlan') }} · {{ groupsUsed() }} of {{ maxGroups() }} groups</span>
      </div>

      <!-- Account details -->
      <div class="sec-hdr">
        <div class="sec-title">{{ t('accountDetails') }}</div>
        @if (!editing()) {
          <button class="sec-link" (click)="startEdit()">{{ t('edit') }}</button>
        }
      </div>
      <div class="card">
        <div class="detail-row">
          <div class="detail-lbl">{{ t('fullName') }}</div>
          @if (editing()) {
            <input class="detail-input" [value]="editName()"
                   (input)="editName.set($any($event.target).value)">
          } @else {
            <div class="detail-val">{{ auth.profile()?.name }}</div>
          }
        </div>
        <div class="detail-row">
          <div class="detail-lbl">{{ t('phone') }}</div>
          @if (editing()) {
            <input class="detail-input" [value]="editPhone()"
                   (input)="editPhone.set($any($event.target).value)">
          } @else {
            <div class="detail-val">{{ auth.profile()?.phone }}</div>
          }
        </div>
        <div class="detail-row">
          <div class="detail-lbl">{{ t('email') }}</div>
          @if (editing()) {
            <input class="detail-input" [value]="editEmail()"
                   (input)="editEmail.set($any($event.target).value)">
          } @else {
            <div class="detail-val">{{ auth.profile()?.email }}</div>
          }
        </div>
        @if (editing()) {
          <div class="edit-actions">
            <button class="btn-cancel" (click)="cancelEdit()">{{ t('cancel') }}</button>
            <button class="btn-save" (click)="saveEdit()">{{ t('save') }}</button>
          </div>
        }
      </div>

      <!-- Preferences -->
      <div class="sec-hdr">
        <div class="sec-title">{{ t('preferences') }}</div>
      </div>
      <div class="card">
        <div class="pref-row">
          <div class="pref-info">
            <div class="pref-title">{{ t('language') }}</div>
            <div class="pref-desc">{{ t('languageDesc') }}</div>
          </div>
          <app-language-switcher />
        </div>
        <div class="pref-row">
          <div class="pref-info">
            <div class="pref-title">{{ t('notifications') }}</div>
            <div class="pref-desc">{{ t('notifDesc') }}</div>
          </div>
          <div [class]="'toggle' + (notifEnabled() ? ' on' : '')"
               (click)="notifEnabled.set(!notifEnabled())">
            <div class="toggle-knob"></div>
          </div>
        </div>
      </div>

      <!-- Organisation -->
      <div class="sec-hdr">
        <div class="sec-title">{{ t('organisation') }}</div>
      </div>
      <div class="card">
        <div class="org-row">
          <div class="org-info">
            <div class="org-name">{{ auth.tenant()?.name ?? '—' }}</div>
            <div class="org-sub">{{ t('yourOrgAccount') }}</div>
          </div>
          <span class="badge badge-grey">{{ t('owner') }}</span>
        </div>
        <div class="org-row">
          <div class="org-lbl">{{ t('plan') }}</div>
          <div class="org-val">Free · {{ groupsUsed() }} of {{ maxGroups() }} groups</div>
        </div>
        <div class="plan-bar-wrap">
          <div class="plan-bar">
            <div class="plan-bar-fill" [style.width.%]="planPct()"></div>
          </div>
          <div class="plan-bar-labels">
            <div class="plan-bar-lbl">{{ groupsUsed() }} {{ t('groupsUsed') }}</div>
            <div class="plan-bar-lbl">{{ maxGroups() }} {{ t('maxOnFree') }}</div>
          </div>
        </div>
      </div>

      <!-- Danger zone -->
      <div class="sec-hdr">
        <div class="sec-title-danger">{{ t('dangerZone') }}</div>
      </div>
      <div class="card">
        <div class="danger-row">
          <div class="danger-info">
            <div class="danger-title">{{ t('deleteAccount') }}</div>
            <div class="danger-desc">{{ t('deleteAccountDesc') }}</div>
          </div>
          <button class="btn-delete" (click)="showDeleteDialog.set(true)">{{ t('delete') }}</button>
        </div>
      </div>

      <!-- Delete confirm dialog -->
      @if (showDeleteDialog()) {
        <div class="dialog-overlay" (click)="closeDeleteDialog()">
          <div class="dialog-box" (click)="$event.stopPropagation()">
            <div class="dialog-title">{{ t('confirmDeleteTitle') }}</div>
            <div class="dialog-desc">{{ t('confirmDeleteDesc') }}</div>
            <input class="dialog-input" [placeholder]="t('confirmDeletePlaceholder')"
                   [value]="deleteTyped()"
                   (input)="deleteTyped.set($any($event.target).value)">
            <div class="dialog-actions">
              <button class="btn-dialog-cancel" (click)="closeDeleteDialog()">{{ t('cancel') }}</button>
              <button class="btn-dialog-delete" [disabled]="deleteTyped() !== 'DELETE'"
                      (click)="confirmDelete()">{{ t('delete') }}</button>
            </div>
          </div>
        </div>
      }

    </ng-container>
  `,
})
export class ProfilePage {
  protected auth   = inject(AuthStore);
  protected uiStore = inject(UIStore);
  private router   = inject(Router);

  editing   = signal(false);
  editName  = signal('');
  editPhone = signal('');
  editEmail = signal('');

  notifEnabled = signal(true);

  showDeleteDialog = signal(false);
  deleteTyped      = signal('');

  groupsUsed = computed(() => this.auth.tenant()?.max_groups ? 2 : 2);
  maxGroups  = computed(() => this.auth.tenant()?.max_groups ?? 3);
  planPct    = computed(() => Math.round((this.groupsUsed() / this.maxGroups()) * 100));

  startEdit(): void {
    const p = this.auth.profile();
    this.editName.set(p?.name ?? '');
    this.editPhone.set(p?.phone ?? '');
    this.editEmail.set(p?.email ?? '');
    this.editing.set(true);
  }

  cancelEdit(): void { this.editing.set(false); }

  saveEdit(): void {
    this.auth.updateProfile({
      name:  this.editName().trim(),
      phone: this.editPhone().trim(),
      email: this.editEmail().trim(),
    });
    this.editing.set(false);
  }

  closeDeleteDialog(): void {
    this.showDeleteDialog.set(false);
    this.deleteTyped.set('');
  }

  confirmDelete(): void {
    if (this.deleteTyped() !== 'DELETE') return;
    this.auth.signOut();
    this.router.navigate(['/auth']);
  }

  signOut(): void {
    this.auth.signOut();
    this.router.navigate(['/auth']);
  }
}
