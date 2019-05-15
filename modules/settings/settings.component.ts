import { Component } from '@angular/core';
import { UserService } from '_app/user.service';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
    templateUrl: './settings.component.html',
    styles: [`
        mat-list-item {
            cursor: pointer;
            height: 20px !important;
            font-size: 12px !important;
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
    options: FormGroup;
    opened: boolean = true;

    constructor(fb: FormBuilder,
                public userSvc: UserService) {
        this.options = fb.group({
            bottom: 0,
            fixed: false,
            top: 0
        });
    }

    showFiller = false;

    scrollTop() {
        window.scrollTo(0, 0);
    }

}