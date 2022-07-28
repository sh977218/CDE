import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { BannerComponent } from '_app/banner/banner.component';
import { HomeRoutingModule } from 'home/home-routing.module';
import { HomeComponent } from 'home/home.component';
import { HomeEditComponent } from 'home/homeEdit.component';
import { InlineAreaEditModule } from 'inlineAreaEdit/inlineAreaEdit.module';
import { NativeRenderModule } from 'nativeRender/nativeRender.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        MatButtonModule,
        MatButtonToggleModule,
        MatCardModule,
        MatIconModule,
        MatInputModule,
        MatFormFieldModule,
        MatMenuModule,
        // non-core
        // internal
        HomeRoutingModule,
        InlineAreaEditModule,
        NativeRenderModule,
    ],
    declarations: [
        HomeComponent,
        HomeEditComponent,
        BannerComponent
    ],
    providers: [
    ],
    schemas: []
})
export class HomeModule {
}
