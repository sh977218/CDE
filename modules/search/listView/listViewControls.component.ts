import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'cde-list-view-controls',
    templateUrl: './listViewControls.component.html',
})
export class ListViewControlsComponent {
    @Input() listView!: 'summary' | 'table';
    @Output() listViewChange = new EventEmitter<string>();

    constructor() {}
}
