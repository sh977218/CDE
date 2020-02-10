import { Component, HostListener, OnInit, ViewEncapsulation } from '@angular/core';
import { TourService } from 'home/tour.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
    selector: 'cde-home',
    templateUrl: 'home.component.html',
    encapsulation: ViewEncapsulation.None,
    styles: [`
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

        .carousel-control-next, .carousel-control-prev {
            display: none;
            /*background-color: #eee;*/
            /*width: 10%;*/
        }

        .carousel-indicators > li {
            height: 10px;
        }

        .carousel-indicators li {
            background-color: #fff;
            border: 1px solid #0275d8;
        }

        .carousel-indicators li.active {
            background-color: #0275d8;
        }
    `]
})
export class HomeComponent implements OnInit {
    displayCarousel = (window.screen.width > 575);
    images = [{
        src: '/cde/public/assets/img/slides/min/discuss.png',
        alt: 'Discuss',
        h3: 'Search, Discuss and Collaborate'
    }, {
        src: '/cde/public/assets/img/slides/min/drafting.png',
        alt: 'Draft of a Form',
        h3: 'Create, Draft and Share'
    }, {
        src: '/cde/public/assets/img/slides/min/compare.png',
        alt: 'More Like This',
        h3: 'Compare and Harmonize'
    }, {
        src: '/cde/public/assets/img/slides/min/history.png',
        alt: 'History',
        h3: 'Track Changes Across Versions'
    }, {
        src: '/cde/public/assets/img/slides/min/tobacco.png',
        alt: 'Screenshot of finding and using forms',
        h3: 'Export and Publish in Multiple Formats'
    }];

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
            this.router.navigate(['/home']);
        } else if (this.route.snapshot.queryParams.notifications !== undefined) {
            this.router.navigate(['/home']);
        }
    }

    takeATour() {
        TourService.takeATour();
    }
}
