import { Component } from '@angular/core';

@Component({
    selector: 'cde-resources-rss',
    templateUrl: './resourcesRss.component.html',
    styles: [`
        .rssHeader {
            background: rgba(0, 0, 0, .03);
        }
    `]
})
export class ResourcesRssComponent {

    rssFeed: any = {};

}
