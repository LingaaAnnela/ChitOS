import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';
import {
  form, required, email as emailValidator, minLength, pattern,
  FormField, submit,
} from '@angular/forms/signals';
import { AuthStore } from '@core/stores/auth.store';

const INDIAN_PHONE = /^(\+91[\s-]?)?[6-9]\d{9}$/;

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [TranslocoDirective, RouterLink, FormField],
  template: `
    <ng-container *transloco="let t">
      <div class="page">
        <div class="logo">Chit<em>OS</em></div>

        <div class="card">
          <h1 class="title">{{ t('auth.signUp') }}</h1>

          @if (serverError()) {
            <div class="error-banner" role="alert">{{ serverError() }}</div>
          }

          <div class="field">
            <label class="lbl" for="name">{{ t('auth.name') }}</label>
            <input
              id="name"
              type="text"
              class="input"
              [class.input-err]="signupForm.name().touched() && signupForm.name().errors().length"
              [formField]="signupForm.name"
              autocomplete="name"
            />
            @if (signupForm.name().touched() && signupForm.name().errors().length) {
              <span class="field-err" role="alert">{{ t('auth.nameRequired') }}</span>
            }
          </div>

          <div class="field">
            <label class="lbl" for="phone">{{ t('auth.phone') }}</label>
            <input
              id="phone"
              type="tel"
              class="input"
              [class.input-err]="signupForm.phone().touched() && signupForm.phone().errors().length"
              [formField]="signupForm.phone"
              autocomplete="tel"
              inputmode="tel"
              placeholder="+91 98765 43210"
            />
            @if (signupForm.phone().touched() && signupForm.phone().errors().length) {
              <span class="field-err" role="alert">
                {{ signupForm.phone().errors()[0].kind === 'required'
                    ? t('auth.phoneRequired')
                    : t('auth.phoneInvalid') }}
              </span>
            }
          </div>

          <div class="field">
            <label class="lbl" for="email">{{ t('auth.email') }}</label>
            <input
              id="email"
              type="email"
              class="input"
              [class.input-err]="signupForm.email().touched() && signupForm.email().errors().length"
              [formField]="signupForm.email"
              autocomplete="email"
              inputmode="email"
            />
            @if (signupForm.email().touched() && signupForm.email().errors().length) {
              <span class="field-err" role="alert">
                {{ signupForm.email().errors()[0].kind === 'required'
                    ? t('auth.emailRequired')
                    : t('auth.emailInvalid') }}
              </span>
            }
          </div>

          <div class="field">
            <label class="lbl" for="password">{{ t('auth.password') }}</label>
            <input
              id="password"
              type="password"
              class="input"
              [class.input-err]="signupForm.password().touched() && signupForm.password().errors().length"
              [formField]="signupForm.password"
              autocomplete="new-password"
            />
            @if (signupForm.password().touched() && signupForm.password().errors().length) {
              <span class="field-err" role="alert">
                {{ signupForm.password().errors()[0].kind === 'required'
                    ? t('auth.passwordRequired')
                    : t('auth.passwordMinLength') }}
              </span>
            }
          </div>

          <div class="field">
            <label class="lbl" for="confirmPassword">{{ t('auth.confirmPassword') }}</label>
            <input
              id="confirmPassword"
              type="password"
              class="input"
              [class.input-err]="signupForm.confirmPassword().touched() && signupForm.confirmPassword().errors().length"
              [formField]="signupForm.confirmPassword"
              autocomplete="new-password"
            />
            @if (signupForm.confirmPassword().touched() && signupForm.confirmPassword().errors().length) {
              <span class="field-err" role="alert">{{ t('auth.confirmPasswordRequired') }}</span>
            }
          </div>

          <button
            class="btn-primary"
            type="button"
            [disabled]="submitting()"
            (click)="onSubmit()"
          >
            {{ submitting() ? t('auth.creatingAccount') : t('auth.signUp') }}
          </button>

          <p class="footer-link">
            {{ t('auth.alreadyAccount') }}&nbsp;<a routerLink="/auth/login">{{ t('auth.signInLink') }}</a>
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
      gap: 14px;
    }

    .title {
      font-family: var(--font-serif);
      font-size: 22px;
      font-weight: 300;
      color: var(--t1);
      letter-spacing: -0.3px;
      margin-bottom: 2px;
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

    .lbl {
      font-size: 12px;
      font-weight: 500;
      color: var(--t2);
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
    .input::placeholder { color: var(--t3); }

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
export class SignupPage {
  private readonly router = inject(Router);
  private readonly authStore = inject(AuthStore);

  readonly model = signal({ name: '', phone: '', email: '', password: '', confirmPassword: '' });
  readonly signupForm = form(this.model, f => {
    required(f.name);
    required(f.phone);
    pattern(f.phone, INDIAN_PHONE);
    required(f.email);
    emailValidator(f.email);
    required(f.password);
    minLength(f.password, 8);
    required(f.confirmPassword);
  });

  readonly submitting = signal(false);
  readonly serverError = signal('');

  async onSubmit() {
    this.serverError.set('');
    await submit(this.signupForm, async () => {
      const value = this.model();
      if (value.password !== value.confirmPassword) {
        this.serverError.set('auth.passwordMismatch');
        return;
      }
      this.submitting.set(true);
      try {
        await this.authStore.register(value.name, value.phone, value.email, value.password);
        const err = this.authStore.error();
        if (err) {
          this.serverError.set(err);
          return;
        }
        await this.router.navigate(['/onboarding']);
      } finally {
        this.submitting.set(false);
      }
    });
  }
}
