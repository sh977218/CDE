import { Component, Inject } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA, MatSnackBar } from '@angular/material';
import { ActivatedRoute } from '@angular/router';
import { CdeFhirService, PatientForm } from '_fhirApp/cdeFhir.service';
import { getMapToFhirResource } from 'core/form/formAndFe';
import { interruptEvent } from 'non-core/browser';
import { CdeForm, DisplayProfile } from 'shared/form/form.model';
import { FhirEncounter, FhirObservation } from 'shared/mapping/fhir/fhirResource.model';
import { codingArrayPreview, getDateString, valuePreview } from 'shared/mapping/fhir/fhirDatatypes';
import { getText, getTextFromArray } from 'shared/mapping/fhir/datatype/fhirCodeableConcept';
import { getPatientName } from 'shared/mapping/fhir/resource/fhirPatient';

function getObservationViewCode(observation: FhirObservation): string {
    return observation.code ? codingArrayPreview(observation.code.coding) : '';
}
function getObservationViewValue(observation: FhirObservation): string {
    return valuePreview(observation);
}

export type FhirAppViewModes = 'browse'|'filter'|'form';

@Component({
    selector: 'cde-fhir-standalone',
    template: '<router-outlet></router-outlet>'
})
export class FhirStandaloneComponent {
}

@Component({
    selector: 'cde-fhir-form',
    styles: [`
        .info-heading {
            display: inline-block;
            font-size: large;
            font-stretch: extra-condensed;
            width: 90px;
        }

        .info-label {
            font-size: large;
            font-weight: 600;
        }

        .isSelected {
            background-color: #f5f5f5;
        }

        .addbtn {
            background-color: #61c200;
            color: white;
            margin-left: 0;
            padding: 4px 8px 2px 8px;
            vertical-align: baseline;
        }

        .spin {
            animation-duration: 1s;
            animation-name: spin;
            animation-iteration-count: infinite;
            animation-timing-function: linear;
        }

        @keyframes spin {
            from {
                transform: rotate(0deg);
            }
            to {
                transform: rotate(360deg);
            }
        }
    `],
    templateUrl: './fhirApp.component.html'
})
export class FhirAppComponent {
    browseEncounters?: FhirEncounter[];
    browseMode: ''|'Encounter' = '';
    readonly browseOptions = ['', 'Encounter'];
    errorMessage?: string;
    getDateString = getDateString;
    getPatientName = getPatientName;
    interruptEvent = interruptEvent;
    mode: FhirAppViewModes = 'filter';
    saveMessage?: string;
    selectedProfile?: DisplayProfile;
    selectedProfileName: string;
    saving = false;
    saved = false;

    constructor(public cdeFhir: CdeFhirService,
                public dialog: MatDialog,
                public snackBar: MatSnackBar,
                private route: ActivatedRoute) {
        this.selectedProfileName = this.route.snapshot.queryParams.selectedProfile;
        cdeFhir.init(this.route.snapshot, this.cleanupPatient.bind(this), err => this.errorMessage = err);
    }

    browseResourceSelected() {
        this.browseEncounters = undefined;
        if (this.browseMode === 'Encounter') {
            this.cdeFhir.fhirData.search<FhirEncounter>('Encounter', {}).then(e => {
                this.browseEncounters = e;
            });
        }
    }

    cleanupPatient() {
        this.browseMode = '';
        this.browseEncounters = undefined;
    }

    modeChange(mode: FhirAppViewModes) {
        this.mode = mode;
    }

    formResourceLabel(form: CdeForm) {
        return getMapToFhirResource(form) || '';
    }

    loadForm(f: PatientForm) {
        this.saving = true;
        this.cdeFhir.loadFormData(f, () => {
            this.saving = false;
            this.selectedProfile = this.selectedProfileName
                ? this.cdeFhir.renderedResourceTree.crossReference.displayProfiles
                    .filter((d: DisplayProfile) => d.name === this.selectedProfileName)[0]
                : this.cdeFhir.renderedResourceTree.crossReference.displayProfiles[0];
        });
    }

    submitForm() {
        this.saving = true;
        this.cdeFhir.submit(err => {
            this.saving = false;
            if (err) {
                this.saveMessage = err;
            } else {
                this.saved = true;
                setTimeout(() => this.saved = false, 5000);
            }
        });
    }
}

@Component({
    template: `
        <div mat-dialog-content>
            <table class="table">
                <thead>
                <tr>
                    <th>Observation</th>
                    <th>Value</th>
                    <th>Date</th>
                </tr>
                </thead>
                <tbody>
                <tr *ngFor="let o of data.observations">
                    <td>{{getObservationViewCode(o)}}</td>
                    <td>
                        <pre>{{getObservationViewValue(o)}}</pre>
                    </td>
                    <td>{{getDateString(o, 'effectivePeriod', 'effectiveDateTime')}}</td>
                </tr>
                </tbody>
            </table>
            <table class="table">
                <thead>
                <tr>
                    <th>Category</th>
                    <th>Code</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Date</th>
                </tr>
                </thead>
                <tbody>
                <tr *ngFor="let p of data.procedures">
                    <td>{{getText(p.category)}}</td>
                    <td>{{getText(p.code)}}</td>
                    <td>{{getTextFromArray(p.reasonCode)}}</td>
                    <td>{{p.status}}</td>
                    <td>{{getDateString(p, 'performedPeriod', 'performedDateTime')}}</td>
                </tr>
                </tbody>
            </table>
        </div>
        <div mat-dialog-actions>
            <button mat-raised-button color="basic" mat-dialog-close cdkFocusInitial>Close</button>
        </div>
    `,
})
export class ViewFhirEncounterDialogComponent {
    constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    }
    getDateString = getDateString;
    getObservationViewCode = getObservationViewCode;
    getObservationViewValue = getObservationViewValue;
    getText = getText;
    getTextFromArray = getTextFromArray;
}

