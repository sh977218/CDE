import { HttpClient } from '@angular/common/http';
import { Component, DoCheck, Input, ViewChild, OnChanges, Output, EventEmitter, TemplateRef, } from '@angular/core';

import { DerivationRule } from 'shared/models.model';
import { DataElement } from 'shared/de/dataElement.model';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'cde-derivation-rules',
    templateUrl: './derivationRules.component.html'
})
export class DerivationRulesComponent implements DoCheck, OnChanges {
    @Input() canEdit!: boolean;
    @Input() elt!: DataElement & { derivationOutputs: { ruleName: string, cde: DataElement }[] };
    @Output() eltChange = new EventEmitter();
    @ViewChild('newScoreContent', {static: true}) newScoreContent!: TemplateRef<any>;
    invalidCdeMessage = '';
    modalRef!: MatDialogRef<TemplateRef<any>>;
    newDerivationRule: DerivationRule = {
        ruleType: 'score',
        formula: 'sumAll',
        inputs: [],
        name: ''
    };
    previousCdeId!: string;

    constructor(
        private http: HttpClient,
        public dialog: MatDialog,
    ) {
    }

    ngDoCheck() {
        if (this.elt._id !== this.previousCdeId) {
            this.previousCdeId = this.elt._id;
            this.updateRules();
            this.findDerivationOutputs();
        }
    }

    ngOnChanges() {
        this.previousCdeId = this.elt._id;
        this.updateRules();
        this.findDerivationOutputs();
    }

    canAddScore() {
        if (!this.canEdit) {
            return false;
        }
        if (this.elt.derivationRules) {
            return this.elt.derivationRules.filter(derRule => derRule.ruleType === 'score').length < 1;
        } else {
            return true;
        }
    }

    findDerivationOutputs() {
        if (!this.elt.derivationOutputs) {
            this.elt.derivationOutputs = [];
            this.http.get<DataElement[]>('/server/de/derivationOutputs/' + this.elt.tinyId).subscribe(result => {
                result.forEach(outputCde => {
                    outputCde.derivationRules.forEach(derRule => {
                        if (derRule.inputs.indexOf(this.elt.tinyId) > -1) {
                            this.elt.derivationOutputs.push({ruleName: derRule.name, cde: outputCde});
                        }
                    });
                });
            });
        }
    }

    getViewCdes(dr: DerivationRule) {
        if (!dr.fullCdes) {
            return [];
        }
        return dr.fullCdes.filter((item, index) => index < 8);
    }


    removeDerivationRule(index: number) {
        this.elt.derivationRules.splice(index, 1);
        this.eltChange.emit();
    }

    updateRules() {
        if (this.elt.derivationRules) {
            this.elt.derivationRules.forEach((dr: DerivationRule) => {
                if (dr.inputs[0] !== null) {
                    this.http.post<DataElement[]>('/server/de/byTinyIdList/', dr.inputs).subscribe(data => dr.fullCdes = data);
                }
            });
        }
    }
}