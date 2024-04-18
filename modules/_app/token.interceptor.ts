import { Injectable, Injector } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
    lastJwtRefresh = performance.now();

    constructor(private injector: Injector) {}

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const http = this.injector.get(HttpClient);

        if (request.url.indexOf('/refreshToken') === -1) {
            /* istanbul ignore next */
            if (performance.now() - this.lastJwtRefresh > 20 * 60 * 1000) {
                this.lastJwtRefresh = performance.now();
                http.get<{ jwtToken: string }>(`/server/refreshToken`).subscribe(newJwt => {
                    localStorage.setItem('jwtToken', newJwt.jwtToken);
                });
            }
        }

        if (localStorage.getItem('jwtToken')) {
            request = request.clone({
                setHeaders: {
                    Authorization: `Bearer  ${localStorage.getItem('jwtToken')}`,
                },
            });
        }
        return next.handle(request);
    }
}
