import { Component, EventEmitter, Input, Output, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';
import { Router } from '@angular/router';
import { assertUnreachable } from 'shared/models.model';

type ConceptTypes = 'dataElementConcept' | 'objectClass' | 'property';

interface Config {
    type: ConceptTypes;
    details: {
        display: string,
        path: string,
    };
}

@Component({
    selector: 'cde-concepts',
    templateUrl: './concepts.component.html'
})
export class ConceptsComponent {
    @Input() public elt: any;
    @Input() public canEdit = false;
    @Output() eltChange = new EventEmitter();
    @ViewChild('newConceptContent') newConceptContent!: TemplateRef<any>;
    conceptConfigurations: Config[] = [
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
    modalRef!: MatDialogRef<TemplateRef<any>>;
    newConcept: { name?: string, originId?: string, origin: string, type: string } = {origin: 'LOINC', type: 'dec'};

    constructor(public dialog: MatDialog,
                private router: Router) {}

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
        this.eltChange.emit();
        this.modalRef.close();
    }

    openNewConceptModal() {
        this.newConcept = {origin: 'LOINC', type: 'dec'};
        this.modalRef = this.dialog.open(this.newConceptContent);
    }

    dataElementConceptRemoveConcept(index: number) {
        this.elt.dataElementConcept.concepts.splice(index, 1);
        this.eltChange.emit();
    }

    objectClassRemoveConcept(index: number) {
        this.elt.objectClass.concepts.splice(index, 1);
        this.eltChange.emit();
    }

    propertyRemoveConcept(index: number) {
        this.elt.property.concepts.splice(index, 1);
        this.eltChange.emit();
    }

    relatedCdes(concept: string, config: Config) {
        this.router.navigate(['/cde/search'], {queryParams: {q: config.details.path + ':"' + concept + '"'}});
    }

    removeConcept(type: ConceptTypes, i: number) {
        switch (type) {
            case 'dataElementConcept':
                this.dataElementConceptRemoveConcept(i);
                break;
            case 'objectClass':
                this.objectClassRemoveConcept(i);
                break;
            case 'property':
                this.propertyRemoveConcept(i);
                break;
            default:
                throw assertUnreachable(type);
        }
    }
}
