import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, HostListener, OnDestroy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '_app/user.service';
import { ScrollService } from 'angular-aio-toc/scroll.service';
import { TocService } from 'angular-aio-toc/toc.service';
import { Article } from 'shared/article/article.model';
import { ScrollSpyService } from '../angular-aio-toc/scroll-spy.service';
import { NgIf } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { TocModule } from '../angular-aio-toc/toc.module';
import { MatIconModule } from '@angular/material/icon';
import { SafeHtmlPipe } from '../non-core/pipes/safeHtml.pipe';

@Component({
    selector: 'cde-guide',
    templateUrl: 'guide.component.html',
    styleUrls: ['guide.component.scss', '../cde/dataElementView/view.style.scss'],
    providers: [TocService, ScrollService, ScrollSpyService],
    imports: [NgIf, MatSidenavModule, TocModule, MatIconModule, SafeHtmlPipe, RouterLink],
    standalone: true,
})
export class GuideComponent implements OnDestroy, AfterViewInit {
    article?: Article;
    isMobile = false;

    constructor(
        private http: HttpClient,
        private router: Router,
        private scrollService: ScrollService,
        private tocService: TocService,
        public userService: UserService
    ) {
        this.http.get<Article>(`/server/article/guides`).subscribe(a => (this.article = a));
        this.onResize();
    }

    ngAfterViewInit(): void {
        this.renderToc();
    }

    ngOnDestroy() {
        this.tocService.reset();
    }

    @HostListener('window:resize', [])
    onResize() {
        this.isMobile = window.innerWidth < 768; // size md
    }

    renderToc() {
        setTimeout(() => {
            let path = this.router.url;
            const loc = path.indexOf('#');
            if (loc !== -1) {
                path = path.substr(0, loc);
            }
            const elementList = document.getElementsByTagName('main');
            this.tocService.genToc(elementList[0], path);
            this.scrollService.scroll();
        }, 2000);
    }
}
