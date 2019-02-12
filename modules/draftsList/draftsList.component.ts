import { Component } from '@angular/core';
import { DataService, Drafts } from 'shared/models.model';

@Component({
    selector: 'cde-drafts-list',
    templateUrl: './draftsList.component.html'
})
export class DraftsListComponent {
    drafts?: Drafts;

    constructor(private dataService: DataService) {
        dataService.getDrafts().subscribe(r => this.drafts = r);
    }
}
