import { Component } from '@angular/core';
import { UserService } from '_app/user.service';
import { User } from 'shared/models.model';

@Component({
    templateUrl: './searchSettings.component.html',
    styleUrls: ['./searchSettings.component.scss']
})
export class SearchSettingsComponent {
    constructor(
        public userService: UserService
    ) {
    }

    get user(): User | undefined {
        return this.userService.user;
    }

    get viewDrafts(): boolean {
        return this.user?.viewDrafts || false;
    }

    set viewDrafts(value: boolean) {
        if (this.user) {
            this.user.viewDrafts = value;
            this.userService.save();
        }
    }
}
