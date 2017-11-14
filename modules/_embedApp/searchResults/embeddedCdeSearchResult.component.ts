import { Component, Input } from '@angular/core';

@Component({
    selector: "cde-embedded-cde-search-result",
    templateUrl: "embeddedCdeSearchResult.component.html"
})
export class EmbeddedCdeSearchResultComponent {

    @Input() elts;
    @Input() searchViewSettings;
    @Input() embed;

    concatenatePVs (elt) {
        return elt.valueDomain.permissibleValues.map(a => a.permissibleValue).join(",");
    };

    lfLimit = 3;
    raiseLfLimit () {
        return this.lfLimit = 100;
    }
    lowerLfLimit () {
        return this.lfLimit = 3;
    };
    clLimit = 3;
    raiseClLimit () {
        return this.clLimit = 100;
    }
    lowerClLimit () {
        return this.clLimit = 3;
    };

}