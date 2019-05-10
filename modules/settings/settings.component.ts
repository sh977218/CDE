import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '_app/user.service';

@Component({
    templateUrl: './settings.component.html',
    styles: [`
        mat-list-item {
            cursor: pointer;
        }

        mat-list-item:hover {
            border: solid lightgray;
            background-color: lightgray;
        }

        ul {
            list-style: none;
        }

        .is-active {
            background-color: #c4d2e7;
        }

        .settingsContent {
            border-width: 0 0 1px 1px;
            border-style: solid
        }
    `]
})
export class SettingsComponent {
    constructor(private route: ActivatedRoute,
                public userSvc: UserService) {}

    scrollTop() {
        window.scrollTo(0, 0);
    }

}