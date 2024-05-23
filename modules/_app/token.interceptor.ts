import { Injectable, Injector } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { jwtDecode } from 'jwt-decode';
import { CookieService } from 'ngx-cookie-service';
import { UserService } from '_app/user.service';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
    lastJwtRefresh = performance.now();

    constructor(private injector: Injector) {}

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const http = this.injector.get(HttpClient);
        const userService = this.injector.get(UserService);
        const cookieService = this.injector.get(CookieService);

        if (request.url.indexOf('/refreshToken') === -1) {
            /* istanbul ignore next */
            if (performance.now() - this.lastJwtRefresh > 20 * 60 * 1000) {
                this.lastJwtRefresh = performance.now();
                http.get(`/server/refreshToken`, { responseType: 'text' }).subscribe();
            }
        }

        const jwtToken = cookieService.get('jwtToken');

        if (jwtToken) {
            try {
                const decodedToken = jwtDecode(jwtToken);
                const jwtExpiredTime = decodedToken.exp || 0;
                const nowTime = new Date().getTime() / 1000;
                const isJwtTokenExpired = jwtExpiredTime < nowTime;

                if (isJwtTokenExpired) {
                    http.post('/server/system/logout', {}, { responseType: 'text' }).subscribe(() =>
                        userService.clear()
                    );
                }
            } catch (e) {
                http.post('/server/system/logout', {}, { responseType: 'text' }).subscribe(() => userService.clear());
            }
        }

        return next.handle(request);
    }
}
