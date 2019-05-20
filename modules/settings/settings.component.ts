import { Component, HostListener, ViewChild } from '@angular/core';
import { UserService } from '_app/user.service';
import { Router } from "@angular/router";
import { MatSidenav } from "@angular/material";

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

        .isActive {
            background-color: #c4d2e7;
        }

        .settingsContainer {
            min-height: 700px;
        }
    `]
})
export class SettingsComponent {
    @ViewChild('drawer') drawer: MatSidenav;
    opened: boolean = true;

    isMobile: Boolean = (window.screen.width <= 575);

    @HostListener('window:resize', ['$event'])
    onResize() {
        this.isMobile = (window.screen.width <= 575);
    }

    constructor(private router: Router,
                public userSvc: UserService) {
        router.events.subscribe(val => {
            if (this.isMobile) {
                this.drawer.close();
            }
        });
    }

    scrollTop() {
        window.scrollTo(0, 0);
    }

}