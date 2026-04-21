import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter, withComponentInputBinding, withViewTransitions } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideTransloco } from '@jsverse/transloco';
import { provideServiceWorker } from '@angular/service-worker';
import { isDevMode } from '@angular/core';

import { routes } from './app.routes';
import { TranslocoHttpLoader } from './transloco-loader';
import { SUPABASE_SERVICE } from '@core/supabase/supabase.token';
import { MockSupabaseService } from '@core/mock/mock-supabase.service';
import { environment } from '@env/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes, withComponentInputBinding(), withViewTransitions()),
    provideHttpClient(),
    provideTransloco({
      config: {
        availableLangs: ['en', 'te', 'hi', 'ta', 'kn', 'ml'],
        defaultLang: 'en',
        fallbackLang: 'en',
        reRenderOnLangChange: true,
        prodMode: !isDevMode(),
      },
      loader: TranslocoHttpLoader,
    }),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
    {
      provide: SUPABASE_SERVICE,
      useClass: environment.useMockData ? MockSupabaseService : MockSupabaseService,
      // Replace second MockSupabaseService with SupabaseService when Step 18 is reached
    },
  ],
};
