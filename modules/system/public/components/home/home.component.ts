import { Component } from "@angular/core";
import { TourService } from "core/public/tour.service";
import { Router } from '@angular/router';

@Component({
    selector: "cde-home",
    providers: [TourService],
    templateUrl: "home.component.html"
})

export class HomeComponent {
    constructor(private router: Router) {
    }

    takeATour() {
        TourService.newTour(this.router);
    }
}