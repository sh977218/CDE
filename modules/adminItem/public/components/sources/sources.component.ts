import { Component, Input } from '@angular/core';
import { UserService } from '_app/user.service';
import { isSiteAdmin } from 'shared/system/authorizationShared';


@Component({
    selector: 'cde-admin-item-sources',
    templateUrl: './sources.component.html'
})
export class SourcesComponent {
    @Input() elt: any;

    showSourceJson = false;

    constructor(public userService: UserService) {
        this.showSourceJson = isSiteAdmin(userService.user);
    }

    allowSources = ['NINDS'];
}
