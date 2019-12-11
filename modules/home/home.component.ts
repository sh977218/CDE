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
    slideIndex: number = 1;

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


    plusSlides(n: number) {
        this.showSlides(this.slideIndex += n);
    }

    currentSlide(n: number) {
        this.showSlides(this.slideIndex = n);
    }

    showSlides(n: number) {
        let i;
        const slides: any = document.getElementsByClassName('mySlides');
        const dots: any = document.getElementsByClassName('dot');
        if (n > slides.length) {
            this.slideIndex = 1;
        }
        if (n < 1) {
            this.slideIndex = slides.length;
        }
        for (i = 0; i < slides.length; i++) {
            slides[i].style.display = 'none';
        }
        for (i = 0; i < dots.length; i++) {
            dots[i].className = dots[i].className.replace(' active', '');
        }
        slides[this.slideIndex - 1].style.display = 'block';
        dots[this.slideIndex - 1].className += ' active';
    }
}
