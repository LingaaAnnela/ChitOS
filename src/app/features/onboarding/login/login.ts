import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';
import { form, required, email as emailValidator, FormField, submit } from '@angular/forms/signals';
import { AuthStore } from '@core/stores/auth.store';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [TranslocoDirective, RouterLink, FormField],
  template: `
    <ng-container *transloco="let t">
      <div class="page">
        <div class="logo">Chit<em>OS</em></div>

        <div class="card">
          <h1 class="title">{{ t('auth.signIn') }}</h1>

          @if (serverError()) {
            <div class="error-banner" role="alert">{{ serverError() }}</div>
          }

          <div class="field">
            <label class="lbl" for="email">{{ t('auth.email') }}</label>
            <input
              id="email"
              type="email"
              class="input"
              [class.input-err]="loginForm.email().touched() && loginForm.email().errors().length"
              [formField]="loginForm.email"
              autocomplete="email"
              inputmode="email"
            />
            @if (loginForm.email().touched() && loginForm.email().errors().length) {
              <span class="field-err" role="alert">
                {{ loginForm.email().errors()[0].kind === 'required'
                    ? t('auth.emailRequired')
                    : t('auth.emailInvalid') }}
              </span>
            }
          </div>

          <div class="field">
            <div class="lbl-row">
              <label class="lbl" for="password">{{ t('auth.password') }}</label>
              <span class="forgot">{{ t('auth.forgotPassword') }}</span>
            </div>
            <input
              id="password"
              type="password"
              class="input"
              [class.input-err]="loginForm.password().touched() && loginForm.password().errors().length"
              [formField]="loginForm.password"
              autocomplete="current-password"
            />
            @if (loginForm.password().touched() && loginForm.password().errors().length) {
              <span class="field-err" role="alert">{{ t('auth.passwordRequired') }}</span>
            }
          </div>

          <button
            class="btn-primary"
            type="button"
            [disabled]="submitting()"
            (click)="onSubmit()"
          >
            {{ submitting() ? t('auth.signingIn') : t('auth.signIn') }}
          </button>

          <p class="footer-link">
            {{ t('auth.noAccount') }}&nbsp;<a routerLink="/auth/signup">{{ t('auth.signUpLink') }}</a>
          </p>
        </div>
      </div>
    </ng-container>
  `,
  styles: [`
    :host { display: block; }

    .page {
      min-height: 100dvh;
      background: var(--warm);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 24px 16px;
      gap: 20px;
    }

    .logo {
      font-family: var(--font-serif);
      font-size: 24px;
      font-weight: 300;
      color: var(--t1);
      letter-spacing: -0.5px;
    }
    .logo em { font-style: normal; color: var(--green); }

    .card {
      width: 100%;
      max-width: 400px;
      background: var(--card);
      border: 0.5px solid var(--b2);
      border-radius: var(--r);
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .title {
      font-family: var(--font-serif);
      font-size: 22px;
      font-weight: 300;
      color: var(--t1);
      letter-spacing: -0.3px;
    }

    .error-banner {
      background: var(--rbg);
      border: 0.5px solid var(--rb);
      border-radius: var(--rs);
      color: var(--red);
      font-size: 13px;
      padding: 10px 12px;
    }

    .field {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .lbl-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .lbl {
      font-size: 12px;
      font-weight: 500;
      color: var(--t2);
    }

    .forgot {
      font-size: 12px;
      color: var(--t3);
      cursor: default;
    }

    .input {
      width: 100%;
      height: 40px;
      padding: 0 12px;
      background: var(--warm);
      border: 0.5px solid var(--b2);
      border-radius: var(--rs);
      font-family: var(--font-body);
      font-size: 14px;
      color: var(--t1);
      outline: none;
      transition: border-color 0.15s;
    }
    .input:focus { border-color: rgba(0,0,0,0.25); }
    .input.input-err { border-color: var(--red); }

    .field-err {
      font-size: 11px;
      color: var(--red);
    }

    .btn-primary {
      width: 100%;
      height: 44px;
      background: var(--t1);
      color: #fff;
      border: none;
      border-radius: var(--rs);
      font-family: var(--font-body);
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      margin-top: 4px;
      transition: opacity 0.15s;
    }
    .btn-primary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .footer-link {
      text-align: center;
      font-size: 13px;
      color: var(--t2);
      margin-top: 4px;
    }
    .footer-link a {
      color: var(--t1);
      text-decoration: underline;
      text-underline-offset: 2px;
    }

    @media (min-width: 768px) {
      .card { padding: 32px; }
    }
  `],
})
export class LoginPage {
  private readonly router = inject(Router);
  private readonly authStore = inject(AuthStore);

  readonly model = signal({ email: '', password: '' });
  readonly loginForm = form(this.model, f => {
    required(f.email);
    emailValidator(f.email);
    required(f.password);
  });

  readonly submitting = signal(false);
  readonly serverError = signal('');

  async onSubmit() {
    this.serverError.set('');
    await submit(this.loginForm, async () => {
      const value = this.model();
      this.submitting.set(true);
      try {
        await this.authStore.login(value.email, value.password);
        const err = this.authStore.error();
        if (err) {
          this.serverError.set(err);
          return;
        }
        const dest = this.authStore.isOrganizer() ? '/console/dashboard' : '/app/home';
        await this.router.navigate([dest]);
      } finally {
        this.submitting.set(false);
      }
    });
  }
}
