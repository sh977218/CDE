import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, forwardRef, Inject, ViewChild } from '@angular/core';
import { DomSanitizer, SafeResourceUrl, Title } from '@angular/platform-browser';
import { ActivatedRoute, Data, NavigationEnd, Router } from '@angular/router';
import { NotificationService } from '_app/notifications/notification.service';
import { BackForwardService } from '_app/backForward.service';
import { UserService } from '_app/user.service';
import { MatIconRegistry } from '@angular/material/icon';
import { CdeTourService } from '_app/cdeTour.service';
import { environment } from 'environments/environment';

@Component({
    selector: 'nih-cde',
    templateUrl: 'app.component.html'
})
export class CdeAppComponent {
    @ViewChild('receiver') receiver?: ElementRef<HTMLIFrameElement>;
    iframePromiseResolve: (() => void) | null = null;
    iframeReady: Promise<void> | null = null;
    iframeReadyTwice = false;
    ssoServerReceiver?: SafeResourceUrl;

    constructor(
        @Inject(forwardRef(() => ActivatedRoute)) protected route: ActivatedRoute,
        @Inject(forwardRef(() => BackForwardService)) backForwardService: BackForwardService,
        @Inject(forwardRef(() => DomSanitizer)) private sanitizer: DomSanitizer,
        @Inject(forwardRef(() => MatIconRegistry)) iconReg: MatIconRegistry,
        @Inject(forwardRef(() => NotificationService)) private notificationService: NotificationService,
        @Inject(forwardRef(() => Router)) private router: Router,
        @Inject(forwardRef(() => Title)) private title: Title,
        @Inject(forwardRef(() => UserService)) private userService: UserService,
        public cdeTourService: CdeTourService
    ) {
        this.route.queryParams.subscribe(params => {
            if (params.tour) {
                this.cdeTourService.takeTour();
            }
        });

        this.userService.then(user => {
        }, () => {
            const userService = this.userService;
            window.addEventListener('message', function receiveMessage(message: MessageEvent) {
                if (message.origin === window.ssoServerOrigin && message.data) {
                    userService.loginViaJwt(message.data);
                }
            });
            this.utsSendMessage('Messages', () => {
            });
        });
        this.userService.subscribe((user) => {
            this.userService.catch((err?: HttpErrorResponse) => {
                if (err && err.status === 0 && err.statusText === 'Unknown Error') {
                    this.router.navigate(['/offline'], {skipLocationChange: true});
                }
            });
        });

        this.router.events.subscribe(event => {
            if (event instanceof NavigationEnd) {
                let r = this.route;
                while (r.firstChild) {
                    r = r.firstChild;
                }
                if (r.outlet === 'primary') {
                    r.data.subscribe((data: Data) =>
                        this.title.setTitle(data.title || 'NIH Common Data Elements (CDE) Repository'));
                }
            }
        });

        iconReg.addSvgIconLiteral('thumb_tack', sanitizer.bypassSecurityTrustHtml(
            /* tslint:disable */
            `<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"\n\t viewBox=\"0 0 96 96\" style='enable-background:new 0 0 96 96; vertical-align: baseline' xml:space=\"preserve\">\n`
            + `<style type="text/css">.st0{fill: inherit;}</style>`
            + `<g id="XMLID_2_">`
            + `<path id="XMLID_6_" class="st0" d="M44.5,44.5V28.4c0-0.3-0.1-0.6-0.3-0.8s-0.5-0.3-0.8-0.3c-0.3,0-0.6,0.1-0.8,0.3\nc-0.2,0.2-0.3,0.5-0.3,0.8v16.2c0,0.3,0.1,0.6,0.3,0.8c0.2,0.2,0.5,0.3,0.8,0.3c0.3,0,0.6-0.1,0.8-0.3\nC44.4,45.2,44.5,44.9,44.5,44.5z M68.8,57.2c0,0.6-0.2,1.2-0.7,1.6c-0.5,0.5-1,0.7-1.6,0.7H51L49.2,77c0,0.3-0.2,0.5-0.4,0.7\nC48.6,77.9,48.3,78,48,78h0c-0.6,0-1-0.3-1.2-1l-2.7-17.5H29.5c-0.6,0-1.2-0.2-1.6-0.7c-0.5-0.5-0.7-1-0.7-1.6c0-3,0.9-5.6,2.8-8\nc1.9-2.4,4-3.6,6.4-3.6V27.2c-1.3,0-2.3-0.5-3.2-1.4s-1.4-2-1.4-3.2c0-1.3,0.5-2.3,1.4-3.2c0.9-0.9,2-1.4,3.2-1.4h23.1\nc1.3,0,2.3,0.5,3.2,1.4c0.9,0.9,1.4,2,1.4,3.2c0,1.3-0.5,2.3-1.4,3.2s-2,1.4-3.2,1.4v18.5c2.4,0,4.5,1.2,6.4,3.6\nC67.8,51.6,68.8,54.3,68.8,57.2z"/>`
            + `</g>`
            + `</svg>`
            /* tslint:enable */
        ));

        iconReg.addSvgIconLiteral('cog', sanitizer.bypassSecurityTrustHtml(
            /* tslint:disable */
            `<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"\n\t viewBox=\"0 0 96 96\" style='enable-background:new 0 0 96 96; vertical-align: baseline' xml:space=\"preserve\">\n`
            + `<style type="text/css">.st0{fill:#333333;}</style>`
            + `<path xmlns="http://www.w3.org/2000/svg" d="m 1024,640 q 0,106 -75,181 -75,75 -181,75 -106,0 -181,-75 -75,-75 -75,-181 0,-106 75,-181 75,-75 181,-75 106,0 181,75 75,75 75,181 z m 512,109 V 527 q 0,-12 -8,-23 -8,-11 -20,-13 l -185,-28 q -19,-54 -39,-91 35,-50 107,-138 10,-12 10,-25 0,-13 -9,-23 -27,-37 -99,-108 -72,-71 -94,-71 -12,0 -26,9 l -138,108 q -44,-23 -91,-38 -16,-136 -29,-186 -7,-28 -36,-28 H 657 q -14,0 -24.5,8.5 Q 622,-111 621,-98 L 593,86 q -49,16 -90,37 L 362,16 Q 352,7 337,7 323,7 312,18 186,132 147,186 q -7,10 -7,23 0,12 8,23 15,21 51,66.5 36,45.5 54,70.5 -27,50 -41,99 L 29,495 Q 16,497 8,507.5 0,518 0,531 v 222 q 0,12 8,23 8,11 19,13 l 186,28 q 14,46 39,92 -40,57 -107,138 -10,12 -10,24 0,10 9,23 26,36 98.5,107.5 72.5,71.5 94.5,71.5 13,0 26,-10 l 138,-107 q 44,23 91,38 16,136 29,186 7,28 36,28 h 222 q 14,0 24.5,-8.5 Q 914,1391 915,1378 l 28,-184 q 49,-16 90,-37 l 142,107 q 9,9 24,9 13,0 25,-10 129,-119 165,-170 7,-8 7,-22 0,-12 -8,-23 -15,-21 -51,-66.5 -36,-45.5 -54,-70.5 26,-50 41,-98 l 183,-28 q 13,-2 21,-12.5 8,-10.5 8,-23.5 z" id="path3029" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" inkscape:connector-curvature="0" style="fill:currentColor"/>`
            + `</svg>`
            /* tslint:enable */
        ));
    }

    frameReady() {
        if (!this.iframeReadyTwice) {
            this.iframeReadyTwice = true;
            return;
        }
        if (this.iframePromiseResolve) {
            this.iframePromiseResolve();
        }
    }

    ssoLogout(cb: () => void) {
        this.utsSendMessage('Logout', () => {});
        cb();
    }

    utsSendMessage(message: string, cb: () => void) {
        if (!this.iframeReady) {
            this.ssoServerReceiver = this.sanitizer.bypassSecurityTrustResourceUrl(environment.ssoServerReceiver);
            this.iframeReady = new Promise<void>(resolve => {
                this.iframeReadyTwice = false;
                this.iframePromiseResolve = resolve;
            });
        }
        this.iframeReady.then(() => {
            if (this.receiver && this.receiver.nativeElement && this.receiver.nativeElement.contentWindow) {
                this.receiver.nativeElement.contentWindow.postMessage(message, window.ssoServerOrigin);
                cb();
            }
        });
    }
}
