import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'cde-datasets',
    templateUrl: './datasets.component.html',
})
export class DatasetsComponent implements OnInit {
    @Input() public elt: any;
    dataSets;

    ngOnInit(): void {
        this.dataSets = this.elt.dataSets;
    }
}
