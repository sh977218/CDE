import { HttpClient } from '@angular/common/http';
import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';

import { DerivationRule } from 'shared/models.model';
import { DataElement } from 'shared/de/dataElement.model';
import { MatDialog } from '@angular/material/dialog';
import { NgForOf, NgIf } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'cde-derivation-rules',
    templateUrl: './derivationRules.component.html',
    standalone: true,
    imports: [NgIf, NgForOf, MatIconModule, RouterLink],
})
export class DerivationRulesComponent implements OnChanges {
    @Input() canEdit!: boolean;
    @Input() elt!: DataElement & { derivationOutputs?: { ruleName: string; cde: DataElement }[] };
    @Output() eltChange = new EventEmitter();

    previousCdeId!: string;

    constructor(private http: HttpClient, public dialog: MatDialog) {}

    ngOnChanges() {
        if (this.elt._id !== this.previousCdeId) {
            this.previousCdeId = this.elt._id;
            this.updateRules();
            this.findDerivationOutputs();
        }
        this.previousCdeId = this.elt._id;
        this.updateRules();
        this.findDerivationOutputs();
    }

    findDerivationOutputs() {
        if (!this.elt.derivationOutputs) {
            this.elt.derivationOutputs = [];
            this.http.get<DataElement[]>('/server/de/derivationOutputs/' + this.elt.tinyId).subscribe(result => {
                result.forEach(outputCde => {
                    outputCde.derivationRules.forEach(derRule => {
                        if (derRule.inputs.indexOf(this.elt.tinyId) > -1) {
                            this.elt.derivationOutputs?.push({ ruleName: derRule.name, cde: outputCde });
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
                    this.http
                        .post<DataElement[]>('/server/de/byTinyIdList/', dr.inputs)
                        .subscribe(data => (dr.fullCdes = data));
                }
            });
        }
    }
}
