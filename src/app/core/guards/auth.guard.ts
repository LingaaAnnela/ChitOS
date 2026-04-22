import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, map, take } from 'rxjs/operators';
import { AuthStore } from '@core/stores/auth.store';

export const authGuard: CanActivateFn = () => {
  const auth   = inject(AuthStore);
  const router = inject(Router);

  if (!auth.loading()) {
    return auth.user() ? true : router.createUrlTree(['/auth']);
  }

  return toObservable(auth.loading).pipe(
    filter(loading => !loading),
    take(1),
    map(() => auth.user() ? true : router.createUrlTree(['/auth'])),
  );
};
