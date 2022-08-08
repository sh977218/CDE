import { Component, forwardRef, Inject, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

@Component({
    selector: 'cde-banner',
    templateUrl: 'banner.component.html',
    styleUrls: ['./banner.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class BannerComponent {
    @ViewChild('covidBannerContent', {static: true}) copyDataElementContent!: TemplateRef<any>;

    constructor(@Inject(forwardRef(() => MatDialog)) public dialog: MatDialog) {
    }

}
