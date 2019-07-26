import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UserService } from '_app/user.service';

@Component({
    selector: 'cde-search-export-button',
    templateUrl: './searchExportButton.component.html'
})
export class SearchExportButtonComponent implements OnInit {
    @Input() module!: string;
    @Output() exportType = new EventEmitter<string>();
    exportOptions?: {id: string, label: string}[];

    constructor(public userService: UserService) {}

    ngOnInit() {
        if (this.module === 'cde') {
            this.exportOptions = [
                {id: 'csv', label: 'CSV File'},
                {id: 'json', label: 'JSON File'},
                {id: 'xml', label: 'XML File'}
            ];
        } else if (this.module === 'form') {
            if (this.userService.user) {
                this.exportOptions = [
                    {id: 'json', label: 'JSON File'},
                    {id: 'xml', label: 'XML File'}
                ];
            } else {
                this.exportOptions = [{id: 'noLogin', label: 'Please login to export forms.'}];
            }
        }
    }
}
