import { Component, EventEmitter, Input, Output } from "@angular/core";
import { User } from "core/public/models.model";

@Component({
    selector: 'cde-search-export-button',
    templateUrl: './searchExportButton.component.html'
})
export class SearchExportButtonComponent {
    @Input() module: string;
    @Input() user: User;
    @Output() exportType = new EventEmitter<string>();

    constructor() {}
}
