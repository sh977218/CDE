import { Component, Inject } from '@angular/core';
import { CdeForm, FormInForm } from 'shared/form/form.model';
import { fetchForm } from 'nativeRender/form.service';
import { convertFormToSection } from 'core/form/form';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { isEqual } from 'lodash';

@Component({
    templateUrl: './form-update-form-version-modal.component.html'
})
export class FormUpdateFormVersionModalComponent {
    updateFormVersion: any = {
        currentSection: {},
        newSection: {}
    };

    constructor(@Inject(MAT_DIALOG_DATA) public formSection: FormInForm) {
        this.fetchForms(formSection);
    }

    fetchForms(formSection: FormInForm) {
        fetchForm(formSection.inForm.form.tinyId).then(newForm => {
            const oldVersion = formSection.inForm.form.version ? formSection.inForm.form.version : '';
            fetchForm(formSection.inForm.form.tinyId, oldVersion).then(oldForm => {
                this.openUpdateFormVersionMerge(convertFormToSection(newForm), formSection, newForm, oldForm);
            })
        });
    }

    openUpdateFormVersionMerge(newSection: FormInForm, currentSection: FormInForm, newForm: CdeForm, oldForm: CdeForm) {
        newSection.instructions = currentSection.instructions;
        newSection.repeat = currentSection.repeat;
        newSection.skipLogic = currentSection.skipLogic;
        if (newForm.designations.some(n => n.designation === currentSection.label)) {
            newSection.label = currentSection.label;
        }
        this.updateFormVersion.bForm = true;
        this.updateFormVersion.bLabel = !isEqual(newForm.designations, oldForm.designations);

        this.updateFormVersion.currentSection = currentSection;
        this.updateFormVersion.newSection = newSection;
    }

}
