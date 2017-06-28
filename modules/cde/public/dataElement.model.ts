import { Elt } from "core/public/models.model";

export class DataElement extends Elt {
    primaryNameCopy: string;

    getEltUrl() {
        return "/deview?tinyId=" + this.tinyId;
    }

    getLabel() {
        return this.primaryNameCopy;
    }
}