import { AfterViewInit, Component } from '@angular/core';

@Component({
    selector: 'cde-swagger',
    templateUrl: './swagger.component.html',
    styleUrls: ['./swagger.component.scss'],
    standalone: true,
})
export class SwaggerComponent implements AfterViewInit {
    ngAfterViewInit() {
        const initializeIFrame = setInterval(() => {
            if (
                !(window.frames as any).swaggerFrame ||
                !(window.frames as any).swaggerFrame.contentDocument ||
                !(window.frames as any).swaggerFrame.contentDocument.body ||
                (window.frames as any).swaggerFrame.contentDocument.body.innerText.indexOf('swagger') === -1
            ) {
                return;
            }

            const cssLink = window.document.createElement('link');
            cssLink.href = '/assets/swagger/swagger.css';
            cssLink.rel = 'stylesheet';
            cssLink.type = 'text/css';
            (window.frames as any).swaggerFrame.contentDocument.body.appendChild(cssLink);
            clearInterval(initializeIFrame);
        }, 500);
    }
}
