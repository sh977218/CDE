import { Component } from "@angular/core";

@Component({
    selector: 'cde-ie-banner',
    templateUrl: 'IEBanner.component.html',
    styles: [`
        .ieBanner {
            color: #211e14;
            background-image: linear-gradient(#feefae,#fae692);
            border-bottom: 1px solid #b3a569;
        }
        .bannerContent {
            padding: 10px 0 0 50px;
        }
    `]
})
export class IEBannerComponent {

    isIe: boolean = false;

    constructor () {
        this.isIe = false || !!(document as any).documentMode;
    }

    ignore () {
        this.isIe = false;
    }

}