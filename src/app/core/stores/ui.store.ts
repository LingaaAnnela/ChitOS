import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import type { ToastType } from '@core/services/toast.service';

export interface UIToast {
  id: string;
  message: string;
  type: ToastType;
}

interface UIState {
  lang: string;
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  toasts: UIToast[];
}

export const UIStore = signalStore(
  { providedIn: 'root' },
  withState<UIState>({
    lang: 'en',
    theme: 'light',
    sidebarOpen: false,
    toasts: [],
  }),
  withMethods((store) => {
    const dismissToast = (id: string) =>
      patchState(store, { toasts: store.toasts().filter(t => t.id !== id) });

    return {
      setLang(l: string) {
        patchState(store, { lang: l });
      },
      toggleSidebar() {
        patchState(store, { sidebarOpen: !store.sidebarOpen() });
      },
      closeSidebar() {
        patchState(store, { sidebarOpen: false });
      },
      addToast(message: string, type: ToastType, duration = 2500) {
        const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        patchState(store, { toasts: [...store.toasts(), { id, message, type }] });
        setTimeout(() => dismissToast(id), duration);
      },
      dismissToast,
    };
  }),
);
