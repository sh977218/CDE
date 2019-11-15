import { Component, HostListener, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material';
import { Router } from '@angular/router';
import { UserService } from '_app/user.service';

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
    @ViewChild('drawer', {static: false}) drawer!: MatSidenav;
    isMobile: boolean = (window.screen.width <= 575);
    opened: boolean = true;

    constructor(private router: Router,
                public userSvc: UserService) {
        router.events.subscribe(val => {
            if (this.isMobile) {
                this.drawer.close();
            }
        });
    }

    @HostListener('window:resize', ['$event'])
    onResize() {
        this.isMobile = (window.screen.width <= 575);
    }

    scrollTop() {
        window.scrollTo(0, 0);
    }
}
