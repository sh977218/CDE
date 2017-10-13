import { Component } from "@angular/core";

@Component({
    selector: "cde-page-not-found",
    template: `
        <div style="text-align: center">
            <img src="/system/public/img/doctor-404.png" title="404 - We could not find the element you are looking for"
                 style="margin-top: 20px; max-width: 100%">
        </div>
    `
})

export class PageNotFoundComponent {}