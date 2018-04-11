import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';

import { mappings } from '_nativeRenderApp/fhirMapping';
import { CdeForm, DisplayProfile } from 'shared/form/form.model';

@Component({
    selector: 'cde-native-render-standalone',
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
        .addbtn  {
            background-color: #61c200;
            color: white;
            margin-left: 0;
            padding: 4px 8px 2px 8px;
            vertical-align: baseline;
        }
    `],
    templateUrl: './nativeRenderApp.component.html'
})
export class NativeRenderAppComponent {
    elt: CdeForm;
    errorMessage: string;
    methodLoadForm = this.loadForm.bind(this);
    newEncounter = false;
    selectedProfile: DisplayProfile;
    selectedProfileName: string;
    summary = false;

    constructor(private http: HttpClient) {
        let args: any = NativeRenderAppComponent.searchParamsGet();
        this.selectedProfileName = args.selectedProfile;

        if ((<any>window).formElt) {
            let elt = JSON.parse(JSON.stringify((<any>window).formElt));
            this.loadForm(null, elt);
        } else {
            if (args.tinyId) this.getForm(args.tinyId, this.methodLoadForm);
            else this.summary = true;
        }
    }

    getForm(tinyId, cb) {
        this.http.get<CdeForm>('/form/' + tinyId).subscribe(elt => {
            CdeForm.validate(elt);
            cb(null, elt);
        }, (err) => cb(err.statusText));
    }

    static getFormMap(tinyId) {
        let maps = mappings.filter(m => m.form === tinyId
            && m.type === 'external'
            && m.system === 'http://hl7.org/fhir'
            && m.code === '*'
            && m.format === 'json'
        );
        if (maps.length) return maps[0];
        else return null;
    }

    loadForm(err = null, elt = null) {
        if (err) return this.errorMessage = 'Sorry, we are unable to retrieve this element.';
        this.elt = elt;
        if (!this.selectedProfileName) this.selectedProfile = this.elt.displayProfiles[0];
        else {
            let selectedProfileArray = this.elt.displayProfiles.filter(d => d.name === this.selectedProfileName);
            if (selectedProfileArray && selectedProfileArray.length > 0) this.selectedProfile = selectedProfileArray[0];
            else this.selectedProfile = null;
        }
    }

    static searchParamsGet(): string[] {
        let params: any = {};
        location.search && location.search.substr(1).split('&').forEach(e => {
            let p = e.split('=');
            if (p.length === 2) params[p[0]] = decodeURI(p[1]);
            else params[p[0]] = null;
        });
        return params;
    }

}