import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';

import './metadata-item.scss';
import { NativeQuestionComponent } from 'nativeRender/nativeQuestion.component';

const ACCESSGUDID_LOOKUP = 'https://accessgudid.nlm.nih.gov/api/v1/devices/lookup.json';
const ACCESSGUDID_PARSEUDI = 'https://accessgudid.nlm.nih.gov/api/v1/parse_udi.json?udi=';

@Component({
    selector: 'cde-native-metadata',
    templateUrl: './nativeMetadata.component.html',
})
export class NativeMetadataComponent {
    metadataSearch: string;
    metadataSearchResult: any;
    watchNewState: string;

    constructor(public nativeFe: NativeQuestionComponent, private http: HttpClient) {}

    accessGUDIdSearch(term) {
        return this.http.get<any>(ACCESSGUDID_LOOKUP + (this.nativeFe.metadataTagsNew === 'UDI' ? '?udi=' : '?di=')
            + encodeURIComponent(term)).subscribe((result: any) => {
            if (result.error) {
                return this.metadataSearchResult = null;
            }
            this.metadataSearchResult = result;
            this.addDevice(result);
        }, () => this.metadataSearchResult = null);
    }

    addDevice(accessgudid) {
        let addDI = () => this.nativeFe.formElement.metadataTags.push({key: 'device', value: accessgudid});
        if (!this.nativeFe.formElement.metadataTags) this.nativeFe.formElement.metadataTags = [];
        if (this.nativeFe.metadataTagsNew === 'UDI') {
            this.http.get<any>(ACCESSGUDID_PARSEUDI + encodeURIComponent(this.metadataSearch)).subscribe(udi => {
                if (udi.error) {
                    return addDI();
                }
                accessgudid.udi = udi;
                addDI();
            }, addDI);
        } else {
            addDI();
        }
        this.nativeFe.metadataTagsNew = undefined;
        this.metadataSearch = undefined;
        this.metadataSearchResult = undefined;
        this.watchNewState = undefined;
    }

    moveFocus(field: HTMLElement) {
        field.focus();
        this.watchNewState = this.nativeFe.metadataTagsNew;
        return false;
    }
}
