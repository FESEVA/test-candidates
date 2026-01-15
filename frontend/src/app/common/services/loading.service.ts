import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  isLoading = signal(false);
  isLongWait = signal(false);

  private timeoutId: any;

  show() {
    this.isLoading.set(true);
    this.timeoutId = setTimeout(() => {
      if (this.isLoading()) {
        this.isLongWait.set(true);
      }
    }, 4000);
  }

  hide() {
    this.isLoading.set(false);
    this.isLongWait.set(false);
    if (this.timeoutId) clearTimeout(this.timeoutId);
  }
}
