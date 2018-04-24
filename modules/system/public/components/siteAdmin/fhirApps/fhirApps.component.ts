import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';

@Component({
    selector: 'cde-fhir-apps',
    templateUrl: './fhirApps.component.html'
})
export class FhirAppsComponent {

    public constructor(private http: HttpClient) {

    }

}