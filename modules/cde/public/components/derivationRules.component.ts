import { HttpClient } from '@angular/common/http';
import { Component, DoCheck, Input, ViewChild, OnChanges, Output, EventEmitter, TemplateRef, } from '@angular/core';

import { QuickBoardListService } from '_app/quickBoardList.service';
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
        public quickBoardService: QuickBoardListService,
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
        this.someCdesInvalid();
    }

    addNewScore() {
        if (!this.elt.derivationRules) {
            this.elt.derivationRules = [];
        }
        this.quickBoardService.dataElements.forEach((qbElt: any) => {
            this.newDerivationRule.inputs.push(qbElt.tinyId);
        });
        this.elt.derivationRules.push(this.newDerivationRule);
        this.updateRules();
        this.someCdesInvalid();
        this.modalRef.close();
        this.eltChange.emit();
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

    openNewScoreModal() {
        this.newDerivationRule = {
            name: '',
            ruleType: 'score',
            formula: 'sumAll',
            inputs: this.quickBoardService.dataElements.map((qbElt: any) => qbElt.tinyId)
        };
        this.someCdesInvalid();
        this.modalRef = this.dialog.open(this.newScoreContent, {width: '800px'});
        this.modalRef.afterClosed().subscribe(() => {
            this.newDerivationRule = {
                name: '',
                ruleType: 'score',
                formula: 'sumAll',
                inputs: []
            };
        }, () => {
        });
    }


    removeDerivationRule(index: number) {
        this.elt.derivationRules.splice(index, 1);
        this.eltChange.emit();
    }

    someCdesInvalid() {
        this.invalidCdeMessage = '';
        if (this.quickBoardService.dataElements.length === 0) {
            this.invalidCdeMessage = 'There are no CDEs in your Quick Board. Add some before you can create a rule.';
        }
        this.quickBoardService.dataElements.forEach((qbElt: any) => {
            if (qbElt.tinyId === this.elt.tinyId) {
                this.invalidCdeMessage = 'You are trying to add a CDE to itself. Please edit your Quick Board.';
            }
        });
        this.quickBoardService.dataElements.forEach((qbElt: any) => {
            if (qbElt.valueDomain.datatype === 'Number') {
                return;
            }
            if (qbElt.valueDomain.datatype === 'Value List') {
                qbElt.valueDomain.permissibleValues.forEach((pv: any) => {
                    if (isNaN(pv.permissibleValue)) {
                        this.invalidCdeMessage = 'CDE ' + qbElt.designations[0].designation +
                            ' contains a Permissible Value that is not a number. It may not be added to a score.';
                    }
                });
            } else {
                this.invalidCdeMessage = 'CDE ' + qbElt.designations[0].designation +
                    " has a datatype other than 'Number' and may not be added to a score";
            }
        });
        return !!this.invalidCdeMessage.length;
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
