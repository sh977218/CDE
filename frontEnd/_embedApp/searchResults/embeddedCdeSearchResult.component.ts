import { Component, Input } from '@angular/core';
import { DataElementElastic } from 'shared/de/dataElement.model';
import { Embed, UserSearchSettings } from 'shared/models.model';

@Component({
    selector: 'cde-embedded-cde-search-result',
    templateUrl: 'embeddedCdeSearchResult.component.html'
})
export class EmbeddedCdeSearchResultComponent {
    @Input() elts!: DataElementElastic[];
    @Input() embed!: Embed;
    @Input() searchViewSettings!: UserSearchSettings;

    lfLimit = 3;

    clLimit = 3;

    concatenatePVs(elt: DataElementElastic) {
        return elt.valueDomain.datatype === 'Value List' && elt.valueDomain.permissibleValues
            .map(a => a.permissibleValue).join(',');
    }

    raiseLfLimit() {
        return this.lfLimit = 100;
    }

    lowerLfLimit() {
        return this.lfLimit = 3;
    }

    raiseClLimit() {
        return this.clLimit = 100;
    }

    lowerClLimit() {
        return this.clLimit = 3;
    }
}
