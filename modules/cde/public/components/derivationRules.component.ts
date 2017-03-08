import { Http } from "@angular/http";
import {Component, Inject, Input, ViewChild, OnChanges} from "@angular/core";
import { ModalDirective } from "ng2-bootstrap/modal";

@Component({
    selector: "cde-derivation-rules",
    templateUrl: "./derivationRules.component.html"
})

export class DerivationRulesComponent implements OnChanges {

    @ViewChild("childModal") public childModal: ModalDirective;
    @Input() public elt: any;

    newDerivationRule: any;
    invalidCdeMessage: string;

    constructor(private http: Http,
                @Inject("QuickBoard") private quickBoard,
                @Inject("isAllowedModel") private isAllowedModel) {

        this.newDerivationRule = {
            ruleType: "score",
            formula: "sumAll",
            inputs: []
        };
    }

    ngOnChanges () {
        this.updateRules();
        this.findDerivationOutputs();
    }

    updateRules () {
        if (this.elt.derivationRules) {
            this.elt.derivationRules.forEach((dr: any) => {
                if (dr.inputs[0] !== null) {
                    this.http.post("/cdesByTinyIdList", dr.inputs)
                    .subscribe(data => {
                        dr.fullCdes = data.json();
                    });
                }
            });
        }
    };

    getViewCdes (dr) {
        if (!dr.fullCdes) return [];
        return dr.fullCdes.filter((item, index) => index < 8);
    }

    findDerivationOutputs () {
        if (!this.elt.derivationOutputs) {
            this.elt.derivationOutputs = [];
            this.http.get("/cde/derivationOutputs/" + this.elt.tinyId, (result) => {
                result.data.forEach(function(outputCde) {
                    outputCde.derivationRules.forEach((derRule) => {
                        if (derRule.inputs.indexOf(this.elt.tinyId) > -1) {
                            this.elt.derivationOutputs.push({ruleName: derRule.name, cde: outputCde});
                        }
                    });
                });
            });
        }
    };

    openNewScore () {
        this.newDerivationRule = {
            name: "",
            ruleType: "score",
            formula: "sumAll",
            inputs: []
        };
        this.childModal.show();
    };

    okCreate () {
        this.childModal.hide();
        if (!this.elt.derivationRules) this.elt.derivationRules = [];
        this.quickBoard.elts.forEach((qbElt: any) => {
            this.newDerivationRule.inputs.push(qbElt.tinyId);
        });
        this.elt.derivationRules.push(this.newDerivationRule);
        this.elt.unsaved = true;
        this.updateRules();
    };


    removeDerivationRule (index) {
        this.elt.derivationRules.splice(index, 1);
        this.elt.unsaved = true;
    };

    canAddScore () {
        if (!this.isAllowedModel.isAllowed(this.elt)) return false;
        if (this.elt.derivationRules) {
            return this.elt.derivationRules.filter(derRule => derRule.ruleType === "score").length < 1;
        } else {
            return true;
        }
    };

    someCdesInvalid () {
        this.invalidCdeMessage = undefined;
        if (this.quickBoard.elts.length === 0) {
            this.invalidCdeMessage = "There are no CDEs in your Quick Board. Add some before you can create a rule.";
            return true;
        }
        this.quickBoard.elts.forEach((qbElt: any) => {
            if (qbElt.tinyId === this.elt.tinyId) {
                this.invalidCdeMessage = "You are trying to add a CDE to itself. Please edit your Quick Board.";
            }
        });
        this.quickBoard.elts.forEach(function(qbElt: any) {
            if (qbElt.valueDomain.datatype === "Number") return;
            if (qbElt.valueDomain.datatype === "Value List") {
                qbElt.valueDomain.permissibleValues.forEach((pv: any) => {
                    if (isNaN(pv.permissibleValue)) {
                        this.invalidCdeMessage = "CDE " + qbElt.naming[0].designation +
                            " contains a Permissible Value that is not a number. It may not be added to a score.";
                    }
                });
            } else {
                this.invalidCdeMessage = "CDE " + qbElt.naming[0].designation +
                    " has a datatype other than 'Number' and may not be added to a score";
            }
        });
    };
}
