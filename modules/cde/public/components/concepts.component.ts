import { Component, EventEmitter, Input, Output, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material';

@Component({
    selector: 'cde-concepts',
    templateUrl: './concepts.component.html'
})
export class ConceptsComponent {

    @ViewChild('newConceptContent') public newConceptContent: TemplateRef<any>;
    public modalRef: MatDialogRef<TemplateRef<any>>;
    @Input() public elt: any;
    @Input() public canEdit = false;
    @Output() onEltChange = new EventEmitter();

    constructor(public dialog: MatDialog,
                private router: Router) {}

    newConcept: { name?: string, originId?: string, origin: string, type: string } = {origin: 'LOINC', type: 'dec'};

    conceptConfigurations = [
        {
            type: 'dataElementConcept',
            details: {display: 'Data Element Concept', path: 'dataElementConcept.concepts.name'}
        },
        {
            type: 'objectClass',
            details: {display: 'Object Class', path: 'objectClass.concepts.name'}
        },
        {
            type: 'property',
            details: {display: 'Property', path: 'property.concepts.name'}
        }];

    addNewConcept() {
        if (!this.elt.dataElementConcept) { this.elt.dataElementConcept = {}; }
        if (this.newConcept.type === 'dec') {
            if (!this.elt.dataElementConcept.concepts) { this.elt.dataElementConcept.concepts = []; }
            this.elt.dataElementConcept.concepts.push(this.newConcept);
        } else if (this.newConcept.type === 'prop') {
            if (!this.elt.property.concepts) { this.elt.property.concepts = []; }
            this.elt.property.concepts.push(this.newConcept);
        } else if (this.newConcept.type === 'oc') {
            if (!this.elt.objectClass.concepts) { this.elt.objectClass.concepts = []; }
            this.elt.objectClass.concepts.push(this.newConcept);
        }
        this.onEltChange.emit();
        this.modalRef.close();
    }

    openNewConceptModal() {
        this.newConcept = {origin: 'LOINC', type: 'dec'};
        this.modalRef = this.dialog.open(this.newConceptContent);
    }

    dataElementConceptRemoveConcept(index) {
        this.elt.dataElementConcept.concepts.splice(index, 1);
        this.onEltChange.emit();
    }

    objectClassRemoveConcept(index) {
        this.elt.objectClass.concepts.splice(index, 1);
        this.onEltChange.emit();
    }

    propertyRemoveConcept(index) {
        this.elt.property.concepts.splice(index, 1);
        this.onEltChange.emit();
    }

    relatedCdes(concept, config) {
        this.router.navigate(['/cde/search'], {queryParams: {q: config.details.path + ':"' + concept + '"'}});
    }

    removeConcept(type, i) {
        this[type + 'RemoveConcept'](i);
    }
}
