import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbTabset } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'cde-site-management',
    templateUrl: './siteManagement.component.html'
})
export class SiteManagementComponent implements OnInit {
    @ViewChild('tabs') private tabs!: NgbTabset;

    constructor(private route: ActivatedRoute) {

    }

    ngOnInit() {
        setTimeout(() => {
            if (this.route.snapshot.queryParams['tab']) {
                let tab = this.route.snapshot.queryParams['tab'];
                console.log(tab);
                this.tabs.select(tab);
            }
        }, 0);
    }
}
