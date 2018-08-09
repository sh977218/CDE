import { HttpClient } from '@angular/common/http';
import { Component, DoCheck, Input, ViewChild, OnChanges, Output, EventEmitter, } from '@angular/core';
import { NgbModalModule, NgbModal, NgbActiveModal, NgbModalRef, } from '@ng-bootstrap/ng-bootstrap';

import { QuickBoardListService } from '_app/quickBoardList.service';

@Component({
    selector: 'cde-derivation-rules',
    providers: [NgbActiveModal],
    templateUrl: './derivationRules.component.html'
})
export class DerivationRulesComponent implements DoCheck, OnChanges {
    @Input() canEdit;
    @Input() elt: any;
    @Output() onEltChange = new EventEmitter();
    @ViewChild('newScoreContent') newScoreContent: NgbModalModule;
    invalidCdeMessage: string = '';
    modalRef: NgbModalRef;
    newDerivationRule: any = {
        ruleType: 'score',
        formula: 'sumAll',
        inputs: []
    };
    previousCdeId: string;

    ngDoCheck() {
        if (this.elt._id !== this.previousCdeId) {
            this.previousCdeId = this.elt._id;
            this.updateRules();
            this.findDerivationOutputs();
        }
    }

    ngOnChanges(changes) {
        this.previousCdeId = this.elt._id;
        this.updateRules();
        this.findDerivationOutputs();
    }

    constructor(
        private http: HttpClient,
        public modalService: NgbModal,
        public quickBoardService: QuickBoardListService,
    ) {
    }

    addNewScore() {
        if (!this.elt.derivationRules) this.elt.derivationRules = [];
        this.quickBoardService.dataElements.forEach((qbElt: any) => {
            this.newDerivationRule.inputs.push(qbElt.tinyId);
        });
        this.elt.derivationRules.push(this.newDerivationRule);
        this.updateRules();
        this.modalRef.close();
        this.onEltChange.emit();
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
            this.http.get<any>('/cde/derivationOutputs/' + this.elt.tinyId).subscribe(result => {
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

    getViewCdes(dr) {
        if (!dr.fullCdes) return [];
        return dr.fullCdes.filter((item, index) => index < 8);
    }

    openNewScoreModal() {
        this.newDerivationRule = {
            name: '',
            ruleType: 'score',
            formula: 'sumAll',
            inputs: []
        };
        this.modalRef = this.modalService.open(this.newScoreContent, {size: 'lg'});
        this.modalRef.result.then(() => {
            this.newDerivationRule = {
                name: '',
                ruleType: 'score',
                formula: 'sumAll',
                inputs: []
            };
        }, () => {
        });
    }


    removeDerivationRule(index) {
        this.elt.derivationRules.splice(index, 1);
        this.onEltChange.emit();
    }

    someCdesInvalid() {
        this.invalidCdeMessage = '';
        if (this.quickBoardService.dataElements.length === 0) {
            this.invalidCdeMessage = 'There are no CDEs in your Quick Board. Add some before you can create a rule.';
            return true;
        }
        this.quickBoardService.dataElements.forEach((qbElt: any) => {
            if (qbElt.tinyId === this.elt.tinyId) {
                this.invalidCdeMessage = 'You are trying to add a CDE to itself. Please edit your Quick Board.';
            }
        });
        this.quickBoardService.dataElements.forEach((qbElt: any) => {
            if (qbElt.valueDomain.datatype === 'Number') return;
            if (qbElt.valueDomain.datatype === 'Value List') {
                qbElt.valueDomain.permissibleValues.forEach((pv: any) => {
                    if (isNaN(pv.permissibleValue)) {
                        this.invalidCdeMessage = 'CDE ' + qbElt.designations[0].designation +
                            ' contains a Permissible Value that is not a number. It may not be added to a score.';
                    }
                });
            }
            else {
                this.invalidCdeMessage = 'CDE ' + qbElt.designations[0].designation +
                    " has a datatype other than 'Number' and may not be added to a score";
            }
        });
    }

    updateRules() {
        if (this.elt.derivationRules) {
            this.elt.derivationRules.forEach((dr: any) => {
                if (dr.inputs[0] !== null) this.http.post('/cdesByTinyIdList', dr.inputs).subscribe(data => dr.fullCdes = data);
            });
        }
    }
}
