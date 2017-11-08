import { Component, EventEmitter, Input, Output } from '@angular/core';
import { UserService } from '_app/user.service';

@Component({
    selector: 'cde-search-export-button',
    templateUrl: './searchExportButton.component.html'
})
export class SearchExportButtonComponent {
    @Input() module: string;
    @Output() exportType = new EventEmitter<string>();

    constructor(public userService: UserService) {}
}
