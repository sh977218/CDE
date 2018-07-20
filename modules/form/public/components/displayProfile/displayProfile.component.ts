import { Component, EventEmitter, Input, Output } from '@angular/core';

import { FormViewComponent } from 'form/public/components/formView.component';
import { UcumService } from 'form/public/ucum.service';
import { CdeForm, DisplayProfile } from 'shared/form/form.model';
import { iterateFeSync } from 'shared/form/formShared';
import { CodeAndSystem } from 'shared/models.model';
import { BrowserService } from 'widget/browser.service';
import { FhirProcedureMappingComponent } from 'form/public/components/fhir/fhirProcedureMapping.component';
import { getFormQuestionsReal } from 'shared/form/formShared';
import { MatDialog } from '@angular/material';

type DisplayProfileVM = {
    aliases: {
        date: Date,
        edit: boolean,
    },
    profile: DisplayProfile,
    sample: CdeForm,
};

@Component({
    selector: 'cde-display-profile',
    styles: [`
        .hoverEdit:hover {
            background-color: lightgreen;
        }
        .mat-form-field,
        .mat-slider,
        :host ::ng-deep .mat-checkbox-layout {
            width: 100%;
        }
        :host ::ng-deep .mat-checkbox-inner-container {
            margin-left: inherit;
        }
        .mat-icon {
            font-size: 1.2em;
            height: 1.2em;
            width: 1.2em;
        }
    `],
    templateUrl: './displayProfile.component.html',
})
export class DisplayProfileComponent {
    @Input() set elt(e: CdeForm) {
        this._elt = e;
        this.dPVMs.length = 0;
        this.elt.displayProfiles.forEach(profile => this.dPVMs.push(DisplayProfileComponent.dPVMNew(profile)));
    }
    get elt() {
        return this._elt;
    }
    @Input() public canEdit: boolean = false;
    @Output() onEltChange = new EventEmitter();
    BrowserService = BrowserService;
    private _elt: CdeForm;
    dPVMs: DisplayProfileVM[] = [];
    uoms: {u: CodeAndSystem, a: string[]}[] = [];
    uomsDate: Date;
    uomsPromise: Promise<void>;

    constructor(public dialog: MatDialog,
                private ucumService: UcumService,
                private formViewComponent: FormViewComponent) {
    }

    addProfile() {
        let newProfile = new DisplayProfile('New Profile');
        if (!this.elt.displayProfiles) this.elt.displayProfiles = [newProfile];
        else this.elt.displayProfiles.push(newProfile);
        this.dPVMs.push(DisplayProfileComponent.dPVMNew(newProfile));
        this.onEltChange.emit();
    }

    static dPVMNew(profile): DisplayProfileVM {
        return {
            aliases: {
                date: undefined,
                edit: false,
            },
            profile: profile,
            sample: DisplayProfileComponent.getSample(),
        };
    }

    static getSample() {
        return JSON.parse(JSON.stringify(this.sampleElt));
    }

    getUoms(): Promise<void> {
        if (this.uomsDate === this.elt.updated) {
            return this.uomsPromise;
        }

        return this.uomsPromise = new Promise<void>(resolve => {
            let resourceCount = 0;
            this.uoms.length = 0;
            this.uomsDate = this.elt.updated;
            iterateFeSync(this.elt, undefined, undefined, q => {
                if (Array.isArray(q.question.unitsOfMeasure)) {
                    q.question.unitsOfMeasure.filter(u => u.system === 'UCUM').forEach(u => {
                        resourceCount++;
                        this.ucumService.getUnitNames(u.code, names => {
                            this.saveAliases(this.uoms, u, names);
                            if (--resourceCount === 0) resolve();
                        });
                    });
                }
            });
        });
    }

    profileAliasGet(dPVM: DisplayProfileVM, v: CodeAndSystem) {
        let matches = dPVM.profile.unitsOfMeasureAlias.filter(a => CodeAndSystem.compare(a.unitOfMeasure, v));
        return matches.length ? matches[0].alias : v.code;
    }

