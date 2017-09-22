import { Component, Input, ViewChild } from "@angular/core";
import { NgbModalModule, NgbModal, NgbActiveModal, NgbModalRef, } from "@ng-bootstrap/ng-bootstrap";
import { IsAllowedService } from 'core/public/isAllowed.service';

@Component({
    selector: "cde-concepts",
    providers: [NgbActiveModal],
    templateUrl: "./concepts.component.html"
})
export class ConceptsComponent {

    @ViewChild("newConceptContent") public newConceptContent: NgbModalModule;
    public modalRef: NgbModalRef;
    @Input() public elt: any;

    constructor(public isAllowedModel: IsAllowedService,
                public modalService: NgbModal) {
    }

    newConcept: { name?: string, originId?: string, origin: string, type: string } = {origin: "LOINC", type: "dec"};

    conceptConfigurations = [
        {
            type: "dataElementConcept",
            details: {display: "Data Element Concept", path: "dataElementConcept.concepts.name"}
        },
        {
            type: "objectClass",
            details: {display: "Object Class", path: "objectClass.concepts.name"}
        },
        {
            type: "property",
            details: {display: "Property", path: "property.concepts.name"}
        }];

    addNewConcept() {
        if (!this.elt.dataElementConcept) this.elt.dataElementConcept = {};
        if (this.newConcept.type === "dec") {
            if (!this.elt.dataElementConcept.concepts) this.elt.dataElementConcept.concepts = [];
            this.elt.dataElementConcept.concepts.push(this.newConcept);
        } else if (this.newConcept.type === "prop") {
            if (!this.elt.property.concepts) this.elt.property.concepts = [];
            this.elt.property.concepts.push(this.newConcept);
        } else if (this.newConcept.type === "oc") {
            if (!this.elt.objectClass.concepts) this.elt.objectClass.concepts = [];
            this.elt.objectClass.concepts.push(this.newConcept);
        }
        this.elt.unsaved = true;
        this.modalRef.close();
    }

    openNewConceptModal() {
        this.modalRef = this.modalService.open(this.newConceptContent, {size: "lg"});
        this.newConcept = {origin: "LOINC", type: "dec"};
    }

    dataElementConceptRemoveConcept(index) {
        this.elt.dataElementConcept.concepts.splice(index, 1);
        this.elt.unsaved = true;
    }

    objectClassRemoveConcept(index) {
        this.elt.objectClass.concepts.splice(index, 1);
        this.elt.unsaved = true;
    }

    propertyRemoveConcept(index) {
        this.elt.property.concepts.splice(index, 1);
        this.elt.unsaved = true;
    }

    relatedCdes(concept, config) {
        window.location.href = "/cde/search?q=" + config.details.path + `:"` + concept + `"`;
    }

    removeConcept(type, i) {
        this[type + "RemoveConcept"](i);
    }
}
