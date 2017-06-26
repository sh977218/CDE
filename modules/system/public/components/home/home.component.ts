import { Component, Inject } from "@angular/core";
import { TourService } from "../../../../core/public/tour.service";

@Component({
    selector: "cde-home",
    templateUrl: "home.component.html"
})

export class HomeComponent {

    constructor(@Inject("TourService") TourService) {
    }

    takeATour() {
        TourService.takeATour();
    }
}