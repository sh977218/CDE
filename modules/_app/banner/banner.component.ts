import { AfterViewInit, Component, forwardRef, Inject, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

@Component({
    selector: 'cde-banner',
    templateUrl: 'banner.component.html',
    styles: [`
        .covid-banner-dialog-container > .mat-dialog-container {
            background: #be2c2c;
            color: white;
        }
    `],
    encapsulation: ViewEncapsulation.None
})
export class BannerComponent implements AfterViewInit {
    @ViewChild('covidBannerContent', {static: true}) copyDataElementContent!: TemplateRef<any>;

    constructor(@Inject(forwardRef(() => MatDialog)) public dialog: MatDialog) {
    }

/*
    openCovidBannerDialog(): void {
        this.dialog.open(this.copyDataElementContent, {
            panelClass: 'covid-banner-dialog-container',
            width: '1000px',
        });
    }
*/

    ngAfterViewInit(): void {
/*
        const showCovidBanner = (window as any).showCovidBanner;
        if (showCovidBanner) {
            this.openCovidBannerDialog();
        }
*/
    }

}
