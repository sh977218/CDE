import { Injectable, Injector } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { jwtDecode } from 'jwt-decode';

const localStorageJwtTokenKey = 'jwtToken';

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
                    localStorage.setItem(localStorageJwtTokenKey, newJwt.jwtToken);
                });
            }
        }

        const jwtToken = localStorage.getItem(localStorageJwtTokenKey);

        if (jwtToken) {
            request = request.clone({
                setHeaders: {
                    Authorization: `Bearer  ${localStorage.getItem(localStorageJwtTokenKey)}`,
                },
            });

            try {
                const decodedToken = jwtDecode(jwtToken);
                const jwtExpiredTime = decodedToken.exp || 0;
                const nowTime = new Date().getTime() / 1000;
                const isJwtTokenExpired = jwtExpiredTime < nowTime;

                if (isJwtTokenExpired) {
                    localStorage.removeItem(localStorageJwtTokenKey);
                    http.post('/server/system/logout', {}, { responseType: 'text' }).subscribe();
                }
            } catch (e) {
                localStorage.removeItem(localStorageJwtTokenKey);
                http.post('/server/system/logout', {}, { responseType: 'text' }).subscribe();
            }
        }

        return next.handle(request);
    }
}
