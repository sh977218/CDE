import { Component, HostListener, OnInit } from '@angular/core';
import { TourService } from 'home/tour.service';
import { ActivatedRoute, Router } from '@angular/router';

import './home.scss';

@Component({
    selector: 'cde-home',
    templateUrl: 'home.component.html'
})
export class HomeComponent implements OnInit {
    displayCarousel = (window.screen.width > 575);

    @HostListener('window:resize', ['$event'])
    onResize(event: UIEvent) {
        this.displayCarousel = (window.screen.width > 575);
    }

    constructor(private route: ActivatedRoute,
                private router: Router) {
    }

    ngOnInit() {
        if (this.route.snapshot.queryParams.tour) {
            this.takeATour();
            this.router.navigate(['/server/system/home']);
        } else if (this.route.snapshot.queryParams.notifications !== undefined) {
            this.router.navigate(['/home']);
        }
    }

    takeATour() {
        TourService.takeATour();
    }
}
