import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';
import { ConsoleStore } from '../console.store';
import { EmptyStateComponent, SkeletonLoaderComponent } from '@shared/components';
import { AnnouncementCardComponent } from '@shared/components/announcement-card';
import { MOCK_CURRENT_USER_ID, MOCK_PROFILES } from '@core/mock/seed.data';

@Component({
  selector: 'app-announcements-page',
  standalone: true,
  imports: [
    FormsModule,
    TranslocoDirective,
    EmptyStateComponent,
    SkeletonLoaderComponent,
    AnnouncementCardComponent,
  ],
  styles: [`
    :host { display: flex; flex-direction: column; padding: 20px; gap: 20px; }

    /* ── Page header ───────────────────────────────────────── */
    .page-title { font-family: var(--font-serif); font-size: 22px; font-weight: 300;
                  color: var(--t1); margin: 0; }
    .page-sub   { font-size: 12px; color: var(--t3); margin-top: 2px; }

    /* ── Compose card ──────────────────────────────────────── */
    .compose-card {
      background: var(--card); border: 0.5px solid var(--b);
      border-radius: var(--r); padding: 16px;
      display: flex; flex-direction: column; gap: 12px;
    }
    .compose-label { font-size: 12px; font-weight: 500; color: var(--t2); }

    .textarea-wrap { position: relative; }
    textarea {
      width: 100%; box-sizing: border-box;
      border: 0.5px solid var(--b2); border-radius: var(--rs);
      padding: 10px 12px; resize: vertical; min-height: 96px;
      font-family: var(--font-sans); font-size: 13px; color: var(--t1);
      background: var(--warm); line-height: 1.5; outline: none;
    }
    textarea:focus { border-color: var(--t3); }
    .char-count {
      font-size: 11px; color: var(--t3); text-align: right;
      font-family: var(--font-mono);
    }
    .char-count.over { color: var(--red); }

    .compose-footer { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }

    .wa-toggle { display: flex; align-items: center; gap: 6px; cursor: pointer;
                 font-size: 13px; color: var(--t2); }
    .wa-toggle input[type="checkbox"] { accent-color: var(--green); width: 14px; height: 14px; }

    .btn-post {
      padding: 9px 20px; border-radius: 100px; border: none;
      background: var(--t1); color: #fff;
      font-size: 13px; font-weight: 500; font-family: var(--font-sans);
      cursor: pointer; white-space: nowrap;
    }
    .btn-post:disabled { opacity: 0.45; cursor: not-allowed; }
    .btn-post:not(:disabled):active { opacity: 0.8; }

    /* ── Feed ──────────────────────────────────────────────── */
    .feed-header { font-size: 11px; font-weight: 500; color: var(--t3);
                   text-transform: uppercase; letter-spacing: 0.05em;
                   font-family: var(--font-mono); }
    .feed { display: flex; flex-direction: column; gap: 10px; }

    @media (max-width: 767px) {
      :host { padding: 14px; gap: 16px; }
      .page-title { font-size: 18px; }
    }
  `],
  template: `
    <ng-container *transloco="let t">

      <!-- Header -->
      <div>
        <h1 class="page-title">{{ t('announcements.heading') }}</h1>
        @if (group()) {
          <p class="page-sub">{{ group()!.name }}</p>
        }
      </div>

      <!-- Compose -->
      <div class="compose-card">
        <span class="compose-label">{{ t('announcements.composeLabel') }}</span>

        <div class="textarea-wrap">
          <textarea
            [(ngModel)]="draftText"
            [placeholder]="t('announcements.composePlaceholder')"
            [maxlength]="MAX_CHARS"
            [attr.aria-label]="t('announcements.composeLabel')"
          ></textarea>
        </div>

        <div [class]="'char-count' + (charCount() > MAX_CHARS ? ' over' : '')">
          {{ charCount() }}/{{ MAX_CHARS }}
        </div>

        <div class="compose-footer">
          <label class="wa-toggle">
            <input type="checkbox" [(ngModel)]="sendViaWA" />
            <svg width="14" height="14" viewBox="0 0 24 24" style="fill:var(--green);flex-shrink:0;">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413"/>
            </svg>
            {{ t('announcements.sendViaWA') }}
          </label>

          <button
            class="btn-post"
            type="button"
            [disabled]="!canPost() || posting()"
            (click)="post()"
          >
            {{ posting() ? t('announcements.posting') : t('announcements.postBtn') }}
          </button>
        </div>
      </div>

      <!-- Skeleton -->
      @if (loading()) {
        <app-skeleton-loader type="row" [count]="3" />
      }

      <!-- Feed -->
      @if (!loading()) {
        @if (announcements().length === 0) {
          <app-empty-state
            [title]="t('announcements.emptyTitle')"
            [subtitle]="t('announcements.emptySub')"
          />
        } @else {
          <div class="feed-header">{{ t('announcements.feedLabel', { count: announcements().length }) }}</div>
          <div class="feed">
            @for (ann of announcements(); track ann.id) {
              <app-announcement-card
                [authorName]="authorName(ann.author_id)"
                [authorInitials]="authorInitials(ann.author_id)"
                [authorAvatarColor]="authorColor(ann.author_id)"
                [timestamp]="ann.created_at"
                [body]="ann.text"
                [showResend]="true"
                (resend)="shareViaWA($event)"
              />
            }
          </div>
        }
      }

    </ng-container>
  `,
})
export class AnnouncementsPage implements OnInit {
  private route = inject(ActivatedRoute);
  private store = inject(ConsoleStore);

  readonly MAX_CHARS = 500;

  loading       = this.store.loading;
  group         = this.store.selectedGroup;
  announcements = this.store.announcements;

  draftText = signal('');
  sendViaWA = signal(false);
  posting   = signal(false);

  charCount = computed(() => this.draftText().length);
  canPost   = computed(() => this.charCount() > 0 && this.charCount() <= this.MAX_CHARS);

  private groupId = '';

  ngOnInit() {
    this.groupId = this.route.snapshot.paramMap.get('id') ?? '';
    this.store.loadGroup(this.groupId);
  }

  async post() {
    const text = this.draftText().trim();
    if (!text || this.posting()) return;
    this.posting.set(true);
    try {
      await this.store.postAnnouncement(this.groupId, text);
      if (this.sendViaWA()) {
        this.shareViaWA(text);
      }
      this.draftText.set('');
      this.sendViaWA.set(false);
    } finally {
      this.posting.set(false);
    }
  }

  shareViaWA(text: string): void {
    const groupName = this.group()?.name ?? '';
    const msg = groupName ? `[${groupName}] ${text}` : text;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  }

  authorName(authorId: string): string {
    return MOCK_PROFILES.find(p => p.id === authorId)?.name ?? 'Organiser';
  }

  authorInitials(authorId: string): string {
    return MOCK_PROFILES.find(p => p.id === authorId)?.initials ?? 'OR';
  }

  authorColor(authorId: string): string {
    return MOCK_PROFILES.find(p => p.id === authorId)?.avatar_color ?? 'g';
  }
}
