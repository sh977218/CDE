import { Component, HostListener, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { Router } from '@angular/router';
import { UserService } from '_app/user.service';

@Component({
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent {
    @ViewChild('drawer', { static: true }) drawer!: MatSidenav;
    isMobile: boolean = window.innerWidth < 576;
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
        this.isMobile = window.innerWidth < 576;
    }

    scrollTop() {
        window.scrollTo(0, 0);
    }
}
