import { AfterViewInit, Component } from "@angular/core";

@Component({
    selector: "cde-swagger",
    templateUrl: "./swagger.component.html",
})
export class SwaggerComponent implements AfterViewInit {
    constructor() {}

    ngAfterViewInit() {
        let initializeIFrame = setInterval(function () {
            if (!window.frames['swaggerFrame']
                || !window.frames['swaggerFrame'].contentDocument
                || !window.frames['swaggerFrame'].contentDocument.body
                || window.frames['swaggerFrame'].contentDocument.body.innerText.indexOf('swagger') === -1)
                return;

            let cssLink = window.document.createElement("link");
            cssLink.href = "/swagger/public/swagger.css";
            cssLink.rel = "stylesheet";
            cssLink.type = "text/css";
            window.frames['swaggerFrame'].contentDocument.body.appendChild(cssLink);
            clearInterval(initializeIFrame);
        }, 10);
    }
}
