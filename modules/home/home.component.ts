import { Component, HostListener } from '@angular/core';
import { TourService } from 'home/tour.service';

@Component({
    selector: 'cde-home',
    styles: [`
        .sectionPage {
            /*min-height: 100vh;*/
        }
        .slideContent {
            display: block;
            margin: auto;
            height: 500px;
        }
        .carousel-caption {
            background-color: rgba(255, 255, 255, .8);
            color: #000;
            text-shadow: none;
        }
        .carousel-caption h3 {
            font-weight: 900;
        }
        :host >>> .carousel-control-next, :host >>> .carousel-control-prev {
            display: none;
            /*background-color: #eee;*/
            /*width: 10%;*/
        }
        :host >>> .carousel-indicators li {
            background-color: #fff;
            border: 1px solid #0275d8;
        }
        :host >>> .carousel-indicators li.active {
            background-color: #0275d8;
        }
    `],
    templateUrl: 'home.component.html'
})

export class HomeComponent {
    displayCarousel: Boolean = (window.screen.width > 575);

    @HostListener('window:resize', ['$event'])
    onResize(event) {
        this.displayCarousel = (window.screen.width > 575);
    }

    takeATour() {
        TourService.takeATour();
    }

}
