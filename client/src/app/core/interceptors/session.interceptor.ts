import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { SessionService } from '../services/session.service';

export const sessionInterceptor: HttpInterceptorFn = (req, next) => {
  const sessionService = inject(SessionService);
  const sessionId = sessionService.getSessionId();

  const clonedReq = req.clone({
    setHeaders: {
      'x-session-id': sessionId,
    },
  });

  return next(clonedReq);
};