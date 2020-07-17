import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TourService } from 'home/tour.service';

@Component({
    selector: 'cde-home',
    templateUrl: 'home.component.html',
    encapsulation: ViewEncapsulation.None,
    styles: [`
        .center {
            display: block;
            margin-left: auto;
            margin-right: auto;
            width: 50%;
        }
    `]
})
export class HomeComponent implements OnInit {
    cdeSearchTerm!: string;
    searchForm = false;

    constructor(private route: ActivatedRoute,
                private router: Router) {
    }

    ngOnInit() {
        this.route.queryParams.subscribe(params => {
            if (params.tour) {
                this.takeATour();
            }
        });

        if (this.route.snapshot.queryParams.tour) {
            this.router.navigate(['/home']);
        } else if (this.route.snapshot.queryParams.notifications !== undefined) {
            this.router.navigate(['/home']);
        }
    }

    search() {
        this.router.navigate([`/${this.searchForm ? 'form' : 'cde'}/search`], {queryParams: {q: this.cdeSearchTerm}});
    }

    takeATour() {
        TourService.takeATour();
    }
}
