import { Component, Input } from '@angular/core';

import { FhirSmartService } from '_fhirApp/fhirSmart.service';
import { getDateString } from 'shared/mapping/fhir/fhirDatatypes';
import { FhirEncounter } from 'shared/mapping/fhir/fhirResource.model';
import { newEncounter } from 'shared/mapping/fhir/resource/fhirEncounter';
import { asRefString } from 'shared/mapping/fhir/datatype/fhirReference';

@Component({
    selector: 'cde-fhir-browser-encounter',
    templateUrl: './fhirBrowserEncounter.component.html',
})
export class FhirBrowserEncounterComponent {
    @Input() encounters!: FhirEncounter[];
    getDateString = getDateString;
    newEncounter?: boolean;
    newEncounterDate?: string = new Date().toISOString().slice(0, 16);
    newEncounterErrorMessage?: string;
    newEncounterReason?: string;
    newEncounterType = 'Outpatient Encounter';
    newEncounterValid?: boolean;
    selectedEncounter?: FhirEncounter;

    constructor(private fhirData: FhirSmartService) {}

    add() {
        this.fhirData.smart.patient.api.create({
            baseUrl: this.fhirData.baseUrl,
            type: 'Encounter',
            data: JSON.stringify(newEncounter(
                this.newEncounterDate + ':00-00:00',
                'Patient/' + this.fhirData.patient.id,
                this.fhirData.patient.managingOrganization
                    ? asRefString(this.fhirData.patient.managingOrganization) : undefined
            ))
        }).then((response: any) => {
            const encounter: FhirEncounter = response.data;
            this.reset();
        });
    }

    reset() {
        this.newEncounter = false;
        this.newEncounterDate = undefined;
        this.newEncounterErrorMessage = undefined;
        this.newEncounterReason = undefined;
        this.newEncounterType = 'Outpatient Encounter';
        this.newEncounterValid = false;
    }

    selectEncounter(e: FhirEncounter) {
        this.selectedEncounter = e;
    }

    verify() {
        if (!this.newEncounterType || !this.newEncounterDate) {
            this.newEncounterErrorMessage = 'Error: Type and Date are required.';
            this.newEncounterValid = false;
        } else {
            this.newEncounterErrorMessage = '';
            this.newEncounterValid = true;
        }
    }

    // openView(e) {
    //     // query observation array
    //     // query procedure array
    //     this.dialog.open(ViewFhirEncounterDialogComponent, {
    //         data: {
    //             observations: observations,
    //             procedures: procedures,
    //         },
    //         width: '700px',
    //     });
    // }
}
