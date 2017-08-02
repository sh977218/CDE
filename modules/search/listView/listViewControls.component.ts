import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'cde-list-view-controls',
    templateUrl: './listViewControls.component.html',
})
export class ListViewControlsComponent {
    @Input() embedded = false;
    @Input() listView: string;
    @Input() module: string;
    @Output() listViewChange = new EventEmitter<string>();

    constructor() {}
}
