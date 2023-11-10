import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Article } from 'shared/article/article.model';

@Component({
    selector: 'cde-shutdown-banner',
    templateUrl: 'shutdownBanner.component.html',
    styleUrls: ['./shutdownBanner.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShutdownBannerComponent {
    shutdownBannerContent$: Observable<Article>;

    bannerClosed = false;

    constructor(httpClient: HttpClient) {
        this.shutdownBannerContent$ = httpClient.get<Article>('/server/article/shutdownBanner').pipe();
    }
}
