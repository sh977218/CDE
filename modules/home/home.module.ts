import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";

import { HomeComponent } from 'home/home.component';
import { HomeRoutingModule } from 'home/home-routing.module';
import { NativeRenderModule } from 'nativeRender/nativeRender.module';
import { WidgetModule } from 'widget/widget.module';


@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        NgbModule,
        // core
        WidgetModule,
        // internal
        HomeRoutingModule,
        NativeRenderModule,
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