    profileAliasSet(dPVM: DisplayProfileVM, v: CodeAndSystem, a: string) {
        if (a === v.code) {
            let indexes = [];
            dPVM.profile.unitsOfMeasureAlias.forEach((a, i) => {
                if (a.unitOfMeasure.code === v.code && a.unitOfMeasure.system === v.system) {
                    indexes.push(i);
                }
            });
            indexes.reverse().forEach(i => dPVM.profile.unitsOfMeasureAlias.splice(i, 1));
        } else {
            let existing = dPVM.profile.unitsOfMeasureAlias.filter(u => CodeAndSystem.compare(u.unitOfMeasure, v));
            if (existing.length) {
                existing[0].alias = a;
            } else {
                dPVM.profile.unitsOfMeasureAlias.push({unitOfMeasure: v, alias: a});
            }
        }
        this.onEltChange.emit();
    }

    profileUomsEditCreate(dPVM: DisplayProfileVM) {
        if (!dPVM) return;

        this.getUoms().then(() => {
            if (dPVM.aliases && dPVM.aliases.date === this.uomsDate) return;

            for (let u of dPVM.profile.unitsOfMeasureAlias) {
                let found = this.uoms.filter(a => CodeAndSystem.compare(a.u, u.unitOfMeasure));
                if (!found.length || !found.map(a => a.a.indexOf(u.alias)).every(r => r > 0)) {
                    dPVM.profile.unitsOfMeasureAlias.splice(dPVM.profile.unitsOfMeasureAlias.indexOf(u), 1);
                    this.onEltChange.emit();
                }
            }
            dPVM.aliases.date = this.uomsDate;
        });
    }

    removeDisplayProfile(index) {
        this.elt.displayProfiles.splice(index, 1);
        this.dPVMs.splice(index, 1);
        this.onEltChange.emit();
    }

    saveAliases(aliases: any[], v: CodeAndSystem, a: string[]) {
        let match = a.indexOf(v.code);
        if (match > -1) a.splice(match, 1);
        a.unshift(v.code);

        let existing = aliases.filter(u => CodeAndSystem.compare(u.u, v));
        if (existing.length) {
            existing[0].a = a;
        } else {
            aliases.push({u: v, a: a});
        }
    }

    setDisplayType(dPVM: DisplayProfileVM) {
        let profile = DisplayProfile.copy(dPVM.profile);
        this.substituteProfile(dPVM, profile);
        this.onEltChange.emit();
    }

    substituteProfile(dPVM: DisplayProfileVM, profile: DisplayProfile) {
        this.elt.displayProfiles[this.elt.displayProfiles.indexOf(dPVM.profile)] = profile;
        this.dPVMs.filter(p => p === dPVM)[0].profile = profile;
    }

    onChange(p: DisplayProfile, event) {
        p.numberOfColumns = parseInt(event);
        this.onEltChange.emit();
    }

    uomAliasEdit(dPVM: DisplayProfileVM) {
        if (!this.canEdit) return;
        dPVM.aliases.edit = !dPVM.aliases.edit;
        if (dPVM.aliases.edit) this.profileUomsEditCreate(dPVM);
    }

