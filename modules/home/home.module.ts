import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { NgbCarouselModule } from '@ng-bootstrap/ng-bootstrap/carousel/carousel.module';

import { HomeComponent } from 'home/home.component';
import { HomeRoutingModule } from 'home/home-routing.module';
import { NativeRenderModule } from 'nativeRender/nativeRender.module';
import { WidgetModule } from 'widget/widget.module';
import { MatIconModule } from '@angular/material';


@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        NgbCarouselModule.forRoot(),
        // core
        WidgetModule,
        // internal
        HomeRoutingModule,
        NativeRenderModule,
        MatIconModule,
    ],
    declarations: [
        HomeComponent
    ],
    entryComponents: [
    ],
    providers: [
    ],
    schemas: []
})
export class HomeModule {
}
