import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { NgbCarouselModule } from '@ng-bootstrap/ng-bootstrap';
import { HomeComponent } from 'home/home.component';
import { HomeRoutingModule } from 'home/home-routing.module';
import { NativeRenderModule } from 'nativeRender/nativeRender.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        NgbCarouselModule,
        // non-core
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
