import { Component, EventEmitter, Inject, Input, Output } from "@angular/core";

@Component({
    selector: 'cde-search-export-button',
    templateUrl: './searchExportButton.component.html'
})
export class SearchExportButtonComponent {
    @Input() module: string;
    @Output() exportType = new EventEmitter<string>();

    constructor(@Inject('userResource') public userService) {}
}
