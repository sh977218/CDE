import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";

import { FormViewComponent } from 'form/public/components/formView.component';
import { UcumService } from 'form/public/ucum.service';
import { CdeForm, DisplayProfile } from 'shared/form/form.model';
import { iterateFeSync } from 'shared/form/formShared';
import { CodeAndSystem } from 'shared/models.model';

type DisplayProfileVM = {
    aliases: {
        date: Date,
        edit: boolean,
    },
    profile: DisplayProfile,
    sample: CdeForm,
    showDelete: boolean,
};

@Component({
    selector: "cde-display-profile",
    styles: [`
        .hoverEdit:hover {
            background-color: lightgreen;
        }
    `],
    templateUrl: "./displayProfile.component.html",
})
export class DisplayProfileComponent implements OnInit {
    @Input() elt: CdeForm;
    @Input() public canEdit: boolean = false;
    @Output() onEltChange = new EventEmitter();

    dPVMs: DisplayProfileVM[] = [];
    uoms: {u: CodeAndSystem, a: string[]}[] = [];
    uomsDate: Date;
    uomsPromise: Promise<void>;

    ngOnInit() {
        this.elt.displayProfiles.forEach(profile => this.dPVMs.push(DisplayProfileComponent.dPVMNew(profile)));
    }

    constructor(private ucumService: UcumService, private formViewComponent: FormViewComponent) {
    }

    addProfile() {
        let newProfile = new DisplayProfile("New Profile");
        if (!this.elt.displayProfiles)
            this.elt.displayProfiles = [newProfile];
        else
            this.elt.displayProfiles.push(newProfile);
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
            showDelete: false,
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
                            if (--resourceCount === 0)
                                resolve();
                        });
                    });
                }
            });
        });
    }

    profileAliasGet(dPVM: DisplayProfileVM, v: CodeAndSystem) {
        let matches = dPVM.profile.unitsOfMeasureAlias.filter(a => a.unitOfMeasure.compare(v));
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
            let existing = dPVM.profile.unitsOfMeasureAlias.filter(u => u.unitOfMeasure.compare(v));
            if (existing.length) {
                existing[0].alias = a;
            } else {
                dPVM.profile.unitsOfMeasureAlias.push({unitOfMeasure: v, alias: a});
            }
        }
        this.onEltChange.emit();
    }

    profileUomsEditCreate(dPVM: DisplayProfileVM) {
        if (!dPVM)
            return;

        this.getUoms().then(() => {
            if (dPVM.aliases && dPVM.aliases.date === this.uomsDate)
                return;

            for (let u of dPVM.profile.unitsOfMeasureAlias) {
                if (!this.uoms.filter(a => a.u.compare(u.unitOfMeasure))
                        .map(a => a.a.indexOf(u.alias)).every(r => r > 0)) {
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

        let existing = aliases.filter(u => u.u.compare(v));
        if (existing.length) {
            existing[0].a = a;
        } else {
            aliases.push({u: v, a: a});
        }
    }

    setDisplayType(profile: DisplayProfile, $event) {
        profile.displayType = $event.target.checked ? 'Follow-up' : 'Dynamic';
        this.onEltChange.emit();
    }

    onChange(p: DisplayProfile, event) {
        p.numberOfColumns = parseInt(event);
        this.onEltChange.emit();
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

}