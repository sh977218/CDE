import { Component } from '@angular/core';


@Component({
    selector: 'cde-offline',
    template: `
        <div style="text-align: center">
            <img src="/cde/public/assets/img/min/NIH-CDE.svg">
            <h1>
                <img src="/app/offline/offline.png">
                Either you are offline or the server is under maintenance.
            </h1>
        </div>
    `
})
export class OfflineComponent {
}
