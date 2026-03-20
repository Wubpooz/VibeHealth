import { Injectable, signal } from '@angular/core';

export type ToastTone = 'success' | 'error' | 'info' | 'warning';

export interface ToastAction {
  label: string;
  callback: () => void;
}

export interface ToastOptions {
  title?: string;
  message: string;
  tone?: ToastTone;
  durationMs?: number;
  action?: ToastAction;
}

export interface ToastItem {
  id: string;
  title?: string;
  message: string;
  tone: ToastTone;
  durationMs: number;
  action?: ToastAction;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly toastsSignal = signal<ToastItem[]>([]);
  private sequence = 0;

  readonly toasts = this.toastsSignal.asReadonly();

  show(options: ToastOptions): string {
    const id = `toast-${Date.now()}-${++this.sequence}`;
    const durationMs = options.durationMs ?? 4600;
    const toast: ToastItem = {
      id,
      title: options.title,
      message: options.message,
      tone: options.tone ?? 'info',
      durationMs,
      action: options.action,
    };

    this.toastsSignal.update((current) => [...current, toast]);

    if (durationMs > 0) {
      globalThis.setTimeout(() => {
        this.dismiss(id);
      }, durationMs);
    }

    return id;
  }

  success(message: string, title?: string, durationMs = 4200): string {
    return this.show({ message, title, tone: 'success', durationMs });
  }

  error(message: string, title?: string, durationMs = 5200): string {
    return this.show({ message, title, tone: 'error', durationMs });
  }

  info(message: string, title?: string, durationMs = 4200): string {
    return this.show({ message, title, tone: 'info', durationMs });
  }

  warning(message: string, title?: string, durationMs = 4600): string {
    return this.show({ message, title, tone: 'warning', durationMs });
  }

  dismiss(id: string): void {
    this.toastsSignal.update((current) => current.filter((toast) => toast.id !== id));
  }

  clear(): void {
    this.toastsSignal.set([]);
  }
}
