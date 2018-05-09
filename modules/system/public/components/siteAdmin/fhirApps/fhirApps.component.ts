import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';

@Component({
    selector: 'cde-fhir-apps',
    templateUrl: './fhirApps.component.html'
})
export class FhirAppsComponent {

    fhirApps: any;

    public constructor(private http: HttpClient) {
        this.loadAllApps();
    }

    deleteApp (app) {
        this.http.delete("/fhirApp/" + app._id).subscribe(() => this.loadAllApps());
    }

    formsUpdated (event, app) {
        app.forms = event.target.value.split(",").map(id => ({tinyId: id.trim()})).filter(form => form.tinyId);
        this.saveApp(app);
    }

    getFormIds (app) {
        return app.forms.map(f => f.tinyId).join(",");
    }

    loadAllApps () {
        this.http.get('/fhirApps').subscribe(res => this.fhirApps = res);
    }

    newApp () {
        this.saveApp({
            forms: [],
            clientId: ""
        });
    }

    saveApp (app) {
        this.http.post("/fhirApp", app).subscribe(() => this.loadAllApps());
    }

}