import { Component, HostListener, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '_app/user.service';
import { MatSidenav } from '@angular/material/sidenav';

@Component({
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent {
    @ViewChild('drawer', { static: true }) drawer!: MatSidenav;
    isMobile: boolean = window.innerWidth <= 575;
    opened: boolean = true;

    constructor(private router: Router, public userSvc: UserService) {
        router.events.subscribe(val => {
            if (this.isMobile) {
                this.drawer.close();
            }
        });
    }

    @HostListener('window:resize', ['$event'])
    onResize() {
        this.isMobile = window.innerWidth <= 575;
    }

    scrollTop() {
        window.scrollTo(0, 0);
    }
}
