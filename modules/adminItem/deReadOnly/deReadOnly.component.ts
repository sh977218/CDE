import { Component, Input } from '@angular/core';
import { Concept, DataElement } from 'shared/de/dataElement.model';
import { Item } from 'shared/models.model';
import { concat } from 'shared/array';
import { Router } from '@angular/router';

type ConceptTypes = 'dataElementConcept' | 'objectClass' | 'property';
interface Config {
    type: ConceptTypes;
    details: {
        display: string;
        path: string;
    };
}

@Component({
    selector: 'cde-de-readonly[de]',
    templateUrl: './deReadOnly.component.html',
})
export class DeReadOnlyComponent {
    @Input() de!: DataElement;
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

    constructor(private router: Router) {}

    deGetAllConcepts(de: Partial<DataElement>): Concept[] {
        return concat(
            de.dataElementConcept?.concepts || [],
            de?.objectClass?.concepts || [],
            de?.property?.concepts || []
        );
    }

    getQuestionText(elt: Item): string {
        return (
            elt.designations.find(d => d.tags && d.tags.indexOf('Preferred Question Text') > -1)?.designation ||
            elt.designations.find(d => d.tags && d.tags.indexOf('Question Text') > -1)?.designation ||
            ''
        );
    }

    relatedCdes(concept: string, config: Config) {
        this.router.navigate(['/cde/search'], {
            queryParams: { q: config.details.path + ':"' + concept + '"' },
        });
    }
}
