import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FhirApp } from 'shared/form/form.model';

@Component({
    selector: 'cde-fhir-apps',
    templateUrl: './fhirApps.component.html',
    styles: [`
        .table td {
            padding: 0;
        }
    `]
})
export class FhirAppsComponent {
    fhirApps!: FhirApp[];

    constructor(private http: HttpClient) {
        this.loadAllApps();
    }

    deleteApp(app: FhirApp) {
        this.http.delete('/fhirApp/' + app._id).subscribe(() => this.loadAllApps());
    }

    formsUpdated(event: any, app: FhirApp) {
        app.forms = event.target.value.split(',')
            .map((id: string) => id.trim())
            .filter((id: string) => id)
            .map((id: string) => ({tinyId: id}));
        this.saveApp(app);
    }

    getFormIds(app: FhirApp) {
        return app.forms.map(f => f.tinyId).join(',');
    }

    loadAllApps() {
        this.http.get<FhirApp[]>('/fhirApps').subscribe(res => this.fhirApps = res);
    }

    newApp() {
        this.saveApp(new FhirApp());
    }

    saveApp(app: FhirApp) {
        this.http.post('/fhirApp', app).subscribe(() => this.loadAllApps());
    }
}
