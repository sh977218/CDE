import { Component, Inject, Input, ViewChild } from "@angular/core";

@Component({
    selector: "cde-linked-forms",
    templateUrl: "linkedForms.component.html"
})

export class LinkedFormsComponent {

    @ViewChild("childModal") public childModal: ModalDirective;
    @Input() public elt: any;
    @Input() public eltType: string;

    forms: [any];

    constructor (@Inject("Elastic") private elastic) {};

    open () {
        let searchSettings = this.elastic.defaultSearchSettings;
        searchSettings.q = `"` + this.elt.tinyId + `"`;

        this.elastic.generalSearchQuery(this.elastic.buildElasticQuerySettings(searchSettings), "form", (err, result) => {
            if (err) return;
            this.forms = result.forms.filter(f => {
                 return f.tinyId !== this.elt.tinyId;
            });

            this.childModal.show();

        });
    }

    getFormText () {
        if (!this.forms || this.forms.length === 0) {
            return "There are no forms that use this " + this.eltType;
        }
        else if (this.forms.length === 1) {
            return "There is 1 form that uses this " + this.eltType;
        }
        else if (this.forms.length >= 20) {
            return "There are more than 20 forms that use this " + this.eltType;
        }
        else {
            return "There are " + this.forms.length + " forms that use this " + this.eltType;
        }
    }

}