    static sampleElt = {
        "formElements": [
            {
                "label": "Section",
                "elementType": "section",
                "skipLogic": {
                    "condition": ""
                },
                "formElements": [
                    {
                        "label": "",
                        "elementType": "section",
                        "skipLogic": {
                            "condition": ""
                        },
                        "formElements": [
                            {
                                "elementType": "question",
                                "label": "Lately I felt cheerful.",
                                "skipLogic": {
                                    "condition": ""
                                },
                                "formElements": [],
                                "question": {
                                    "datatype": "Value List",
                                    "answers": [
                                        {
                                            "permissibleValue": "5",
                                            "valueMeaningName": "Always"
                                        },
                                        {
                                            "permissibleValue": "4",
                                            "valueMeaningName": "Often"
                                        },
                                        {
                                            "permissibleValue": "3",
                                            "valueMeaningName": "Sometimes"
                                        },
                                        {
                                            "permissibleValue": "2",
                                            "valueMeaningName": "Rarely"
                                        },
                                        {
                                            "permissibleValue": "1",
                                            "valueMeaningName": "Never"
                                        }
                                    ],
                                    "editable": true,
                                    "required": false,
                                    "unitsOfMeasure": [],
                                    "cde": {
                                        "ids": [],
                                        "permissibleValues": [
                                            {
                                                "permissibleValue": "5",
                                                "valueMeaningName": "Always"
                                            },
                                            {
                                                "permissibleValue": "4",
                                                "valueMeaningName": "Often"
                                            },
                                            {
                                                "permissibleValue": "3",
                                                "valueMeaningName": "Sometimes"
                                            },
                                            {
                                                "permissibleValue": "2",
                                                "valueMeaningName": "Rarely"
                                            },
                                            {
                                                "permissibleValue": "1",
                                                "valueMeaningName": "Never"
                                            }
                                        ],
                                    }
                                },
                                "cardinality": {
                                    "min": 1,
                                    "max": 1
                                },
                                "hideLabel": false
                            },
                            {
                                "elementType": "question",
                                "label": "Lately I felt confident.",
                                "skipLogic": {
                                    "condition": ""
                                },
                                "formElements": [],
                                "question": {
                                    "datatype": "Value List",
                                    "answers": [
                                        {
                                            "permissibleValue": "5",
                                            "valueMeaningName": "Always"
                                        },
                                        {
                                            "permissibleValue": "4",
                                            "valueMeaningName": "Often"
                                        },
                                        {
                                            "permissibleValue": "3",
                                            "valueMeaningName": "Sometimes"
                                        },
                                        {
                                            "permissibleValue": "2",
                                            "valueMeaningName": "Rarely"
                                        },
                                        {
                                            "permissibleValue": "1",
                                            "valueMeaningName": "Never"
                                        }
                                    ],
                                    "editable": true,
                                    "invisible": true,
                                    "required": false,
                                    "unitsOfMeasure": [],
                                    "cde": {
                                        "ids": [],
                                        "permissibleValues": [
                                            {
                                                "permissibleValue": "5",
                                                "valueMeaningName": "Always"
                                            },
                                            {
                                                "permissibleValue": "4",
                                                "valueMeaningName": "Often"
                                            },
                                            {
                                                "permissibleValue": "3",
                                                "valueMeaningName": "Sometimes"
                                            },
                                            {
                                                "permissibleValue": "2",
                                                "valueMeaningName": "Rarely"
                                            },
                                            {
                                                "permissibleValue": "1",
                                                "valueMeaningName": "Never"
                                            }
                                        ]
                                    }
                                },
                                "cardinality": {
                                    "min": 1,
                                    "max": 1
                                },
                                "hideLabel": false
                            }
                        ],
                        "question": {
                            "answers": [],
                            "editable": true,
                            "required": false,
                            "unitsOfMeasure": []
                        },
                        "cardinality": {
                            "min": 1,
                            "max": 1
                        },
                        "hideLabel": false
                    },
                    {
                        "elementType": "question",
                        "label": "Education level USA type",
                        "skipLogic": {
                            "condition": ""
                        },
                        "formElements": [],
                        "question": {
                            "datatype": "Value List",
                            "defaultAnswer": "Never attended/Kindergarten only",
                            "answer": "Never attended/Kindergarten only",
                            "answers": [
                                {
                                    "permissibleValue": "Never attended/Kindergarten only",
                                    "valueMeaningName": "Never attended/Kindergarten only"
                                },
                                {
                                    "permissibleValue": "1st Grade",
                                    "valueMeaningName": "1st Grade"
                                },
                                {
                                    "permissibleValue": "2nd Grade",
                                    "valueMeaningName": "2nd Grade"
                                },
                                {
                                    "permissibleValue": "3rd Grade",
                                    "valueMeaningName": "3rd Grade"
                                },
                                {
                                    "permissibleValue": "4th Grade",
                                    "valueMeaningName": "4th Grade"
                                },
                                {
                                    "permissibleValue": "5th Grade",
                                    "valueMeaningName": "5th Grade"
                                },
                                {
                                    "permissibleValue": "6th Grade",
                                    "valueMeaningName": "6th Grade"
                                },
                                {
                                    "permissibleValue": "7th Grade",
                                    "valueMeaningName": "7th Grade"
                                },
                                {
                                    "permissibleValue": "8th Grade",
                                    "valueMeaningName": "8th Grade"
                                },
                                {
                                    "permissibleValue": "9th Grade",
                                    "valueMeaningName": "9th Grade"
                                },
                                {
                                    "permissibleValue": "10th Grade",
                                    "valueMeaningName": "10th Grade"
                                },
                                {
                                    "permissibleValue": "11th Grade",
                                    "valueMeaningName": "11th Grade"
                                }
                            ],
                            "editable": true,
                            "required": false,
                            "unitsOfMeasure": [],
                            "cde": {
                                "ids": [],
                                "permissibleValues": [
                                    {
                                        "permissibleValue": "Never attended/Kindergarten only",
                                        "valueMeaningName": "Never attended/Kindergarten only"
                                    },
                                    {
                                        "permissibleValue": "1st Grade",
                                        "valueMeaningName": "1st Grade"
                                    },
                                    {
                                        "permissibleValue": "2nd Grade",
                                        "valueMeaningName": "2nd Grade"
                                    },
                                    {
                                        "permissibleValue": "3rd Grade",
                                        "valueMeaningName": "3rd Grade"
                                    },
                                    {
                                        "permissibleValue": "4th Grade",
                                        "valueMeaningName": "4th Grade"
                                    },
                                    {
                                        "permissibleValue": "5th Grade",
                                        "valueMeaningName": "5th Grade"
                                    },
                                    {
                                        "permissibleValue": "6th Grade",
                                        "valueMeaningName": "6th Grade"
                                    },
                                    {
                                        "permissibleValue": "7th Grade",
                                        "valueMeaningName": "7th Grade"
                                    },
                                    {
                                        "permissibleValue": "8th Grade",
                                        "valueMeaningName": "8th Grade"
                                    },
                                    {
                                        "permissibleValue": "9th Grade",
                                        "valueMeaningName": "9th Grade"
                                    },
                                    {
                                        "permissibleValue": "10th Grade",
                                        "valueMeaningName": "10th Grade"
                                    },
                                    {
                                        "permissibleValue": "11th Grade",
                                        "valueMeaningName": "11th Grade"
                                    }
                                ]
                            }
                        },
                        "cardinality": {
                            "min": 1,
                            "max": 1
                        },
                        "hideLabel": false
                    },
                    {
                        "elementType": "question",
                        "label": "Person Birth Date",
                        "skipLogic": {
                            "condition": "\"Education level USA type\" = \"Never attended/Kindergarten only\""
                        },
                        "formElements": [],
                        "question": {
                            "datatype": "DATE",
                            "datatypeDate": {"precision": "Month"},
                            "answers": [],
                            "editable": true,
                            "required": false,
                            "unitsOfMeasure": [],
                            "cde": {
                                "ids": []
                            }
                        },
                        "cardinality": {
                            "min": 1,
                            "max": 1
                        },
                        "instructions": {
                            "value": "Include year and month but no day."
                        },
                        "hideLabel": false
                    }
                ],
                "question": {
                    "answers": [],
                    "editable": true,
                    "required": false,
                    "unitsOfMeasure": []
                },
                "cardinality": {
                    "min": 1,
                    "max": 1
                },
                "instructions": {
                    "value": "Fill out to the best of your knowledge."
                }
            }
        ]
    };

    openProcedureMapping(dpvm) {
        let dialogRef = this.dialog.open(FhirProcedureMappingComponent, {
            width: '700px',
            data: {
                questions: getFormQuestionsReal(this.elt),
                mapping: this.elt.displayProfiles[0].fhirProcedureMapping
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                dpvm.profile.fhirProcedureMapping = result;
                this.onEltChange.emit();
            }
        });
    }

}