import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { NgForOf, NgIf } from '@angular/common';

@Component({
    selector: 'cde-resources-rss',
    templateUrl: './resourcesRss.component.html',
    imports: [MatCardModule, NgIf, NgForOf],
    standalone: true,
})
export class ResourcesRssComponent {
    rssFeed: any = {};
}
