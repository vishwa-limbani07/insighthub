import { Injectable } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';

@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly STORAGE_KEY = 'vizora_session_id';

  getSessionId(): string {
    let sessionId = localStorage.getItem(this.STORAGE_KEY);
    if (!sessionId) {
      sessionId = uuidv4();
      localStorage.setItem(this.STORAGE_KEY, sessionId);
    }
    return sessionId;
  }

  clearSession(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}