import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatRadioModule } from '@angular/material/radio';
import { RouterModule, Routes } from '@angular/router';
import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule } from '@angular/material/stepper';
import { DeleteWithConfirmModule } from 'deleteWithConfirm/deleteWithConfirm.module';
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
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatPaginatorModule,
        MatRadioModule,
        MatSelectModule,
        MatStepperModule,
        ReactiveFormsModule,
        //
        DeleteWithConfirmModule,
        MatMenuModule,
    ],
    declarations: [SubmissionEditComponent, SubmissionManagementComponent, SubmissionViewComponent],
    exports: [],
})
export class SubmissionModule {}
