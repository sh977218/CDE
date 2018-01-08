import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";

import { CdeForm, DisplayProfile } from 'core/form.model';
import { FormViewComponent } from 'form/public/components/formView.component';
import { FormService } from 'nativeRender/form.service';
import { UcumService } from 'form/public/ucum.service';

type DisplayProfileVM = {
    aliases: {
        date: Date,
        edit: boolean,
        value: Map<string, string>
    },
    profile: DisplayProfile,
    sample: CdeForm,
    showDelete: boolean,
    uomAliasesKeys: string[],
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
    uoms = new Map<string, string[]>();
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
                value: new Map<string, string>(),
            },
            profile: profile,
            sample: DisplayProfileComponent.getSample(),
            showDelete: false,
            uomAliasesKeys: profile.uomAliases ? Object.keys(profile.uomAliases) : [],
        };
    }

    static getSample() {
        return JSON.parse(JSON.stringify(this.sampleElt));
    }

    getUoms(): Promise<void> {
        if (this.uomsDate === this.elt.updated)
            return this.uomsPromise;

        return this.uomsPromise = new Promise<void>(resolve => {
            let resourceCount = 0;
            this.uoms.clear();
            this.uomsDate = this.elt.updated;
            FormService.iterateFeSync(this.elt, undefined, undefined, q => {
                if (Array.isArray(q.question.uoms))
                    q.question.uoms.forEach(u => {
                        resourceCount++;
                        this.ucumService.getUnitNames(u, names => {
                            this.uoms.set(u, names);
                            if (--resourceCount === 0)
                                resolve();
                        });
                    });
            });
        });
    }

    profileUomsEditCreate(dPVM: DisplayProfileVM) {
        if (!dPVM)
            return;

        this.getUoms().then(() => {
            if (dPVM.aliases && dPVM.aliases.date === this.uomsDate)
                return;

            let profile = dPVM.profile;
            dPVM.aliases.date = this.uomsDate;
            this.uoms.forEach((names, uom) => dPVM.aliases.value.set(uom, ''));
            for (let key of dPVM.uomAliasesKeys) {
                let aliases = this.uoms.get(key);
                if (aliases && aliases.indexOf(profile.uomAliases[key]) > -1)
                    dPVM.aliases.value.set(key, profile.uomAliases[key]);
                else
                    delete profile.uomAliases[key];
            }
        });
    }

    profileUomsEditSave(dPVM: DisplayProfileVM, uom: string, value: string) {
        dPVM.aliases.value.set(uom, value);
        dPVM.profile.uomAliases[uom] = value;
        dPVM.uomAliasesKeys = Object.keys(dPVM.profile.uomAliases);
        this.onEltChange.emit();
    }


    removeDisplayProfile(index) {
        this.elt.displayProfiles.splice(index, 1);
        this.dPVMs.splice(index, 1);
        this.onEltChange.emit();
    }

    setDisplayType(profile: DisplayProfile, $event) {
        profile.displayType = $event.target.checked ? 'Follow-up' : 'Dynamic';
        this.onEltChange.emit();
    }

    onChange(p, event) {
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
                                    "uoms": [],
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
                                    "uoms": [],
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
                            "uoms": []
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
                            "uoms": [],
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
                            "uoms": [],
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
                    "uoms": []
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