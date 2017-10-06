import { Component } from '@angular/core';
import { TourService } from 'core/public/tour.service';

import 'responsive-carousel/src/responsive-carousel.css';
import 'responsive-carousel/src/responsive-carousel.slide.css';
import './carousel.css';
import 'responsive-carousel/src/responsive-carousel.js';
import 'responsive-carousel/src/responsive-carousel.keybd.js';
import 'responsive-carousel/src/responsive-carousel.autoplay.js';
import 'responsive-carousel/src/responsive-carousel.touch.js';
import 'responsive-carousel/src/responsive-carousel.drag.js';
import 'responsive-carousel/src/responsive-carousel.autoinit.js';
import 'responsive-carousel/src/globalenhance.js';

@Component({
    selector: 'cde-home',
    providers: [TourService],
    styles: [`
        .bordered-tab {
            border: 1px solid;
            border-color: #fff #ddd #ddd;
            border-radius: 0 0 4px 4px
        }
    `],
    templateUrl: 'home.component.html'
})
export class HomeComponent {
    statsType = 'Forms';

    takeATour() {
        TourService.newTour();
    }
}