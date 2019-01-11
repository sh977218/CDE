import { Component } from '@angular/core';
import { FormService } from 'nativeRender/form.service';
import { CdeForm, DisplayProfile } from 'shared/form/form.model';
import { CbErr } from 'shared/models.model';

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
    elt?: CdeForm;
    errorMessage?: string;
    methodLoadForm = this.loadForm.bind(this);
    selectedProfile?: DisplayProfile;
    selectedProfileName: string;
    summary = false;
    submitForm: boolean;

    constructor() {
        let args: any = NativeRenderAppComponent.searchParamsGet();
        this.selectedProfileName = args.selectedProfile;
        this.submitForm = args.submit !== undefined;
        if ((<any>window).formElt) {
            let elt = JSON.parse(JSON.stringify((<any>window).formElt));
            this.loadForm(undefined, elt);
        } else {
            if (args.tinyId) {
                this.getForm(args.tinyId, this.methodLoadForm);
            } else {
                this.summary = true;
            }
        }
    }

    getForm(tinyId: string, cb: CbErr<CdeForm>) {
        FormService.fetchForm(tinyId).then(elt => {
            CdeForm.validate(elt);
            cb(undefined, elt);
        }, err => cb(err.statusText));
    }

    loadForm(err?: string, elt?: CdeForm) {
        if (err || !elt) {
            return this.errorMessage = 'Sorry, we are unable to retrieve this element.';
        }
        this.elt = elt;
        if (!this.selectedProfileName) {
            this.selectedProfile = this.elt.displayProfiles[0];
        } else {
            let selectedProfileArray = this.elt.displayProfiles.filter(d => d.name === this.selectedProfileName);
            if (selectedProfileArray && selectedProfileArray.length > 0) this.selectedProfile = selectedProfileArray[0];
            else this.selectedProfile = undefined;
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
