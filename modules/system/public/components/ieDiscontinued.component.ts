import { Component } from '@angular/core';

@Component({
    selector: 'cde-page-not-found',
    template: `
        <div style="text-align: center">
            <h3>Internet Explorer is no longer supported to log in to the NIH CDE Repository.</h3>
            <p>Supported browsers include
            Microsoft Edge, Google Chrome and Firefox.</p>
        </div>
    `
})
export class IeDiscontinuedComponent {
}
