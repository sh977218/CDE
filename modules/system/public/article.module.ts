import { CommonModule } from '@angular/common';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ArticleComponent } from 'system/public/components/article/article.component';

const appRoutes: Routes = [{ path: '', component: ArticleComponent }];

@NgModule({
    imports: [CommonModule, RouterModule.forChild(appRoutes)],
    declarations: [ArticleComponent],
    exports: [],
    providers: [],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ArticleModule {}
