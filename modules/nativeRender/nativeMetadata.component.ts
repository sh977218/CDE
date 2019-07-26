import './metadata-item.scss';
import { Component } from '@angular/core';
import { NativeQuestionComponent } from 'nativeRender/nativeQuestion.component';
import { textTruncate } from 'non-core/browser';

const ACCESSGUDID_LOOKUP = 'https://accessgudid.nlm.nih.gov/api/v1/devices/lookup.json';
const ACCESSGUDID_PARSEUDI = 'https://accessgudid.nlm.nih.gov/api/v1/parse_udi.json?udi=';

type AccessGUDIDDevice = any;

@Component({
    selector: 'cde-native-metadata',
    templateUrl: './nativeMetadata.component.html',
})
export class NativeMetadataComponent {

    constructor(public nativeFe: NativeQuestionComponent) {}
    componentClass = NativeMetadataComponent;
    metadataSearch?: string;
    metadataSearchResult: any;
    textTruncate = textTruncate;
    watchNewState?: string;

    static deviceId(accessgudid: AccessGUDIDDevice) {
        const ids = accessgudid.gudid.device.identifiers.identifier;
        if (Array.isArray(ids)) {
            const primary = ids.filter(id => id.deviceIdType === 'Primary');
            return primary.length ? primary[0].deviceId : (ids.length ? ids[0].deviceId : '');
        } else {
            return ids.deviceId;
        }
    }

    static ensureArray(obj: any) {
        return Array.isArray(obj) ? obj : [obj];
    }

    accessGUDIdSearch() {
        if (typeof(this.metadataSearch) === 'string') { this.metadataSearch = this.metadataSearch.trim(); }
        if (!this.metadataSearch) { return; }
        fetch(ACCESSGUDID_LOOKUP
            + (this.nativeFe.metadataTagsNew === 'UDI' ? '?udi=' : '?di=')
            + encodeURIComponent(this.metadataSearch))
            .then(res => res.json())
            .then((device: AccessGUDIDDevice) => {
                if (device.error) {
                    return this.metadataSearchResult = null;
                }
                this.metadataSearchResult = device;
                this.addDevice(device);
            }, () => this.metadataSearchResult = null);
    }

    addDevice(accessgudid: AccessGUDIDDevice) {
        const addDI = () => this.nativeFe.formElement.metadataTags!.push({key: 'device', value: accessgudid});
        if (!this.nativeFe.formElement.metadataTags) { this.nativeFe.formElement.metadataTags = []; }
        if (this.nativeFe.metadataTagsNew === 'UDI') {
            fetch(ACCESSGUDID_PARSEUDI + encodeURIComponent(this.metadataSearch!.trim()))
                .then(res => res.json())
                .then(udi => {
                    if (!udi.error) {
                        accessgudid.udi = udi;
                    }
                })
                .finally(addDI);
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
