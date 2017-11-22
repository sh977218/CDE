import { Component } from "@angular/core";

@Component({
    selector: "cde-page-not-found",
    template: `
        <div style="text-align: center">
            <img src="/system/public/img/doctor-404.png" title="404 - We could not find the element you are looking for"
                 class="mw-100 mt-20">
        </div>
    `
})

export class PageNotFoundComponent {
}