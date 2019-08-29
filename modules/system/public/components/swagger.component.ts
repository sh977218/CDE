import { AfterViewInit, Component } from '@angular/core';

@Component({
    selector: 'cde-swagger',
    templateUrl: './swagger.component.html',
})
export class SwaggerComponent implements AfterViewInit {
    constructor() {
    }

    ngAfterViewInit() {
        const initializeIFrame = setInterval(() => {
            if (!(window as any).frames.swaggerFrame
                || !(window as any).frames.swaggerFrame.contentDocument
                || !(window as any).frames.swaggerFrame.contentDocument.body
                || (window as any).frames.swaggerFrame.contentDocument.body.innerText.indexOf('swagger') === -1) {
                return;
            }

            const cssLink = window.document.createElement('link');
            cssLink.href = '/swagger/public/swagger.css';
            cssLink.rel = 'stylesheet';
            cssLink.type = 'text/css';
            (window as any).frames.swaggerFrame.contentDocument.body.appendChild(cssLink);
            clearInterval(initializeIFrame);
        }, 500);
    }
}
