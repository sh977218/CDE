import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AddConceptModalComponent } from 'cde/concepts/add-concept-modal/add-concept-modal.component';
import { concat } from 'shared/array';
import { Concept, DataElement } from 'shared/de/dataElement.model';
import { assertUnreachable } from 'shared/models.model';

type ConceptTypes = 'dataElementConcept' | 'objectClass' | 'property';

interface Config {
    type: ConceptTypes;
    details: {
        display: string;
        path: string;
    };
}

@Component({
    selector: 'cde-concepts',
    templateUrl: './concepts.component.html',
})
export class ConceptsComponent {
    @Input() public elt!: DataElement;
    @Input() public canEdit = false;
    @Output() eltChange = new EventEmitter();
    conceptConfigurations: Config[] = [
        {
            type: 'dataElementConcept',
            details: {
                display: 'Data Element Concept',
                path: 'dataElementConcept.concepts.name',
            },
        },
        {
            type: 'objectClass',
            details: {
                display: 'Object Class',
                path: 'objectClass.concepts.name',
            },
        },
        {
            type: 'property',
            details: { display: 'Property', path: 'property.concepts.name' },
        },
    ];

    constructor(public dialog: MatDialog, private router: Router) {}

    addNewConcept(newConcept: Concept) {
        if (!this.elt.dataElementConcept) {
            this.elt.dataElementConcept = {};
        }
        if (newConcept.type === 'dec') {
            if (!this.elt.dataElementConcept.concepts) {
                this.elt.dataElementConcept.concepts = [];
            }
            this.elt.dataElementConcept.concepts.push(newConcept);
        } else if (newConcept.type === 'prop') {
            if (!this.elt.property.concepts) {
                this.elt.property.concepts = [];
            }
            this.elt.property.concepts.push(newConcept);
        } else if (newConcept.type === 'oc') {
            if (!this.elt.objectClass.concepts) {
                this.elt.objectClass.concepts = [];
            }
            this.elt.objectClass.concepts.push(newConcept);
        }
        this.eltChange.emit();
    }

    getAllConcepts(): Concept[] {
        return concat(
            this.elt.dataElementConcept?.concepts || [],
            this.elt.objectClass.concepts,
            this.elt.property.concepts
        );
    }

    openNewConceptModal() {
        this.dialog
            .open<AddConceptModalComponent, {}, Concept>(AddConceptModalComponent, { width: '800px' })
            .afterClosed()
            .subscribe(newConcept => {
                if (newConcept) {
                    this.addNewConcept(newConcept);
                }
            });
    }

    dataElementConceptRemoveConcept(index: number) {
        this.elt.dataElementConcept?.concepts?.splice(index, 1);
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
        this.router.navigate(['/cde/search'], {
            queryParams: { q: config.details.path + ':"' + concept + '"' },
        });
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
