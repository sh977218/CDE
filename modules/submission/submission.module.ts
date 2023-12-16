import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatRadioModule } from '@angular/material/radio';
import { RouterModule, Routes } from '@angular/router';
import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule } from '@angular/material/stepper';
import { AdminItemModule } from 'adminItem/adminItem.module';
import { DeleteWithConfirmModule } from 'deleteWithConfirm/deleteWithConfirm.module';
import { NativeRenderModule } from 'nativeRender/nativeRender.module';
import { SubmissionEditComponent } from 'submission/submissionEdit.component';
import { SubmissionManagementComponent } from 'submission/submissionManagement.component';
import { SubmissionViewComponent } from 'submission/submissionView.component';

const routes: Routes = [
    { path: '', component: SubmissionManagementComponent },
    { path: 'edit', component: SubmissionEditComponent },
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        RouterModule.forChild(routes),
        MatAutocompleteModule,
        MatChipsModule,
        MatExpansionModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatMenuModule,
        MatPaginatorModule,
        MatRadioModule,
        MatSelectModule,
        MatStepperModule,
        ReactiveFormsModule,
        //
        AdminItemModule,
        DeleteWithConfirmModule,
        NativeRenderModule,
    ],
    declarations: [SubmissionEditComponent, SubmissionManagementComponent, SubmissionViewComponent],
    exports: [],
})
export class SubmissionModule {}
