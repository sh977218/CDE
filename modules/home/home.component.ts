import { HttpClient } from '@angular/common/http';
import { Component, HostListener, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '_app/user.service';
import { environment } from 'environments/environment';
import { HomepageGetResponse } from 'shared/boundaryInterfaces/API/system';
import { assertUnreachable } from 'shared/models.model';
import { SearchSettings, SearchType } from 'shared/search/search.model';
import { hasRole } from 'shared/security/authorizationShared';
import { UpdateCard } from 'shared/singleton.model';

const mobileWidth = 699;

@Component({
    selector: 'cde-home',
    templateUrl: 'home.component.html',
    styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
    @Input() updates?: UpdateCard[];
    cdeSearchTerm!: string;
    featureSelected: 'explore' | 'learn' | 'submit' = 'explore';
    isMobile: boolean = window.innerWidth <= mobileWidth;
    searchType: SearchType = 'cde';

    constructor(
        private route: ActivatedRoute,
        private http: HttpClient,
        private router: Router,
        private userService: UserService
    ) {}

    ngOnInit() {
        if (this.route.snapshot.queryParams.tour) {
            this.router.navigate(['/home']);
        } else if (this.route.snapshot.queryParams.notifications !== undefined) {
            this.router.navigate(['/home']);
        }

        if (!this.updates) {
            this.http
                .get<HomepageGetResponse>('/server/home')
                .toPromise()
                .then(homeData => {
                    this.updates = homeData && Array.isArray(homeData?.body?.updates) ? homeData.body.updates : [];
                });
        }
    }

    canEdit(): boolean {
        return hasRole(this.userService.user, 'NlmCurator');
    }

    getCardImage(image: NonNullable<UpdateCard['image']>): string {
        return environment.publicUrl + '/server/system/data/' + image.fileId;
    }

    getSearchLabel(searchType: SearchType): string {
        switch (searchType) {
            case 'endorsedCde':
                return 'NIH-Endorsed CDEs';
            case 'cde':
                return 'All CDEs';
            case 'form':
                return 'Forms';
            default:
                throw assertUnreachable(searchType);
        }
    }

    @HostListener('window:resize', [])
    onResize() {
        this.isMobile = window.innerWidth <= mobileWidth;
    }

    search() {
        const query: Partial<SearchSettings> = { q: this.cdeSearchTerm };
        if (this.searchType === 'endorsedCde') {
            query.nihEndorsed = true;
        }
        this.router.navigate([getSearchUrl(this.searchType)], {
            queryParams: query,
        });
    }
}

function getSearchUrl(searchType: SearchType): string {
    switch (searchType) {
        case 'cde':
        case 'endorsedCde':
            return '/cde/search';
        case 'form':
            return '/form/search';
        default:
            throw assertUnreachable(searchType);
    }
}
