import { Component } from '@angular/core';

@Component({
    selector: 'cde-offline',
    template: `
        <div style="text-align: center">
            <img src="/assets/img/NIH-CDE.svg" style="max-width: 600px" />
            <h1>
                <img src="/app/offline/offline.png" />
                Either you are offline or the server is under maintenance.
            </h1>
        </div>
    `,
})
export class OfflineComponent {}
