import { Injectable } from '@angular/core';
import * as FHIR from 'fhirclient';

import { asRefString } from 'shared/mapping/fhir/datatype/fhirReference';
import {
    FhirDomainResource, FhirEncounter, FhirEpisodeOfCare, FhirPatient
} from 'shared/mapping/fhir/fhirResource.model';
import { deepCopy } from 'shared/system/util';

const SCOPE = 'patient/*.*';

@Injectable()
export class FhirSmartService {
    baseUrl?: string;
    context?: FhirEncounter|FhirEpisodeOfCare;
    patient?: FhirPatient;
    client: any;

    init() {
        FHIR.oauth2.ready((client: any) => {
            this.client = client;
            this.client.request(`Patient/${client.patient.id}`).then((patient: FhirPatient) => this.patient = patient);
        });
    }

    save<T>(resource: FhirDomainResource): Promise<T> {
        if (resource.id) {
            // TODO: refresh before copy from server and compare again to prevent save with conflict
            return Promise.resolve(this.client.update(resource)).then(response => response, err => {
                console.log(err);
                return Promise.reject(resource.resourceType + ' ' + resource.id + ' not saved.');
            });
        } else {
            return Promise.resolve(this.client.create(resource)).then(response => response, err => {
                console.log(err);
                return Promise.reject(resource.resourceType + ' not created.');
            });
        }
    }

    search<T>(resourceType: string, query: any): Promise<T[]> {
        const contextQuery = deepCopy(query);
        if (this.patient) {
            contextQuery.patient = asRefString(this.patient);
        }
        if (this.context && ['Encounter'].indexOf(resourceType) === -1) {
            contextQuery.context = asRefString(this.context);
        }
        return this.searchAll(resourceType, contextQuery);
    }

    searchAll<T>(resourceType: string, query: any): Promise<T[]> {
        const thisQuery = new URLSearchParams();
        thisQuery.set('code', query.code);
        thisQuery.set('patient', query.patient);
        return Promise.resolve(this.client.request(`${resourceType}?${thisQuery}`)).then(r => {
            if (r) {
                if (r.total > 0 && r.entry && Array.isArray(r.entry)) {
                    return r.entry.map((e: any) => e.resource);
                } else {
                    return [];
                }
            } else {
                throw new Error('network error or unavailable');
            }
        });
    }

    static authorize(clientId: string, config: string) {
        FHIR.oauth2.authorize({
            client_id: clientId,
            redirect_uri: '/fhir/form/' + config,
            scope: SCOPE,
        } as any);
    }
}
    // addDevice(deviceRef: FhirReference<FhirDevice | FhirDeviceMetric>, containers: Array<FhirEncounter | FhirObservation>): boolean {
    //     if (deviceRef.reference.indexOf('Device/') !== 0) {
    //         return false;
    //     }
    //     let id = deviceRef.reference.substr(7);
    //     let found = false;
    //     containers.forEach(c => {
    //         if (Array.isArray(c.contained)) {
    //             found = c.contained.some(r => {
    //                 if (typeof((r as FhirDomainResource).resourceType) !== 'undefined'
    //                     && (r as FhirDomainResource).resourceType === 'Device' && r.id === id) {
    //                     // add to resourceTree r as FhirDevice
    //                     return true;
    //                 }
    //             });
    //         }
    //     });
    //     if (!found) {
    //         // TODO: query for Device
    //     }
    //     return found;
    // }
