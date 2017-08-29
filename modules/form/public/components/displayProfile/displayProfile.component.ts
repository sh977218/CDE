import { Component, EventEmitter, Inject, Input, Output } from "@angular/core";

import "nouislider/distribute/nouislider.min.css";

import "rxjs/add/operator/map";

@Component({
    selector: "cde-display-profile",
    templateUrl: "./displayProfile.component.html"
})
export class DisplayProfileComponent {

    constructor(@Inject("isAllowedModel") public isAllowedModel) {
    }

    @Input() elt: any;
    @Output() onEltChange = new EventEmitter();

    showDelete: boolean;

    addProfile() {
        let newProfile = {
            name: "New Profile",
            displayInstructions: true,
            displayNumbering: true,
            sectionsAsMatrix: true,
            displayValues: false,
            displayType: 'Follow-up',
            numberOfColumns: 4,
            displayInvisible: false,
            repeatFormat: "#."
        };
        if (!this.elt.displayProfiles) this.elt.displayProfiles = [newProfile];
        else this.elt.displayProfiles.push(newProfile);
        this.onEltChange.emit();
    };

    removeDisplayProfile(index) {
        this.elt.displayProfiles.splice(index, 1);
        this.onEltChange.emit();
    };

    setDisplayType(profile, $event) {
        profile.displayType = $event.target.checked ? 'Follow-up' : 'Dynamic';
        this.onEltChange.emit();
    }

    sampleElt = {
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
                                        "ids": []
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
                                        "ids": []
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
                                "ids": []
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