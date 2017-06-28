import { Component, Inject } from "@angular/core";
import { TourService } from "../../../../core/public/tour.service";

@Component({
    selector: "cde-home",
    providers: [TourService],
    templateUrl: "home.component.html"
})

export class HomeComponent {
}