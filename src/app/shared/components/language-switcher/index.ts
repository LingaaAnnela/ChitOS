import { Component, inject } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { UIStore } from '@core/stores/ui.store';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'te', label: 'తెలుగు' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'ta', label: 'தமிழ்' },
  { code: 'kn', label: 'ಕನ್ನಡ' },
  { code: 'ml', label: 'മലയാളം' },
];

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [],
  styles: [`
    .lang-select {
      appearance: none; cursor: pointer;
      padding: 6px 10px; border: 0.5px solid var(--b2);
      border-radius: var(--rs); font-size: 12px;
      font-family: var(--font-sans); color: var(--t1);
      background: var(--card); outline: none;
    }
    .lang-select:focus { border-color: var(--green); }
  `],
  template: `
    <select class="lang-select" [value]="uiStore.lang()" (change)="onChange($any($event.target).value)">
      @for (lang of languages; track lang.code) {
        <option [value]="lang.code">{{ lang.label }}</option>
      }
    </select>
  `,
})
export class LanguageSwitcherComponent {
  protected uiStore = inject(UIStore);
  private transloco = inject(TranslocoService);

  readonly languages = LANGUAGES;

  onChange(code: string): void {
    this.transloco.setActiveLang(code);
    this.uiStore.setLang(code);
  }
}
