import { Component } from '@angular/core';
import { FormService } from 'nativeRender/form.service';
import { CdeForm, DisplayProfile } from 'shared/form/form.model';
import { CbErr1 } from 'shared/models.model';

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

    constructor() {
        const args: any = NativeRenderAppComponent.searchParamsGet();
        this.selectedProfileName = args.selectedProfile;
        this.submitForm = args.submit !== undefined;
        if ((window as any).formElt) {
            const elt = JSON.parse(JSON.stringify((window as any).formElt));
            this.loadForm(undefined, elt);
        } else {
            if (args.tinyId) {
                this.getForm(args.tinyId, this.methodLoadForm);
            } else {
                this.summary = true;
            }
        }
    }
    elt?: CdeForm;
    errorMessage?: string;
    methodLoadForm = this.loadForm.bind(this);
    selectedProfile?: DisplayProfile;
    selectedProfileName: string;
    summary = false;
    submitForm: boolean;

    getForm(tinyId: string, cb: CbErr1<CdeForm | undefined>) {
        FormService.fetchForm(tinyId).then(elt => {
            cb(undefined, elt);
        }, err => cb(err.statusText, undefined));
    }

    loadForm(err?: string, elt?: CdeForm) {
        if (err || !elt) {
            return this.errorMessage = 'Sorry, we are unable to retrieve this element.';
        }
        CdeForm.validate(elt);
        this.elt = elt;
        this.selectedProfile = this.selectedProfileName
            ? this.elt.displayProfiles.filter(d => d.name === this.selectedProfileName)[0]
            : this.elt.displayProfiles[0];
    }

    static searchParamsGet(): string[] {
        const params: any = {};
        if (location.search) {
            location.search.substr(1).split('&').forEach(e => {
                const p = e.split('=');
                if (p.length === 2) {
                    params[p[0]] = decodeURI(p[1]);
                } else {
                    params[p[0]] = null;
                }
            });
        }
        return params;
    }
}
