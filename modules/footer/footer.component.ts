import { Component } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { NgIf } from '@angular/common';
import { UswdsBannerComponent } from '_app/banner/uswdsBanner.component';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'cde-footer',
    standalone: true,
    templateUrl: './footer.component.html',
    imports: [MatToolbarModule, NgIf, UswdsBannerComponent, MatIconModule],
    styleUrls: ['./footer.component.scss'],
})
export class FooterComponent {}
